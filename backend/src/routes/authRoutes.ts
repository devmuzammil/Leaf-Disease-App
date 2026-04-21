import { Router } from 'express';
import { signIn, signUp, me, updateProfile, changePassword, forgotPassword, verifyResetCode, resetPassword } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { SignUpSchema, SignInSchema, UpdateProfileSchema, ChangePasswordSchema, ForgotPasswordSchema, VerifyResetCodeSchema, ResetPasswordSchema } from '../schemas/auth';
import { sendOTPEmail } from '../services/emailService';

const router = Router();

router.post('/signup', validateRequest(SignUpSchema), signUp);
router.post('/signin', validateRequest(SignInSchema), signIn);
router.get('/me', requireAuth, me);
router.put('/profile', requireAuth, validateRequest(UpdateProfileSchema), updateProfile);
router.put('/password', requireAuth, validateRequest(ChangePasswordSchema), changePassword);
router.post('/forgot-password', validateRequest(ForgotPasswordSchema), forgotPassword);
router.post('/verify-reset-code', validateRequest(VerifyResetCodeSchema), verifyResetCode);
router.post('/reset-password', validateRequest(ResetPasswordSchema), resetPassword);

// Test route for email
router.get('/test-email', async (req, res) => {
  const { email } = req.query as { email: string };
  if (!email) {
    return res.status(400).json({ error: 'Email parameter required' });
  }

  try {
    const otp = '123456'; // Test OTP
    await sendOTPEmail(email, otp);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;

