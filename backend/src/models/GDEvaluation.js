import mongoose from 'mongoose';

const gdEvaluationSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    groupId: { type: String, required: true },
    studentId: { type: String, required: true },
    judgeId: { type: String, required: true },
    criterionScores: {
      type: Map,
      of: Number,
      required: true,
    },
    totalScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    remarks: { type: String, required: true, trim: true },
    recommendation: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'submitted'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

gdEvaluationSchema.index({ groupId: 1, studentId: 1, judgeId: 1 }, { unique: true });

export const GDEvaluation = mongoose.model('GDEvaluation', gdEvaluationSchema);
export default GDEvaluation;
