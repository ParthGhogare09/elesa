import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: 'evt-2026-01' },
    actorId: { type: String, default: 'system' },
    actorName: { type: String, default: 'System' },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: '' },
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    reason: { type: String, default: '' },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

auditLogSchema.index({ eventId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
