import express from 'express';
import CustomerModel from '../models/Customer';
const router = express.Router();

// Create Customer
import { validate } from '../middleware/validation';
import { createCustomerSchema, updateCustomerSchema } from '../validators/schemas';
router.post('/', validate(createCustomerSchema), async (req, res) => {
  try {
    const customer = new CustomerModel(req.body);
    await customer.save();
    return res.status(201).json(customer);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

// Get all Customers
router.get('/', async (_req, res) => {
  try {
    const customers = await CustomerModel.find();
    return res.json(customers);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

export default router;
// Get Customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await CustomerModel.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    return res.json(customer);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Update Customer
router.put('/:id', validate(updateCustomerSchema), async (req, res) => {
  try {
    const customer = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    return res.json(customer);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

// Delete Customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await CustomerModel.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    return res.json({ message: 'Customer deleted' });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Global Customer Search
router.get('/search/all', async (req, res) => {
  try {
    const { query } = req.query;
    const customers = await CustomerModel.find({
      $or: [
        { name_or_entity: { $regex: query, $options: 'i' } },
        { contact_person: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { official_id: { $regex: query, $options: 'i' } }
      ]
    });
    return res.json(customers);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});
