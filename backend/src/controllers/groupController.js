import Group from '../models/Group.js';
import AuditLog from '../models/AuditLog.js';

export async function getGroups(req, res, next) {
  try {
    const { panelId } = req.query;
    const query = {};
    if (panelId) query.panelId = panelId;

    const groups = await Group.find(query).sort({ groupCode: 1 });
    res.json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    next(err);
  }
}

export async function getGroupById(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
}

export async function createGroup(req, res, next) {
  try {
    const { groupName, studentIds, panelId, judgeIds } = req.body;

    // Strict Rule: 4 to 6 students per group
    if (!studentIds || studentIds.length < 4 || studentIds.length > 6) {
      return res.status(400).json({
        message: `Group membership constraint violated: Must contain between 4 and 6 students. Received ${studentIds?.length || 0}.`,
      });
    }

    // Strict Rule: Student cannot belong to multiple active groups in same event
    const activeGroups = await Group.find({ studentIds: { $in: studentIds } });
    if (activeGroups.length > 0) {
      return res.status(400).json({
        message: 'One or more selected students are already allocated to an active group.',
      });
    }

    const groupCount = await Group.countDocuments();
    const groupCode = `GD-GRP-${String(groupCount + 1).padStart(2, '0')}`;

    const group = await Group.create({
      groupName: groupName || `Group ${groupCount + 1}`,
      groupCode,
      panelId,
      judgeIds: judgeIds || [],
      studentIds,
      evaluationStatus: 'pending',
    });

    await AuditLog.create({
      actorName: req.user?.name || 'Admin',
      action: 'GROUP_CREATED',
      targetType: 'Group',
      targetId: group._id.toString(),
      details: `Created ${group.groupName} (${group.groupCode}) with ${studentIds.length} students assigned to ${panelId}`,
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
}
