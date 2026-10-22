import mongoose from 'mongoose';

const finalResultSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    studentId: { type: String, required: true },
    groupId: { type: String, default: '' },
    panelId: { type: String, default: '' },
    gdScore: { type: Number, required: true },
    gdPercentage: { type: Number, required: true },
    hr1Score: { type: Number, default: null },
    hr2Score: { type: Number, default: null },
    hrScore: { type: Number, required: true },
    hrPercentage: { type: Number, required: true },
    finalScore: { type: Number, required: true },
    rank: { type: Number, required: true },
    selectionStatus: {
      type: String,
      enum: ['selected', 'waitlisted', 'not_selected', 'pending'],
      default: 'pending',
    },
    scoringConfigSnapshot: {
      gdWeight: { type: Number, default: 40 },
      hrWeight: { type: Number, default: 60 },
    },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

finalResultSchema.index({ eventId: 1, rank: 1 });
finalResultSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export const FinalResult = mongoose.model('FinalResult', finalResultSchema);
export default FinalResult;
