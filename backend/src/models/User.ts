import mongoose, { Schema, Document } from 'mongoose';

export type AuthProvider = 'local' | 'google';

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  googleId?: string;
  phone?: string;
  location?: string;
  createdAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    provider: { type: String, required: true, default: 'local' },
    googleId: { type: String, required: false, index: true },
    phone: { type: String, required: false, trim: true },
    location: { type: String, required: false, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

