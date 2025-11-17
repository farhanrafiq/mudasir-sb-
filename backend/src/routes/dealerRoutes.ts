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

// General Dealer CRUD endpoints
import DealerModel from '../models/Dealer';
// Create Dealer
import { createDealerSchema, updateDealerSchema } from '../validators/schemas';
router.post('/', validate(createDealerSchema), async (req, res) => {
  try {
    const dealer = new DealerModel(req.body);
    await dealer.save();
    return res.status(201).json(dealer);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

// Get all Dealers
router.get('/', async (_req, res) => {
  try {
    const dealers = await DealerModel.find();
    return res.json(dealers);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Get Dealer by ID
router.get('/:id', async (req, res) => {
  try {
    const dealer = await DealerModel.findById(req.params.id);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    return res.json(dealer);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Update Dealer
router.put('/:id', validate(updateDealerSchema), async (req, res) => {
  try {
    const dealer = await DealerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    return res.json(dealer);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

// Delete Dealer
import EmployeeModel from '../models/Employee';
import CustomerModel from '../models/Customer';
router.delete('/:id', async (req, res) => {
  try {
    const dealer = await DealerModel.findByIdAndDelete(req.params.id);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    // Cascading delete: remove all employees and customers for this dealer
    await EmployeeModel.deleteMany({ dealer: req.params.id });
    await CustomerModel.deleteMany({ dealer: req.params.id });

    return res.json({ message: 'Dealer and all related employees/customers deleted' });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

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
