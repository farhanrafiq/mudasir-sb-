import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { DealerModel } from '../models/Dealer';
import { AuditLogModel } from '../models/AuditLog';
import { comparePassword, sanitizeUser } from '../utils/auth';
import { generateToken } from '../utils/jwt';
import { config } from '../config';

export const adminLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = (req as any).body;

    // Check if password matches the admin password
    if (password !== config.admin.password) {
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    // Find or create admin user
    let admin = await UserModel.findByEmail('admin@unionregistry.com');
    
    if (!admin) {
      // This shouldn't happen in production, but handle it gracefully
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: admin.id,
      role: 'admin',
    });

    // Create audit log
    await AuditLogModel.create({
      who_user_id: admin.id,
      who_user_name: admin.name,
      action_type: 'login',
      details: 'Admin logged in',
    });

    res.json({
      token,
      user: sanitizeUser(admin),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const dealerLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = (req as any).body;

    // Find user by email
    const user = await UserModel.findByEmail(email);

    if (!user || user.role !== 'dealer') {
      res.status(401).json({ message: 'Invalid dealer credentials.' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid dealer credentials.' });
      return;
    }

    // Get dealer info
    const dealer = await DealerModel.findByUserId(user.id);

    if (!dealer) {
      res.status(401).json({ message: 'Invalid dealer credentials.' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      role: 'dealer',
      dealerId: dealer.id,
    });

    // Create audit log
    await AuditLogModel.create({
      who_user_id: user.id,
      who_user_name: user.name,
      dealer_id: dealer.id,
      action_type: 'login',
      details: `Dealer logged in: ${dealer.company_name}`,
    });

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Dealer login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = (req as any).body;

    // Find user by email (but don't reveal if it exists)
    const user = await UserModel.findByEmail(email);

    if (user) {
      // Create audit log
      await AuditLogModel.create({
        who_user_id: user.id,
        who_user_name: user.name,
        dealer_id: user.role === 'dealer' ? (await DealerModel.findByUserId(user.id))?.id : undefined,
        action_type: 'forgot_password',
        details: `Password reset requested for email: ${email}`,
      });
    }

    // Always return 204 to not reveal if email exists
    res.status(204).send();
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
