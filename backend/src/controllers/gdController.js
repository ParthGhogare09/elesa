import GDEvaluation from '../models/GDEvaluation.js';
import GDGroupEvaluation from '../models/GDGroupEvaluation.js';
import GDRecommendation from '../models/GDRecommendation.js';
import Group from '../models/Group.js';
import AuditLog from '../models/AuditLog.js';

const GD_CRITERIA_KEYS = ['comm', 'clarity', 'confidence', 'reasoning', 'teamwork', 'initiative'];
const GROUP_CRITERIA_KEYS = ['topic_depth', 'discussion_flow', 'team_synergy', 'decorum_time'];

export async function getJudgeGroups(req, res, next) {
  try {
    // Single Unified Panel: Any judge can view and select any group
    const groups = await Group.find({});
    res.json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    next(err);
  }
}

export async function getGDEvaluations(req, res, next) {
  try {
    const { groupId, judgeId, studentId } = req.query;
    const query = {};
    if (groupId) query.groupId = groupId;
    if (judgeId) query.judgeId = judgeId;
    if (studentId) query.studentId = studentId;

    const evaluations = await GDEvaluation.find(query);
    res.json({ success: true, count: evaluations.length, data: evaluations });
  } catch (err) {
    next(err);
  }
}

export async function submitGDEvaluation(req, res, next) {
  try {
    const judgeId = req.user.id;
    const { groupId, studentId, criterionScores, remarks, status = 'submitted' } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    // Register judge on group if not already present
    if (!group.judgeIds.includes(judgeId)) {
      group.judgeIds.push(judgeId);
      await group.save();
    }

    if (!group.studentIds.includes(studentId)) {
      return res.status(400).json({ message: 'Student does not belong to this group.' });
    }

    // Authoritative backend validation of criterion marks (0-10) and total score calculation
    let calculatedTotal = 0;
    const validatedScores = {};

    for (const key of GD_CRITERIA_KEYS) {
      const score = Number(criterionScores?.[key]);
      if (isNaN(score) || score < 0 || score > 10) {
        return res.status(400).json({
          message: `Criterion score for '${key}' must be a numeric value between 0 and 10. Received: ${score}`,
        });
      }
      validatedScores[key] = score;
      calculatedTotal += score;
    }

    if (status === 'submitted' && (!remarks || !remarks.trim())) {
      return res.status(400).json({ message: "Judge's remarks are mandatory for submission." });
    }

    const percentage = Math.round((calculatedTotal / 60) * 100 * 10) / 10;

    const evaluation = await GDEvaluation.findOneAndUpdate(
      { groupId, studentId, judgeId },
      {
        groupId,
        studentId,
        judgeId,
        criterionScores: validatedScores,
        totalScore: calculatedTotal,
        percentage,
        remarks: remarks ? remarks.trim() : '',
        status,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update group evaluation status if all students evaluated
    const allGroupEvals = await GDEvaluation.find({ groupId, judgeId, status: 'submitted' });
    if (allGroupEvals.length === group.studentIds.length) {
      group.evaluationStatus = 'completed';
      await group.save();
    } else if (allGroupEvals.length > 0) {
      group.evaluationStatus = 'partially_evaluated';
      await group.save();
    }

    await AuditLog.create({
      actorId: judgeId,
      actorName: req.user?.name || 'Judge',
      action: 'GD_EVALUATION_SUBMITTED',
      targetType: 'GDEvaluation',
      targetId: evaluation._id.toString(),
      details: `Submitted GD score for candidate ${studentId}: ${calculatedTotal}/60`,
    });

    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
}

export async function submitGDRecommendations(req, res, next) {
  try {
    const judgeId = req.user.id;
    const { groupId } = req.params;
    const { studentIds } = req.body;

    // Critical Business Rule: Maximum 3 recommendations per group per judge!
    if (!Array.isArray(studentIds) || studentIds.length > 3) {
      return res.status(400).json({
        message: 'Strict rule limit: A judge can recommend a maximum of 3 students per group for Round 2.',
      });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Validate students belong to group
    const invalidIds = studentIds.filter((id) => !group.studentIds.includes(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: 'Recommended students must belong to this assigned group.' });
    }

    const rec = await GDRecommendation.findOneAndUpdate(
      { groupId, judgeId },
      {
        groupId,
        judgeId,
        studentIds,
        status: 'submitted',
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update recommendation flags in evaluations
    await GDEvaluation.updateMany(
      { groupId, judgeId, studentId: { $in: studentIds } },
      { recommendation: true }
    );
    await GDEvaluation.updateMany(
      { groupId, judgeId, studentId: { $nin: studentIds } },
      { recommendation: false }
    );

    await AuditLog.create({
      actorId: judgeId,
      actorName: req.user?.name || 'Judge',
      action: 'GD_RECOMMENDATIONS_SUBMITTED',
      targetType: 'GDRecommendation',
      targetId: rec._id.toString(),
      details: `Recommended ${studentIds.length} candidate(s) (Maximum 3) for ${group.groupName}`,
    });

    res.json({ success: true, data: rec });
  } catch (err) {
    next(err);
  }
}

export async function submitGDGroupEvaluation(req, res, next) {
  try {
    const judgeId = req.user.id;
    const { groupId } = req.params;
    const { criterionScores, remarks, status = 'submitted' } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.judgeIds.includes(judgeId)) {
      group.judgeIds.push(judgeId);
      await group.save();
    }

    let calculatedTotal = 0;
    const validatedScores = {};

    for (const key of GROUP_CRITERIA_KEYS) {
      const score = Number(criterionScores?.[key]);
      if (isNaN(score) || score < 0 || score > 10) {
        return res.status(400).json({
          message: `Group criterion '${key}' must be a number between 0 and 10. Received: ${score}`,
        });
      }
      validatedScores[key] = score;
      calculatedTotal += score;
    }

    if (status === 'submitted' && (!remarks || !remarks.trim())) {
      return res.status(400).json({ message: 'Group overall remarks are mandatory for submission.' });
    }

    const percentage = Math.round((calculatedTotal / 40) * 100 * 10) / 10;

    const groupEvaluation = await GDGroupEvaluation.findOneAndUpdate(
      { groupId, judgeId },
      {
        groupId,
        judgeId,
        criterionScores: validatedScores,
        totalScore: calculatedTotal,
        percentage,
        remarks: remarks ? remarks.trim() : '',
        status,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      actorId: judgeId,
      actorName: req.user?.name || 'Judge',
      action: 'GD_GROUP_EVALUATION_SUBMITTED',
      targetType: 'GDGroupEvaluation',
      targetId: groupEvaluation._id.toString(),
      details: `Submitted group dynamics evaluation for ${group.groupName}: ${calculatedTotal}/40`,
    });

    res.json({ success: true, data: groupEvaluation });
  } catch (err) {
    next(err);
  }
}

export async function getGDGroupEvaluations(req, res, next) {
  try {
    const { groupId } = req.params;
    const query = {};
    if (groupId) query.groupId = groupId;

    const evaluations = await GDGroupEvaluation.find(query);
    res.json({ success: true, count: evaluations.length, data: evaluations });
  } catch (err) {
    next(err);
  }
}

