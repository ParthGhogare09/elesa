import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    branch: { type: String, required: true },
    year: { type: String, default: '4th Year (Batch of 2026)' },
    contactNumber: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentSchema.index({ branch: 1 });

export const Student = mongoose.model('Student', studentSchema);
export default Student;
