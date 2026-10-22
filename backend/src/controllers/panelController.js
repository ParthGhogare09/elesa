import Panel from '../models/Panel.js';
import AuditLog from '../models/AuditLog.js';

export async function getPanels(req, res, next) {
  try {
    const panels = await Panel.find().sort({ code: 1 });
    res.json({ success: true, data: panels });
  } catch (err) {
    next(err);
  }
}

export async function updatePanel(req, res, next) {
  try {
    const panel = await Panel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!panel) return res.status(404).json({ message: 'Panel not found' });

    await AuditLog.create({
      actorName: req.user?.name || 'Admin',
      action: 'PANEL_UPDATED',
      targetType: 'Panel',
      targetId: panel._id.toString(),
      details: `Updated details for panel ${panel.code}`,
    });

    res.json({ success: true, data: panel });
  } catch (err) {
    next(err);
  }
}
