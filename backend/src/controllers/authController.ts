export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  // Invalidate token on client side; server-side logout is stateless for JWT
  res.status(200).json({ message: 'Logged out successfully.' });
};
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import UserModel from '../models/User';
import DealerModel from '../models/Dealer';
import AuditLogModel from '../models/AuditLog';
import { comparePassword, sanitizeUser } from '../utils/auth';
import { generateToken } from '../utils/jwt';
import { config } from '../config';

export const adminLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = (req as any).body;

    if (password !== config.admin.password) {
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    // Find admin user by email using Mongoose
    let admin = await UserModel.findOne({ email: 'admin@unionregistry.com' });
    if (!admin) {
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    const token = generateToken({
      userId: admin._id.toString(),
      role: 'admin',
    });

    await AuditLogModel.create({
      who_user_id: admin._id,
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

    // Find user by email using Mongoose
    const user = await UserModel.findOne({ email });
    if (!user || user.role !== 'dealer') {
      res.status(401).json({ message: 'Invalid dealer credentials.' });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid dealer credentials.' });
      return;
    }

    // Get dealer info using Mongoose
    const dealer = await DealerModel.findOne({ user_id: user._id });
    if (!dealer) {
      res.status(401).json({ message: 'Invalid dealer credentials.' });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: 'dealer',
      dealerId: dealer._id.toString(),
    });

    await AuditLogModel.create({
      who_user_id: user._id,
      who_user_name: user.name,
      dealer_id: dealer._id,
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

    // Find user by email using Mongoose
    const user = await UserModel.findOne({ email });
    if (user) {
      await AuditLogModel.create({
        who_user_id: user._id,
        who_user_name: user.name,
        dealer_id: user.role === 'dealer' ? (await DealerModel.findOne({ user_id: user._id }))?._id : undefined,
        action_type: 'forgot_password',
        details: `Password reset requested for email: ${email}`,
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
