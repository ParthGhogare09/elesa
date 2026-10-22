import mongoose from 'mongoose';

const gdGroupEvaluationSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    groupId: { type: String, required: true },
    judgeId: { type: String, required: true },
    criterionScores: {
      type: Map,
      of: Number,
      required: true,
    },
    totalScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    remarks: { type: String, required: true, trim: true },
    status: { type: String, enum: ['draft', 'submitted'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

gdGroupEvaluationSchema.index({ groupId: 1, judgeId: 1 }, { unique: true });

export const GDGroupEvaluation = mongoose.model('GDGroupEvaluation', gdGroupEvaluationSchema);
export default GDGroupEvaluation;
