import { Router } from 'express';
import {
  getDealerEmployees,
  createEmployee,
  updateEmployee,
  terminateEmployee,
  getDealerCustomers,
  createCustomer,
  updateCustomer,
  getDealerAuditLogs,
} from '../controllers/dealerController';
import { authenticate, requireDealer } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  terminateEmployeeSchema,
  createCustomerSchema,
  updateCustomerSchema,
} from '../validators/schemas';

const router = Router();

// All dealer routes require authentication and dealer role
router.use(authenticate, requireDealer);

// Employee routes
router.get('/employees', getDealerEmployees);
router.post('/employees', validate(createEmployeeSchema), createEmployee);
router.put('/employees/:employeeId', validate(updateEmployeeSchema), updateEmployee);
router.post('/employees/:employeeId/terminate', validate(terminateEmployeeSchema), terminateEmployee);

// Customer routes
router.get('/customers', getDealerCustomers);
router.post('/customers', validate(createCustomerSchema), createCustomer);
router.put('/customers/:customerId', validate(updateCustomerSchema), updateCustomer);

// Audit logs
router.get('/audit-logs', getDealerAuditLogs);

export default router;
