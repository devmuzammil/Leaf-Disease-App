import { Resend } from 'resend';
import { config } from '../config/env';

const resend = new Resend(config.resendApiKey);

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: config.emailFrom,
      to: [email],
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #166534; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Leaf Disease App</h1>
            <p style="margin: 5px 0 0 0;">Password Reset</p>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #166534; margin-top: 0;">Reset Your Password</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your Leaf Disease App account. Use the code below to reset your password:</p>

            <div style="background-color: #f0fdf4; border: 2px solid #166534; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h1 style="color: #166534; font-size: 32px; margin: 0; letter-spacing: 3px; font-family: monospace;">${otp}</h1>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              • This code expires in 15 minutes<br>
              • If you didn't request this reset, please ignore this email<br>
              • For security, don't share this code with anyone
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Leaf Disease Detection App<br>
              If you have any questions, please contact support.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send OTP email:', error);
      throw new Error('Failed to send email');
    }

    console.log('OTP email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send email');
  }
}