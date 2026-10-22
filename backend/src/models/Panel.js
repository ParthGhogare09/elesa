import mongoose from 'mongoose';

const panelSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    location: { type: String, default: '' },
    assignedJudgeIds: [{ type: String }],
    status: { type: String, default: 'in_progress' },
  },
  { timestamps: true }
);

export const Panel = mongoose.model('Panel', panelSchema);
export default Panel;
