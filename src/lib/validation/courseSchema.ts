import z from 'zod';

// Define a Zod schema for course form input validation
export const courseSchema = (
  categoryOptions: string[],
  levelOptions: string[]
) =>
  z.object({
    title: z.string().min(1, 'Course title is required'),
    description: z.string().min(1, 'Course description is required'),
    category: z.string().refine((val) => categoryOptions.includes(val), {
      message: 'Please select a valid category',
    }),
    level: z.string().refine((val) => levelOptions.includes(val), {
      message: 'Please select a valid level',
    }),
    price: z.preprocess(
      (val) => parseFloat(val as string),
      z.number().nonnegative('Price must be non-negative')
    ),
    thumbnail: z
      .instanceof(File)
      .refine((file) => file.type.startsWith('image/'), {
        message: 'Only image files are allowed.',
      }),
    tags: z.string().optional(),
    status: z.enum(['published', 'unpublished'], {
      errorMap: () => ({ message: 'Please select a valid status' }),
    }),
  });
