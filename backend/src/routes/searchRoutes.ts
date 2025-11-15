import { Router } from 'express';
import { searchEmployees, checkAadhar } from '../controllers/searchController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Universal search routes require authentication (admin or dealer)
router.use(authenticate);

router.get('/search', searchEmployees);
router.get('/employees/check-aadhar', checkAadhar);

export default router;
