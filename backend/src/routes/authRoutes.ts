import { Router } from 'express';
import { adminLogin, dealerLogin, forgotPassword } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { adminLoginSchema, dealerLoginSchema, forgotPasswordSchema } from '../validators/schemas';
const rateLimit = require('express-rate-limit');

const router = Router();

// Rate limiter for login endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/admin/login', loginLimiter, validate(adminLoginSchema), adminLogin);
router.post('/dealer/login', loginLimiter, validate(dealerLoginSchema), dealerLogin);
router.post('/forgot-password', loginLimiter, validate(forgotPasswordSchema), forgotPassword);

import { logout } from '../controllers/authController';
router.post('/logout', logout);

export default router;
