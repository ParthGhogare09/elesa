import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    groupName: { type: String, required: true },
    groupCode: { type: String, required: true, uppercase: true },
    studentIds: {
      type: [String],
      validate: {
        validator: function (v) {
          return v && v.length >= 4 && v.length <= 6;
        },
        message: 'A group must contain between 4 and 6 students (inclusive).',
      },
    },
    panelId: { type: String, required: true },
    judgeIds: [{ type: String }],
    evaluationStatus: {
      type: String,
      enum: ['pending', 'partially_evaluated', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

groupSchema.index({ eventId: 1, panelId: 1 });
groupSchema.index({ studentIds: 1 });

export const Group = mongoose.model('Group', groupSchema);
export default Group;
