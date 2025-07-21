import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = path.extname(file.name);
    const fileName = `${timestamp}-${randomString}${fileExtension}`;

    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'test-cases'
    );
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/test-cases/${fileName}`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileUrl: fileUrl,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // 只允许 /api/upload/presign 路径
  if (!request.nextUrl.pathname.endsWith('/presign')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing fileName or fileType' }, { status: 400 });
    }
    // 读取S3配置
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    const Bucket = process.env.AWS_S3_BUCKET!;
    const Key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket,
      Key,
      ContentType: fileType,
      ACL: 'public-read',
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrl = `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
    return NextResponse.json({ url, publicUrl, key: Key });
  } catch (error) {
    console.error('Presign error:', error);
    return NextResponse.json({ error: 'Failed to generate presigned url' }, { status: 500 });
  }
}
