import express from 'express';
import { AuditLogModel } from '../models/AuditLog';
const router = express.Router();

// Create AuditLog
router.post('/', async (req, res) => {
  try {
    const log = new AuditLogModel(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
  // If you add a POST endpoint for audit logs, use validate(auditLogSchema) from Zod.

// Get all AuditLogs
router.get('/', async (_req, res) => {
  try {
    const logs = await AuditLogModel.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
// Get AuditLog by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await AuditLogModel.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'AuditLog not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update AuditLog
router.put('/:id', async (req, res) => {
  try {
    const log = await AuditLogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!log) return res.status(404).json({ error: 'AuditLog not found' });
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete AuditLog
router.delete('/:id', async (req, res) => {
  try {
    const log = await AuditLogModel.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: 'AuditLog not found' });
    res.json({ message: 'AuditLog deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
