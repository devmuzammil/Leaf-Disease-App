import { z } from 'zod';

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const VerifyResetCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(6, 'Reset code must be 6 digits').max(6),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(6, 'Reset code must be 6 digits').max(6),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SignUp = z.infer<typeof SignUpSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type VerifyResetCode = z.infer<typeof VerifyResetCodeSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
