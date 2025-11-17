import { Router } from 'express';
import { changePassword, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { changePasswordSchema, updateProfileSchema } from '../validators/schemas';

const router = Router();

router.put('/me/password', authenticate, validate(changePasswordSchema), changePassword);
router.put('/me/profile', authenticate, validate(updateProfileSchema), updateProfile);

// Create User
import UserModel from '../models/User';
import { createDealerSchema } from '../validators/schemas';
router.post('/', validate(createDealerSchema), async (req, res) => {
	try {
		const user = new UserModel(req.body);
		await user.save();
		return res.status(201).json(user);
	} catch (err) {
		const error = err as Error;
		return res.status(400).json({ error: error.message });
	}
});

// Get all Users
router.get('/', async (_req, res) => {
	try {
		const users = await UserModel.find();
		return res.json(users);
	} catch (err) {
		const error = err as Error;
		return res.status(500).json({ error: error.message });
	}
});

// Get User by ID
router.get('/:id', async (req, res) => {
	try {
		const user = await UserModel.findById(req.params.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json(user);
	} catch (err) {
		const error = err as Error;
		return res.status(500).json({ error: error.message });
	}
});

// Update User
router.put('/:id', validate(updateProfileSchema), async (req, res) => {
	try {
		const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json(user);
	} catch (err) {
		const error = err as Error;
		return res.status(400).json({ error: error.message });
	}
});

// Delete User
router.delete('/:id', async (req, res) => {
	try {
		const user = await UserModel.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json({ message: 'User deleted' });
	} catch (err) {
		const error = err as Error;
		return res.status(500).json({ error: error.message });
	}
});

export default router;
