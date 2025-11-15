import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EmployeeModel } from '../models/Employee';
import { UserModel } from '../models/User';
import { AuditLogModel } from '../models/AuditLog';

export const searchEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = (req as any).query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const results = await EmployeeModel.search(q);

    // Create audit log
    const user = await UserModel.findById(req.user!.userId);
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: user!.name,
      dealer_id: req.user!.dealerId,
      action_type: 'search_employees',
      details: `Searched for employees: "${q}" (${results.length} results)`,
    });

    res.json(results);
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkAadhar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { aadhar } = (req as any).query;

    if (!aadhar || typeof aadhar !== 'string') {
      res.status(400).json({ message: 'Aadhar number is required' });
      return;
    }

    const employee = await EmployeeModel.findActiveByAadhar(aadhar);

    // Create audit log
    const user = await UserModel.findById(req.user!.userId);
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: user!.name,
      dealer_id: req.user!.dealerId,
      action_type: 'check_aadhar',
      details: `Checked Aadhar: ${aadhar} (${employee ? 'Found' : 'Not found'})`,
    });

    res.json(employee);
  } catch (error) {
    console.error('Check aadhar error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
