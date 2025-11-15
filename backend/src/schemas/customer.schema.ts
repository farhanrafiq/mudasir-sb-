import { z } from 'zod';

export const createCustomerSchema = z.object({
  type: z.enum(['private', 'government']),
  name_or_entity: z.string().min(1, 'Name or entity is required.'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.'),
  email: z.string().email('Must be a valid email address.'),
  official_id: z.string().min(1, 'Official ID is required.'),
  address: z.string().min(1, 'Address is required.'),
  contact_person: z.string().min(1, 'Contact person is required.').optional(),
}).refine(
  (data) => data.type !== 'government' || !!data.contact_person,
  {
    message: 'Contact person is required for government customers.',
    path: ['contact_person'],
  }
);

export const updateCustomerSchema = createCustomerSchema.partial();
