'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { z } from 'zod';

// Define a schema for the course form data.
const formSchema = z.object({
  title: z.string().min(1, 'Course title is required'),
  description: z.string().min(1, 'Course description is required'),
  category: z.enum(['frontend', 'backend', 'fullstack', 'mobile', 'design'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Please select a valid level' }),
  }),
  price: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().nonnegative('Price must be non-negative')
  ),
  tags: z.string().optional(),
  status: z.enum(['published', 'unpublished'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
});

export default function NewCourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('unpublished'); // "unpublished" or "published"
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Error state to display validation errors for form fields
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pop up state for notification
  const [popup, setPopup] = useState<{
    message: string;
    action?: () => void;
  } | null>(null);

  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Create refs for each form field that might have an error
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const levelRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLInputElement>(null); // Attach the ref to the first one

  // Mapping of field names to refs
  const fieldRefs: { [key: string]: React.RefObject<HTMLElement | null> } = {
    title: titleRef,
    description: descriptionRef,
    category: categoryRef,
    level: levelRef,
    price: priceRef,
    thumbnail: thumbnailRef,
    tags: tagsRef,
    status: statusRef,
  };

  // Handler for thumbnail change
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setPreviewUrl(url);
    }
  };

  // Handler for closing the popup box
  const handleClosePopup = () => {
    if (popup?.action) {
      popup.action();
    }
    setPopup(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate the form data
    const result = formSchema.safeParse({
      title,
      description,
      category,
      level,
      price,
      tags,
      status,
    });

    // If validation fails, set errors and return
    if (!result.success) {
      // Map errors to an object with field names as keys and error messages as values
      const fieldErrors = result.error.errors.reduce(
        (acc, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {} as { [key: string]: string }
      );

      // Set the errors state
      setErrors(fieldErrors);

      // Define an error order for fields and scroll to the first error
      const errorOrder: string[] = [
        'title',
        'description',
        'category',
        'level',
        'price',
        'tags',
        'status',
      ];
      for (const field of errorOrder) {
        if (fieldErrors[field]) {
          const ref = fieldRefs[field];
          if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus the element if it supports focus
            if (typeof ref.current.focus === 'function') {
              ref.current.focus();
            }
            break;
          }
        }
      }

      return;
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('level', level);
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
      setPopup({
        message: 'You must be logged in to create a course',
        action: () => {
          router.push('/auth/login');
        },
      });
    }

    // Send request to create course
    const res = await fetch(`/api/course`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      // reset the form
      setTitle('');
      setDescription('');
      setCategory('');
      setLevel('');
      setPrice('');
      setThumbnail(null);
      setTags('');
      setStatus('unpublished');
      setPreviewUrl(null);
      setPopup({
        message: 'Course created successfully.',
        action: () => router.push('/instructor/courses'),
      });
    } else {
      setPopup({ message: 'Failed to create course, please try again.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Popup Modal */}
      {popup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md max-w-sm mx-auto">
            <p className="text-gray-800">{popup.message}</p>
            <button
              onClick={handleClosePopup}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course Title
          </label>
          <input
            ref={titleRef}
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Course Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course Description
          </label>
          <textarea
            ref={descriptionRef}
            value={description}
            name="description"
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md resize-none"
            rows={4}
            // required
          ></textarea>
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            ref={categoryRef}
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
            // required
          >
            <option value="">Select a category</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Fullstack</option>
            <option value="mobile">Mobile</option>
            <option value="design">Design</option>
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Level
          </label>
          <select
            ref={levelRef}
            name="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
            // required
          >
            <option value="">Select a level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {errors.level && (
            <p className="text-red-600 text-sm mt-1">{errors.level}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price ($)
          </label>
          <input
            ref={priceRef}
            type="number"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
            min="0"
            step="0.01"
          />
          <p className="text-sm text-gray-500">Set to 0 for free courses.</p>
          {errors.price && (
            <p className="text-red-600 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course Thumbnail
          </label>
          <input
            ref={thumbnailRef}
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
            ref={tagsRef}
            name="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma separated tags"
            className="mt-1 block w-full p-2 border rounded-md"
          />
          {errors.tags && (
            <p className="text-red-600 text-sm mt-1">{errors.tags}</p>
          )}
        </div>

        {/* Save as Unpublished or Publish Immediately */}
        <div>
          <span className="block text-sm font-medium text-gray-700">
            Course Status
          </span>
          <div className="mt-1 flex items-center space-x-4" ref={statusRef}>
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
          {errors.status && (
            <p className="text-red-600 text-sm mt-1">{errors.status}</p>
          )}
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
          <p className="text-gray-500">Level: {level || 'N/A'}</p>
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
