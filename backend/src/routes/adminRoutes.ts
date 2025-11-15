import { Router } from 'express';
import {
  getAllDealers,
  getAuditLogs,
  createDealer,
  updateDealer,
  deleteDealer,
  resetUserPassword,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createDealerSchema, updateDealerSchema } from '../validators/schemas';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/dealers', getAllDealers);
router.get('/audit-logs', getAuditLogs);
router.post('/dealers', validate(createDealerSchema), createDealer);
router.put('/dealers/:dealerId', validate(updateDealerSchema), updateDealer);
router.delete('/dealers/:dealerId', deleteDealer);
router.post('/users/:userId/reset-password', resetUserPassword);

export default router;
