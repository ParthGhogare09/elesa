import FinalResult from '../models/FinalResult.js';
import Qualification from '../models/Qualification.js';
import GDEvaluation from '../models/GDEvaluation.js';
import InterviewEvaluation from '../models/InterviewEvaluation.js';
import Group from '../models/Group.js';
import Event from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';

export async function getLeaderboard(req, res, next) {
  try {
    const results = await FinalResult.find().sort({ rank: 1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    next(err);
  }
}

export async function recalculateFinalScores(req, res, next) {
  try {
    const { gdWeight = 40, hrWeight = 60, workflow = 'workflow_b' } = req.body;

    if (Number(gdWeight) + Number(hrWeight) !== 100) {
      return res.status(400).json({
        message: `Scoring weights must sum to 100%. Received: GD ${gdWeight}% + HR ${hrWeight}% = ${Number(gdWeight) + Number(hrWeight)}%`,
      });
    }

    const quals = await Qualification.find({ status: 'qualified' });
    const gdEvals = await GDEvaluation.find({ status: 'submitted' });
    const hrEvals = await InterviewEvaluation.find({ status: 'submitted' });
    const groups = await Group.find();

    const compiledResults = [];

    for (const qual of quals) {
      const studentId = qual.studentId;
      const group = groups.find((g) => g.studentIds.includes(studentId));
      const sGDEval = gdEvals.find((e) => e.studentId === studentId);
      const sHREvals = hrEvals.filter((e) => e.studentId === studentId);

      if (!sGDEval || sHREvals.length === 0) continue;

      const gdScore = sGDEval.totalScore;
      const gdPercentage = (gdScore / 60) * 100;

      let hrScore = 0;
      let hrPercentage = 0;
      let hr1Score = null;
      let hr2Score = null;

      const hr1 = sHREvals.find((e) => e.hrId === 'user-hr-1');
      const hr2 = sHREvals.find((e) => e.hrId === 'user-hr-2');

      if (hr1) hr1Score = hr1.totalScore;
      if (hr2) hr2Score = hr2.totalScore;

      if (workflow === 'workflow_b' && hr1 && hr2) {
        const p1 = (hr1.totalScore / 50) * 100;
        const p2 = (hr2.totalScore / 50) * 100;
        hrPercentage = (p1 + p2) / 2;
        hrScore = (hr1.totalScore + hr2.totalScore) / 2;
      } else {
        const single = sHREvals[0];
        hrScore = single.totalScore;
        hrPercentage = (single.totalScore / 50) * 100;
      }

      const finalScore = Math.round(((gdPercentage * (gdWeight / 100)) + (hrPercentage * (hrWeight / 100))) * 10) / 10;

      compiledResults.push({
        studentId,
        groupId: group ? group._id.toString() : '',
        panelId: group ? group.panelId : '',
        gdScore,
        gdPercentage: Math.round(gdPercentage * 10) / 10,
        hr1Score,
        hr2Score,
        hrScore: Math.round(hrScore * 10) / 10,
        hrPercentage: Math.round(hrPercentage * 10) / 10,
        finalScore,
        scoringConfigSnapshot: { gdWeight, hrWeight },
      });
    }

    // Rank with tie-breakers: Final score -> HR % -> GD %
    compiledResults.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.hrPercentage !== a.hrPercentage) return b.hrPercentage - a.hrPercentage;
      return b.gdPercentage - a.gdPercentage;
    });

    // Save or update in MongoDB
    await FinalResult.deleteMany({});
    const saved = [];
    for (let i = 0; i < compiledResults.length; i++) {
      const item = compiledResults[i];
      const rank = i + 1;
      const selectionStatus = rank <= 12 ? 'selected' : (rank <= 20 ? 'waitlisted' : 'not_selected');
      const doc = await FinalResult.create({
        ...item,
        rank,
        selectionStatus,
      });
      saved.push(doc);
    }

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      action: 'FINAL_SCORES_RECALCULATED',
      targetType: 'FinalResult',
      targetId: 'all',
      details: `Recomputed rankings using GD ${gdWeight}% + HR ${hrWeight}%`,
    });

    res.json({ success: true, count: saved.length, data: saved });
  } catch (err) {
    next(err);
  }
}

export async function publishResults(req, res, next) {
  try {
    const publishedAt = new Date();
    await FinalResult.updateMany({}, { publishedAt });
    await Event.findOneAndUpdate({}, { status: 'published', resultPublicationStatus: 'published', publishedAt });

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      action: 'RESULTS_PUBLISHED',
      targetType: 'Event',
      targetId: 'evt-2026-01',
      details: 'Administrator officially published and froze the final placement results.',
    });

    res.json({ success: true, message: 'Results officially published.', publishedAt });
  } catch (err) {
    next(err);
  }
}
