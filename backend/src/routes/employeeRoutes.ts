import express from 'express';
import EmployeeModel from '../models/Employee';
const router = express.Router();

// Create Employee
import { validate } from '../middleware/validation';
import { createEmployeeSchema, updateEmployeeSchema, terminateEmployeeSchema } from '../validators/schemas';
router.post('/', validate(createEmployeeSchema), async (req, res) => {
  try {
    const employee = new EmployeeModel(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all Employees
router.get('/', async (_req, res) => {
  try {
    const employees = await EmployeeModel.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
// Get Employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await EmployeeModel.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Employee
router.put('/:id', validate(updateEmployeeSchema), async (req, res) => {
  try {
    const employee = await EmployeeModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await EmployeeModel.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
