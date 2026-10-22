import mongoose from 'mongoose';

const gdRecommendationSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    groupId: { type: String, required: true },
    judgeId: { type: String, required: true },
    studentIds: {
      type: [String],
      validate: {
        validator: function (v) {
          return v && v.length <= 3;
        },
        message: 'Strict rule limit: A judge can recommend a maximum of 3 students per group.',
      },
    },
    status: { type: String, default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

gdRecommendationSchema.index({ groupId: 1, judgeId: 1 }, { unique: true });

export const GDRecommendation = mongoose.model('GDRecommendation', gdRecommendationSchema);
export default GDRecommendation;
