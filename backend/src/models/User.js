import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'judge', 'hr'], required: true },
    title: { type: String, default: '' },
    avatar: { type: String, default: '' },
    assignedPanels: [{ type: String }],
    interviewerNumber: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export default User;
