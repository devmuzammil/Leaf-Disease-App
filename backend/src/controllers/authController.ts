import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { PasswordResetModel } from '../models/PasswordReset';
import { signAccessToken } from '../utils/jwt';
import { AuthedRequest } from '../middleware/authMiddleware';
import { config } from '../config/env';
import { sendOTPEmail } from '../services/emailService';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const publicUser = (u: any) => ({
  name: u.name,
  email: u.email,
  phone: u.phone,
  location: u.location,
});

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  
  const normalized = normalizeEmail(email);
  const existing = await UserModel.findOne({ email: normalized }).lean();
  if (existing) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name,
    email: normalized,
    passwordHash,
    provider: 'local',
  });

  const token = signAccessToken({ sub: user._id.toString(), email: user.email });
  return res.status(201).json({ token, user: publicUser(user) });
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const normalized = normalizeEmail(email);
  const user = await UserModel.findOne({ email: normalized });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.provider !== 'local') {
    return res.status(400).json({
      error: 'Social sign-in is not supported.',
    });
  }

  const ok = await bcrypt.compare(password, user.passwordHash ?? '');
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signAccessToken({ sub: user._id.toString(), email: user.email });
  return res.status(200).json({ token, user: publicUser(user) });
};

export const me = async (req: AuthedRequest, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  const user = await UserModel.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  return res.status(200).json({ user: publicUser(user) });
};

export const updateProfile = async (req: AuthedRequest, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  const { name, phone, location } = req.body ?? {};

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
      ...(location !== undefined ? { location: String(location).trim() } : {}),
    },
    { new: true },
  );

  if (!user) return res.status(404).json({ error: 'User not found.' });
  return res.status(200).json({ user: publicUser(user) });
};

export const changePassword = async (req: AuthedRequest, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  const { currentPassword, newPassword } = req.body;

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash ?? '');
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.status(200).json({ status: 'ok' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ error: 'No account found with this email. Please sign up first.' });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save reset token
  await PasswordResetModel.create({
    userId: user._id,
    email: user.email,
    token: code,
    expiresAt: new Date(Date.now() + 30 * 1000), // 30 seconds
  });

  // Send email
  try {
    if (!config.resendApiKey) {
      console.warn('Resend API key not configured. Password reset email not sent.');
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    await sendOTPEmail(user.email, code);
    return res.status(200).json({ message: 'Reset code sent successfully.' });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    return res.status(500).json({ error: 'Failed to send reset email.' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body as { email: string; code: string };

  const resetDoc = await PasswordResetModel.findOne({
    email: email.toLowerCase(),
    token: code,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetDoc) {
    return res.status(400).json({ error: 'Invalid or expired reset code.' });
  }

  return res.status(200).json({ message: 'Code verified successfully.' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body as { email: string; code: string; newPassword: string };

  const resetDoc = await PasswordResetModel.findOne({
    email: email.toLowerCase(),
    token: code,
    used: false,
  });

  if (!resetDoc) {
    return res.status(400).json({ error: 'Invalid or expired reset code.' });
  }

  const user = await UserModel.findById(resetDoc.userId);
  if (!user) {
    return res.status(400).json({ error: 'User not found.' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Mark token as used
  resetDoc.used = true;
  await resetDoc.save();

  return res.status(200).json({ message: 'Password reset successfully.' });
};

