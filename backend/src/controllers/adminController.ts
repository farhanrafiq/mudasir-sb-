import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { DealerModel } from '../models/Dealer';
import { AuditLogModel } from '../models/AuditLog';
import { hashPassword, generateTempPassword } from '../utils/auth';

export const getAllDealers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dealers = await DealerModel.findAll();
    res.json(dealers);
  } catch (error) {
    console.error('Get all dealers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuditLogs = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await AuditLogModel.findAll();
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createDealer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      company_name,
      primary_contact_name,
      primary_contact_phone,
      primary_contact_email,
      address,
      username,
      name,
    } = (req as any).body;

    // Check if company name already exists
    const existingDealer = await DealerModel.findByCompanyName(company_name);
    if (existingDealer) {
      res.status(409).json({ message: 'A dealer with this company name already exists.' });
      return;
    }

    // Check if email already exists
    const existingUserByEmail = await UserModel.findByEmail(primary_contact_email);
    if (existingUserByEmail) {
      res.status(409).json({ message: 'A user with this email already exists.' });
      return;
    }

    // Check if username already exists
    const existingUserByUsername = await UserModel.findByUsername(username);
    if (existingUserByUsername) {
      res.status(409).json({ message: 'A user with this username already exists.' });
      return;
    }

    // Generate temporary password
    const tempPass = generateTempPassword();
    const passwordHash = await hashPassword(tempPass);

    // Create user
    const user = await UserModel.create({
      role: 'dealer',
      name,
      username,
      email: primary_contact_email,
      password_hash: passwordHash,
      temp_pass: true,
    });

    // Create dealer
    const dealer = await DealerModel.create({
      user_id: user.id,
      company_name,
      primary_contact_name,
      primary_contact_phone,
      primary_contact_email,
      address,
    });

    // Create audit log
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: (await UserModel.findById(req.user!.userId))!.name,
      action_type: 'create_dealer',
      details: `Created dealer: ${company_name}`,
    });

    res.status(201).json({ dealer, tempPass });
  } catch (error) {
    console.error('Create dealer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDealer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dealerId } = (req as any).params;
    const updates = (req as any).body;

    // Check if dealer exists
    const dealer = await DealerModel.findById(dealerId);
    if (!dealer) {
      res.status(404).json({ message: 'Dealer not found' });
      return;
    }

    // Check if company name is being changed and if it's unique
    if (updates.company_name && updates.company_name !== dealer.company_name) {
      const existingDealer = await DealerModel.findByCompanyName(updates.company_name);
      if (existingDealer) {
        res.status(409).json({ message: 'A dealer with this company name already exists.' });
        return;
      }
    }

    // Update dealer
    const updatedDealer = await DealerModel.update(dealerId, updates);

    // Create audit log
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: (await UserModel.findById(req.user!.userId))!.name,
      action_type: 'update_dealer',
      details: `Updated dealer: ${updatedDealer.company_name}`,
    });

    res.json(updatedDealer);
  } catch (error) {
    console.error('Update dealer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDealer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dealerId } = (req as any).params;

    // Check if dealer exists
    const dealer = await DealerModel.findById(dealerId);
    if (!dealer) {
      res.status(404).json({ message: 'Dealer not found' });
      return;
    }

    // Create audit log before deletion
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: (await UserModel.findById(req.user!.userId))!.name,
      action_type: 'delete_dealer',
      details: `Deleted dealer: ${dealer.company_name}`,
    });

    // Delete dealer (cascades to user via foreign key)
    await DealerModel.delete(dealerId);

    res.status(204).send();
  } catch (error) {
    console.error('Delete dealer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).params;

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate temporary password
    const tempPass = generateTempPassword();
    const passwordHash = await hashPassword(tempPass);

    // Update password
    await UserModel.updatePassword(userId, passwordHash, true);

    // Create audit log
    await AuditLogModel.create({
      who_user_id: req.user!.userId,
      who_user_name: (await UserModel.findById(req.user!.userId))!.name,
      action_type: 'reset_password',
      details: `Reset password for user: ${user.name}`,
    });

    res.json({ tempPass });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
