import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { DealerModel } from '../models/Dealer';
import { AuditLogModel } from '../models/AuditLog';
import { hashPassword, sanitizeUser } from '../utils/auth';

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newPassword } = (req as any).body;
    const userId = req.user!.userId;

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    const updatedUser = await UserModel.updatePassword(userId, passwordHash, false);

    // Get dealer info if dealer
    let dealerId: string | undefined;
    if (req.user!.role === 'dealer') {
      const dealer = await DealerModel.findByUserId(userId);
      dealerId = dealer?.id;
    }

    // Create audit log
    await AuditLogModel.create({
      who_user_id: userId,
      who_user_name: updatedUser.name,
      dealer_id: dealerId,
      action_type: 'change_password',
      details: 'User changed their password',
    });

    res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, username } = (req as any).body;

    // Check if username is already taken
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        res.status(409).json({ message: 'A user with this username already exists.' });
        return;
      }
    }

    // Update profile
    const updatedUser = await UserModel.updateProfile(userId, { name, username });

    // Get dealer info if dealer
    let dealerId: string | undefined;
    if (req.user!.role === 'dealer') {
      const dealer = await DealerModel.findByUserId(userId);
      dealerId = dealer?.id;
    }

    // Create audit log
    await AuditLogModel.create({
      who_user_id: userId,
      who_user_name: updatedUser.name,
      dealer_id: dealerId,
      action_type: 'update_profile',
      details: `User updated their profile: ${JSON.stringify({ name, username })}`,
    });

    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
