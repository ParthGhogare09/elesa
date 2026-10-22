import mongoose from 'mongoose';

const interviewEvaluationSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    studentId: { type: String, required: true },
    hrId: { type: String, required: true },
    criterionScores: {
      type: Map,
      of: Number,
      required: true,
    },
    totalScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    remarks: { type: String, required: true },
    strengths: { type: String, default: '' },
    improvementAreas: { type: String, default: '' },
    recommendation: {
      type: String,
      enum: ['Strongly Recommended', 'Recommended', 'On Hold', 'Not Recommended'],
      default: 'Recommended',
    },
    status: { type: String, enum: ['draft', 'submitted'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

interviewEvaluationSchema.index({ studentId: 1, hrId: 1 }, { unique: true });

export const InterviewEvaluation = mongoose.model('InterviewEvaluation', interviewEvaluationSchema);
export default InterviewEvaluation;
