import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';

// 注意这里的参数使用 async 解构
export async function GET(
  req: Request,
  context: { params: { certificateId: string } }
) {
  const { certificateId } = await context.params; // ✅ 这是 Next.js 15 新要求

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const cert = await Certificate.findOne({
      certificateId,
      userId: session.user.email,
    });

    if (!cert) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ certificate: cert });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
