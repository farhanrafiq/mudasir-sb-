import { z } from 'zod';

export const createDealerSchema = z.object({
  company_name: z.string().min(3, 'Company name must be at least 3 characters long.'),
  primary_contact_name: z.string().min(2, 'Contact name must be at least 2 characters.'),
  primary_contact_email: z.string().email('Must be a valid email address.'),
  primary_contact_phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.'),
  address: z.string().min(10, 'Address must be at least 10 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
});

export const updateDealerSchema = createDealerSchema.partial().refine(
  (data) => {
    // Email and username cannot be changed after creation
    return !('primary_contact_email' in data) && !('username' in data);
  },
  {
    message: 'Email and username cannot be changed after creation.',
    path: ['primary_contact_email', 'username'],
  }
);
