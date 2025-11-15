import { Router } from 'express';
import { adminLogin, dealerLogin, forgotPassword } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { adminLoginSchema, dealerLoginSchema, forgotPasswordSchema } from '../validators/schemas';

const router = Router();

router.post('/admin/login', validate(adminLoginSchema), adminLogin);
router.post('/dealer/login', validate(dealerLoginSchema), dealerLogin);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

export default router;
