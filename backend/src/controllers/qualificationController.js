import Qualification from '../models/Qualification.js';
import GDRecommendation from '../models/GDRecommendation.js';
import AuditLog from '../models/AuditLog.js';

export async function getQualifications(req, res, next) {
  try {
    const { status, panelId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (panelId) query.panelId = panelId;

    const quals = await Qualification.find(query);
    res.json({ success: true, count: quals.length, data: quals });
  } catch (err) {
    next(err);
  }
}

export async function updateQualification(req, res, next) {
  try {
    const { studentId, status, remarks } = req.body;

    const validStatuses = ['pending', 'recommended', 'qualified', 'not_qualified', 'under_review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid qualification status: ${status}` });
    }

    const qual = await Qualification.findOneAndUpdate(
      { studentId },
      {
        studentId,
        status,
        remarks: remarks || '',
        decisionBy: req.user?.id || 'admin',
        decisionAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      action: 'QUALIFICATION_UPDATED',
      targetType: 'Qualification',
      targetId: qual._id.toString(),
      details: `Administrator set student ${studentId} status to '${status}'`,
    });

    res.json({ success: true, data: qual });
  } catch (err) {
    next(err);
  }
}

export async function batchApproveRecommended(req, res, next) {
  try {
    const recs = await GDRecommendation.find({ status: 'submitted' });
    const recommendedStudentIds = new Set();
    recs.forEach((r) => r.studentIds.forEach((id) => recommendedStudentIds.add(id)));

    const result = await Qualification.updateMany(
      { studentId: { $in: Array.from(recommendedStudentIds) } },
      {
        status: 'qualified',
        decisionBy: req.user?.id || 'admin',
        decisionAt: new Date(),
        remarks: 'Batch approved by Administrator based on GD Judge recommendations.',
      }
    );

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      action: 'BATCH_QUALIFICATION_APPROVED',
      targetType: 'Qualification',
      targetId: 'batch',
      details: `Batch approved ${result.modifiedCount} judge-recommended candidates for Round 2 HR.`,
    });

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
}
