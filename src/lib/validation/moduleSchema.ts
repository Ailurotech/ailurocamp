import { z } from 'zod';

// Define a Zod schema for module form input validation
export const moduleSchema = z.object({
  title: z.string().min(1, 'Module title is required'),
  content: z.string().min(1, 'Module content is required'),
  order: z.preprocess(
    (val) => parseInt(val as string),
    z.number().nonnegative('Order must be non-negative')
  ),
  duration: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().nonnegative('Duration must be non-negative')
  ),
});
