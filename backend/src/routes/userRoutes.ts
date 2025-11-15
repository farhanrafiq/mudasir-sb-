import { Router } from 'express';
import { changePassword, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { changePasswordSchema, updateProfileSchema } from '../validators/schemas';

const router = Router();

router.put('/me/password', authenticate, validate(changePasswordSchema), changePassword);
router.put('/me/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
