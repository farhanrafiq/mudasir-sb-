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
import { DealerModel } from '../models/Dealer';
// Create Dealer
import { createDealerSchema, updateDealerSchema } from '../validators/schemas';
router.post('/', validate(createDealerSchema), async (req, res) => {
  try {
    const dealer = new DealerModel(req.body);
    await dealer.save();
    res.status(201).json(dealer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all Dealers
router.get('/', async (_req, res) => {
  try {
    const dealers = await DealerModel.find();
    res.json(dealers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Dealer by ID
router.get('/:id', async (req, res) => {
  try {
    const dealer = await DealerModel.findById(req.params.id);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    res.json(dealer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Dealer
router.put('/:id', validate(updateDealerSchema), async (req, res) => {
  try {
    const dealer = await DealerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    res.json(dealer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Dealer
import { Employee } from '../models/Employee';
import { Customer } from '../models/Customer';
router.delete('/:id', async (req, res) => {
  try {
    const dealer = await DealerModel.findByIdAndDelete(req.params.id);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    // Cascading delete: remove all employees and customers for this dealer
    await Employee.deleteMany({ dealer: req.params.id });
    await Customer.deleteMany({ dealer: req.params.id });

    res.json({ message: 'Dealer and all related employees/customers deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
