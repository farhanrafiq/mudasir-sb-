import { z } from 'zod';

export const createEmployeeSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters.'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Must be a valid email address.'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.'),
  position: z.string().min(1, 'Position is required.'),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Hire date must be a valid ISO 8601 date string.'),
  aadhar: z.string().regex(/^\d{12}$/, 'Aadhar must be exactly 12 digits.'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().refine(
  (data) => !('aadhar' in data),
  {
    message: 'Aadhar cannot be changed after creation.',
    path: ['aadhar'],
  }
);

export const terminateEmployeeSchema = z.object({
  reason: z.string().min(10, 'Termination reason must be at least 10 characters.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Termination date must be a valid ISO 8601 date string.'),
});
