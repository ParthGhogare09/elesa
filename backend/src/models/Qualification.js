import mongoose from 'mongoose';

const qualificationSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    studentId: { type: String, required: true },
    groupId: { type: String, default: '' },
    panelId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'recommended', 'qualified', 'not_qualified', 'under_review'],
      default: 'pending',
    },
    gdScore: { type: Number, default: 0 },
    gdPercentage: { type: Number, default: 0 },
    recommendedByJudges: [{ type: String }],
    decisionBy: { type: String, default: 'admin' },
    decisionAt: { type: Date, default: Date.now },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

qualificationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export const Qualification = mongoose.model('Qualification', qualificationSchema);
export default Qualification;
