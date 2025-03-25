'use client';

import { useState, useRef, ChangeEvent, useEffect, RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { courseSchema } from '@/lib/validation/courseSchema';

import InputField from '@/components/instructor/CreateCoursePage/InputField';
import SelectField from '@/components/instructor/CreateCoursePage/SelectField';
import FileInput from '@/components/instructor/CreateCoursePage/FileInput';
import RadioGroup from '@/components/instructor/CreateCoursePage/RadioGroup';
import CoursePreview from '@/components/instructor/CreateCoursePage/CoursePreview';
import PopupModal, { PopupProps } from '@/components/ui/PopupModal';
import TextareaField from '@/components/instructor/CreateCoursePage/TextareaField';

export default function NewCourseForm() {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'unpublished' | 'published'>(
    'unpublished'
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Error state to display validation errors for form fields
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // For fetch category/level options
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [levelOptions, setLevelOptions] = useState<string[]>([]);

  // Popup state
  const [popup, setPopup] = useState<PopupProps | null>(null);

  // Hooks
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Refs for form fields
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const levelRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Mapping of field names to refs
  const fieldRefs: { [key: string]: RefObject<HTMLElement | null> } = {
    title: titleRef,
    description: descriptionRef,
    category: categoryRef,
    level: levelRef,
    price: priceRef,
    thumbnail: thumbnailRef,
    tags: tagsRef,
    status: statusRef,
  };

  // Fetch category and level options
  useEffect(() => {
    async function fetchOptions() {
      try {
        // Category
        const categoryRes = await fetch('/api/category');
        if (!categoryRes.ok) {
          throw new Error('Failed to load categories');
        }
        const {
          categories: [{ category }],
        } = await categoryRes.json();
        setCategoryOptions(category);

        // Level
        const levelRes = await fetch('/api/level');
        if (!levelRes.ok) {
          throw new Error('Failed to load levels');
        }
        const {
          levels: [{ level }],
        } = await levelRes.json();
        setLevelOptions(level);
      } catch (error: unknown) {
        setPopup({
          message: `${(error as Error).message}. Please try again later.`,
          type: 'error',
          onClose: () => {
            window.location.reload();
            setPopup(null);
          },
        });
      }
    }

    fetchOptions();
  }, []);

  // Handle for thumbnail change
  function handleThumbnailChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setPreviewUrl(url);
    } else {
      setThumbnail(null);
      setPreviewUrl(null);
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    // Prevent default form submission
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Zod schema for validation
    const formschema = courseSchema(categoryOptions, levelOptions);

    // Validate data
    const result = formschema.safeParse({
      title,
      description,
      category,
      level,
      price,
      thumbnail,
      tags,
      status,
    });

    // If validation fails, set errors and scroll to display first error
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = result.error.errors.reduce(
        (acc: { [key: string]: string }, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {}
      );
      setErrors(fieldErrors);

      // Define an error order and scroll to the first error
      const errorOrder = [
        'title',
        'description',
        'category',
        'level',
        'price',
        'thumbnail',
        'tags',
        'status',
      ];
      for (const field of errorOrder) {
        if (fieldErrors[field]) {
          const ref: RefObject<HTMLElement | null> = fieldRefs[field];
          if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus to the element if it supports focus
            if (typeof ref.current.focus === 'function') {
              ref.current.focus();
            }
            break;
          }
        }
      }
      return;
    }

    // If user not logged in, redirect to login page
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      setPopup({
        message: 'You must be logged in to create a course.',
        type: 'error',
        onClose: () => {
          router.push('/auth/login');
          setPopup(null);
        },
      });
      return;
    }

    // Prepare FormData
    const formData: FormData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('level', level);
    formData.append('price', price);
    formData.append('thumbnail', thumbnail as File);
    formData.append('tags', tags);
    formData.append('status', status);
    formData.append('instructor', session.user.id);

    // API request to create a course
    const res = await fetch('/api/instructor/course', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      // reset form
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
        type: 'success',
        onClose: () => {
          router.push('/instructor/courses');
          setPopup(null);
        },
      });
    } else {
      setPopup({
        message: 'Failed to create course, please try again.',
        type: 'error',
        onClose: () => setPopup(null),
      });
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create a New Course</h1>
      <div className="max-w-3xl mx-auto">
        {/* Popup Modal */}
        {popup && <PopupModal {...popup} onClose={popup.onClose} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <InputField
            label="Course Title"
            name="title"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            error={errors.title}
            inputRef={titleRef as RefObject<HTMLInputElement>}
            required
          />

          {/* Course Description */}
          <TextareaField
            label="Course Description"
            name="description"
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
            error={errors.description}
            textareaRef={descriptionRef as RefObject<HTMLTextAreaElement>}
            rows={4}
            required
          />

          {/* Course Category */}
          <SelectField
            label="Category"
            name="category"
            value={category}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
            }
            options={categoryOptions}
            error={errors.category}
            selectRef={categoryRef as RefObject<HTMLSelectElement>}
            required
          />

          {/* Course Level */}
          <SelectField
            label="Level"
            name="level"
            value={level}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setLevel(e.target.value)
            }
            options={levelOptions}
            error={errors.level}
            selectRef={levelRef as RefObject<HTMLSelectElement>}
          />

          {/* Course Price */}
          <InputField
            label="Price ($)"
            name="price"
            type="number"
            value={price}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPrice(e.target.value)
            }
            error={errors.price}
            inputRef={priceRef as RefObject<HTMLInputElement>}
            min="0"
            step="0.01"
            helperText="Set to 0 for free courses."
          />

          {/* Course Thumbnail */}
          <FileInput
            label="Course Thumbnail"
            fileRef={thumbnailRef as RefObject<HTMLInputElement>}
            previewUrl={previewUrl}
            onChange={handleThumbnailChange}
            error={errors.thumbnail}
            required
          />

          {/* Course Tags */}
          <InputField
            label="Tags"
            name="tags"
            value={tags}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTags(e.target.value)
            }
            error={errors.tags}
            inputRef={tagsRef as RefObject<HTMLInputElement>}
            placeholder="Comma separated tags"
          />

          {/* Course Status */}
          <RadioGroup
            label="Course Status"
            name="status"
            options={[
              { value: 'unpublished', label: 'Save as Draft' },
              { value: 'published', label: 'Publish Immediately' },
            ]}
            selectedValue={status}
            onChange={(val) => setStatus(val as 'unpublished' | 'published')}
            error={errors.status}
            containerRef={statusRef as RefObject<HTMLDivElement>}
          />

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

        {/* Preview */}
        <CoursePreview
          title={title}
          description={description}
          category={category}
          level={level}
          price={price}
          previewUrl={previewUrl}
          tags={tags}
          status={status}
        />
      </div>
    </div>
  );
}
