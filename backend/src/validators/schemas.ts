import { z } from 'zod';

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const dealerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(8),
});

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9]+$/).optional(),
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const createDealerSchema = z.object({
  company_name: z.string().min(1),
  primary_contact_name: z.string().min(1),
  primary_contact_phone: z.string().regex(/^[0-9]{10}$/),
  primary_contact_email: z.string().email(),
  address: z.string().min(1),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9]+$/),
  name: z.string().min(1),
});

export const updateDealerSchema = z.object({
  company_name: z.string().optional(),
  primary_contact_name: z.string().optional(),
  primary_contact_phone: z.string().regex(/^[0-9]{10}$/).optional(),
  primary_contact_email: z.string().email().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'suspended']).optional(),
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const createEmployeeSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().regex(/^[0-9]{10}$/),
  email: z.string().email(),
  aadhar: z.string().regex(/^[0-9]{12}$/),
  position: z.string().min(1),
  hire_date: z.string().refine((val: string) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
});

export const updateEmployeeSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  email: z.string().email().optional(),
  position: z.string().optional(),
  hire_date: z.string().refine((val: string) => !isNaN(Date.parse(val)), { message: 'Invalid date' }).optional(),
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const terminateEmployeeSchema = z.object({
  reason: z.string().min(1),
  date: z.string().refine((val: string) => !isNaN(Date.parse(val)), { message: 'Invalid date' })
});

export const createCustomerSchema = z.object({
  type: z.enum(['private', 'government']),
  name_or_entity: z.string().min(1),
  contact_person: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/),
  email: z.string().email(),
  official_id: z.string().min(1),
  address: z.string().min(1)
});

export const updateCustomerSchema = z.object({
  type: z.enum(['private', 'government']).optional(),
  name_or_entity: z.string().optional(),
  contact_person: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  email: z.string().email().optional(),
  official_id: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional()
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, { message: 'At least one field required' });
