import mongoose from 'mongoose';

const interviewAssignmentSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    studentId: { type: String, required: true },
    hrId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    scheduledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

interviewAssignmentSchema.index({ eventId: 1, studentId: 1, hrId: 1 }, { unique: true });

export const InterviewAssignment = mongoose.model('InterviewAssignment', interviewAssignmentSchema);
export default InterviewAssignment;
