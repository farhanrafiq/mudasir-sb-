import * as express from 'express';
import EmployeeModel from '../models/Employee';
const router = express.Router();

// Create Employee
import { validate } from '../middleware/validation';
import { createEmployeeSchema, updateEmployeeSchema, terminateEmployeeSchema } from '../validators/schemas';
router.post('/', validate(createEmployeeSchema), async (req, res) => {
  try {
    const employee = new EmployeeModel(req.body);
    await employee.save();
    return res.status(201).json(employee);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

// Get all Employees
router.get('/', async (_req, res) => {
  try {
    const employees = await EmployeeModel.find();
    return res.json(employees);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

export default router;
// Get Employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await EmployeeModel.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    return res.json(employee);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Update Employee
router.put('/:id', validate(updateEmployeeSchema), async (req, res) => {
  try {
    const employee = await EmployeeModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    return res.json(employee);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

// Delete Employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await EmployeeModel.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    return res.json({ message: 'Employee deleted' });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Terminate Employee
router.post('/:id/terminate', validate(terminateEmployeeSchema), async (req, res) => {
  try {
    const employee = await EmployeeModel.findByIdAndUpdate(
      req.params.id,
      { status: 'terminated', termination_date: new Date(), termination_reason: req.body.reason },
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    return res.json(employee);
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({ error: error.message });
  }
});

// Global Employee Search
router.get('/search/all', async (req, res) => {
  try {
    const { query } = req.query;
    const employees = await EmployeeModel.find({
      $or: [
        { first_name: { $regex: query, $options: 'i' } },
        { last_name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { aadhar: { $regex: query, $options: 'i' } }
      ]
    });
    return res.json(employees);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});
