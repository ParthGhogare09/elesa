import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    academicYear: { type: String, default: '2025-2026' },
    status: {
      type: String,
      enum: ['draft', 'active', 'round1_completed', 'completed', 'published'],
      default: 'active',
    },
    gdScoringConfig: {
      criteria: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          maxMarks: { type: Number, default: 10 },
          description: { type: String },
        },
      ],
      totalMarks: { type: Number, default: 60 },
      maxRecommendationsPerGroup: { type: Number, default: 3 },
    },
    hrScoringConfig: {
      criteria: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          maxMarks: { type: Number, default: 10 },
          description: { type: String },
        },
      ],
      totalMarks: { type: Number, default: 50 },
      workflow: { type: String, enum: ['workflow_a', 'workflow_b'], default: 'workflow_b' },
    },
    finalScoringConfig: {
      gdWeightPercentage: { type: Number, default: 40 },
      hrWeightPercentage: { type: Number, default: 60 },
      tieBreakingRules: [{ type: String }],
    },
    qualificationStatus: { type: String, default: 'in_progress' },
    resultPublicationStatus: { type: String, default: 'pending' },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
export default Event;
