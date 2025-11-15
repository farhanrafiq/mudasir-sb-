import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  password: Joi.string().required(),
});

export const dealerLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  username: Joi.string().alphanum().min(3).max(30).optional(),
}).min(1);

export const createDealerSchema = Joi.object({
  company_name: Joi.string().required(),
  primary_contact_name: Joi.string().required(),
  primary_contact_phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  primary_contact_email: Joi.string().email().required(),
  address: Joi.string().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  name: Joi.string().required(),
});

export const updateDealerSchema = Joi.object({
  company_name: Joi.string().optional(),
  primary_contact_name: Joi.string().optional(),
  primary_contact_phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  primary_contact_email: Joi.string().email().optional(),
  address: Joi.string().optional(),
  status: Joi.string().valid('active', 'suspended').optional(),
}).min(1);

export const createEmployeeSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email().required(),
  aadhar: Joi.string().pattern(/^[0-9]{12}$/).required(),
  position: Joi.string().required(),
  hire_date: Joi.date().iso().max('now').required(),
});

export const updateEmployeeSchema = Joi.object({
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  email: Joi.string().email().optional(),
  position: Joi.string().optional(),
  hire_date: Joi.date().iso().optional(),
}).min(1);

export const terminateEmployeeSchema = Joi.object({
  reason: Joi.string().required(),
  date: Joi.date().iso().max('now').required(),
});

export const createCustomerSchema = Joi.object({
  type: Joi.string().valid('private', 'government').required(),
  name_or_entity: Joi.string().required(),
  contact_person: Joi.string().allow('', null).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email().required(),
  official_id: Joi.string().required(),
  address: Joi.string().required(),
});

export const updateCustomerSchema = Joi.object({
  type: Joi.string().valid('private', 'government').optional(),
  name_or_entity: Joi.string().optional(),
  contact_person: Joi.string().allow('', null).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  email: Joi.string().email().optional(),
  official_id: Joi.string().optional(),
  address: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
}).min(1);
