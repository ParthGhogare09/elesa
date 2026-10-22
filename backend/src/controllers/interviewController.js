import InterviewAssignment from '../models/InterviewAssignment.js';
import InterviewEvaluation from '../models/InterviewEvaluation.js';
import Qualification from '../models/Qualification.js';
import AuditLog from '../models/AuditLog.js';

const HR_CRITERIA_KEYS = ['comm', 'confidence', 'problem_solving', 'technical', 'attitude'];

export async function getHRCandidates(req, res, next) {
  try {
    const hrId = req.user.id;
    const assignments = await InterviewAssignment.find({ hrId });
    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (err) {
    next(err);
  }
}

export async function assignInterview(req, res, next) {
  try {
    const { studentId, hrIds } = req.body;

    // Strict eligibility check: Candidate must be qualified in Round 1!
    const qual = await Qualification.findOne({ studentId });
    if (!qual || qual.status !== 'qualified') {
      return res.status(400).json({
        message: 'Strict eligibility rule: Only candidates qualified in Round 1 can be assigned to HR interviews.',
      });
    }

    const created = [];
    for (const hrId of hrIds) {
      const doc = await InterviewAssignment.findOneAndUpdate(
        { studentId, hrId },
        { studentId, hrId, status: 'pending', scheduledAt: new Date() },
        { upsert: true, new: true }
      );
      created.push(doc);
    }

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      action: 'HR_INTERVIEW_ASSIGNED',
      targetType: 'InterviewAssignment',
      targetId: studentId,
      details: `Assigned candidate ${studentId} to ${hrIds.length} HR interviewer(s)`,
    });

    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err) {
    next(err);
  }
}

export async function submitInterviewEvaluation(req, res, next) {
  try {
    const hrId = req.user.id;
    const { studentId, criterionScores, remarks, strengths, improvementAreas, recommendation, status = 'submitted' } = req.body;

    // Strict check: Candidate must be qualified for Round 2
    const qual = await Qualification.findOne({ studentId });
    if (!qual || qual.status !== 'qualified') {
      return res.status(403).json({
        message: 'Forbidden: Cannot evaluate a candidate who is not qualified for Round 2.',
      });
    }

    // Backend authoritative scoring calculation (5 criteria, 0-10 each = 50 total)
    let calculatedTotal = 0;
    const validatedScores = {};

    for (const key of HR_CRITERIA_KEYS) {
      const score = Number(criterionScores?.[key]);
      if (isNaN(score) || score < 0 || score > 10) {
        return res.status(400).json({
          message: `Criterion '${key}' score must be a number between 0 and 10. Received: ${score}`,
        });
      }
      validatedScores[key] = score;
      calculatedTotal += score;
    }

    if (status === 'submitted' && (!remarks || !remarks.trim())) {
      return res.status(400).json({ message: 'Interview remarks are mandatory before submission.' });
    }

    const percentage = Math.round((calculatedTotal / 50) * 100 * 10) / 10;

    const evaluation = await InterviewEvaluation.findOneAndUpdate(
      { studentId, hrId },
      {
        studentId,
        hrId,
        criterionScores: validatedScores,
        totalScore: calculatedTotal,
        percentage,
        remarks: remarks ? remarks.trim() : '',
        strengths: strengths || '',
        improvementAreas: improvementAreas || '',
        recommendation: recommendation || 'Recommended',
        status,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update assignment status
    await InterviewAssignment.findOneAndUpdate({ studentId, hrId }, { status: 'completed' });

    await AuditLog.create({
      actorId: hrId,
      actorName: req.user?.name || 'HR Interviewer',
      action: 'HR_EVALUATION_SUBMITTED',
      targetType: 'InterviewEvaluation',
      targetId: evaluation._id.toString(),
      details: `Submitted interview marks for candidate ${studentId}: ${calculatedTotal}/50 (${recommendation})`,
    });

    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
}

export async function getInterviewEvaluations(req, res, next) {
  try {
    const { studentId, hrId } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (hrId) query.hrId = hrId;

    const evaluations = await InterviewEvaluation.find(query);
    res.json({ success: true, count: evaluations.length, data: evaluations });
  } catch (err) {
    next(err);
  }
}
