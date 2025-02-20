'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewCourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('unpublished'); // "unpublished" or "published"
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    } else {
      formData.append('thumbnail', '');
    }
    formData.append('tags', tags);
    formData.append('status', status);

    // Get the instructor id from the session
    if (sessionStatus === 'authenticated') {
      if (session && session.user) {
        formData.append('instructor', session.user.id);
      }
    } else {
      alert('You need to be logged in to create a course');
      router.push('/auth/login');
    }

    // Send request to create course
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/course`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      // reset the form
      setTitle('');
      setDescription('');
      setCategory('');
      setPrice('');
      setThumbnail(null);
      setTags('');
      setStatus('unpublished');
      setPreviewUrl(null);
      alert('Course created successfully');
      router.push('/instructor/courses');
    } else {
      alert('Failed to create course');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course Title
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Course Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course Description
          </label>
          <textarea
            value={description}
            name="description"
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md resize-none"
            rows={4}
            required
          ></textarea>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          >
            <option value="">Select a category</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Fullstack</option>
            <option value="mobile">Mobile</option>
            <option value="design">Design</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
            min="0"
            step="0.01"
          />
          <p className="text-sm text-gray-500">Set to 0 for free courses.</p>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course Thumbnail
          </label>
          <input
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="mt-1 block w-full"
          />
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Thumbnail Preview"
              width={128}
              height={128}
              className="object-cover rounded-md"
            />
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <input
            name="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma separated tags"
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>

        {/* Save as Unpublished or Publish Immediately */}
        <div>
          <span className="block text-sm font-medium text-gray-700">
            Course Status
          </span>
          <div className="mt-1 flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="unpublished"
                checked={status === 'unpublished'}
                onChange={() => setStatus('unpublished')}
                className="form-radio"
              />
              <span className="ml-2">Save as Draft</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
                className="form-radio"
              />
              <span className="ml-2">Publish Immediately</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Course
          </button>
        </div>
      </form>

      {/* Course Preview */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Course Preview</h2>
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">{title || 'Course Title'}</h3>
          <p className="text-gray-700">
            {description || 'Course description will appear here.'}
          </p>
          <p className="text-gray-500">Category: {category || 'N/A'}</p>
          <p className="text-gray-500">Price: ${price || '0.00'}</p>
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Thumbnail Preview"
              width={128}
              height={128}
              className="object-cover rounded-md"
            />
          )}
          {tags && (
            <p className="text-gray-500">
              Tags:{' '}
              {tags
                .split(',')
                .map((tag) => tag.trim())
                .join(', ')}
            </p>
          )}
          <p className="text-gray-500">
            Status: {status === 'published' ? 'published' : 'unpublished'}
          </p>
        </div>
      </div>
    </div>
  );
}
