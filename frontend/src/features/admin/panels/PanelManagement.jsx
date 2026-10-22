import React, { useState, useEffect } from 'react';
import {
  Grid3X3,
  Layers,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  ArrowRight,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import demoService from '../../../services/demoService';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import PageHeader from '../../../components/layout/PageHeader';

export default function PanelManagement() {
  const [panels, setPanels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [judges, setJudges] = useState([]);
  const [quals, setQuals] = useState([]);

  // Modals
  const [selectedPanelForGroups, setSelectedPanelForGroups] = useState(null);
  const [editingPanel, setEditingPanel] = useState(null);
  const [panelName, setPanelName] = useState('');
  const [panelLocation, setPanelLocation] = useState('');

  // Add Panel Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPanelName, setNewPanelName] = useState('');
  const [newPanelCode, setNewPanelCode] = useState('');
  const [newPanelLocation, setNewPanelLocation] = useState('');
  const [newPanelJudgeId, setNewPanelJudgeId] = useState('');
  const [addPanelError, setAddPanelError] = useState('');

  const loadData = () => {
    setPanels(demoService.getPanels());
    setGroups(demoService.getGroups());
    setStudents(demoService.getStudents());
    const allJudges = demoService.getUsers().filter((u) => u.role === 'judge');
    setJudges(allJudges);
    if (allJudges.length > 0 && !newPanelJudgeId) {
      setNewPanelJudgeId(allJudges[0].id);
    }
    setQuals(demoService.getQualifications());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (panel) => {
    setEditingPanel(panel);
    setPanelName(panel.name);
    setPanelLocation(panel.location || '');
  };

  const handleSavePanel = (e) => {
    e.preventDefault();
    if (!panelName.trim()) return;

    demoService.updatePanel(editingPanel.id, {
      name: panelName,
      location: panelLocation,
    });
    setEditingPanel(null);
    loadData();
  };

  const handleOpenAdd = () => {
    const nextIdx = panels.length + 1;
    setNewPanelName(`Panel ${String.fromCharCode(64 + nextIdx)}`);
    setNewPanelCode(`PANEL-${String.fromCharCode(64 + nextIdx)}`);
    setNewPanelLocation('Seminar Hall');
    setAddPanelError('');
    setIsAddModalOpen(true);
  };

  const handleCreatePanel = (e) => {
    e.preventDefault();
    setAddPanelError('');
    if (!newPanelName.trim() || !newPanelCode.trim()) {
      setAddPanelError('Panel name and code are required.');
      return;
    }

    try {
      demoService.addPanel({
        name: newPanelName.trim(),
        code: newPanelCode.trim().toUpperCase(),
        location: newPanelLocation.trim(),
        assignedJudgeIds: [newPanelJudgeId || judges[0]?.id || 'user-judge-1'],
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      setAddPanelError(err.message || 'Error creating panel');
    }
  };

  const handleDeletePanel = (panel) => {
    if (panels.length <= 1) {
      alert('At least one GD panel must remain active in the system.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete panel "${panel.name}" (${panel.code})? Any groups assigned to this panel will need reassignment.`)) {
      try {
        demoService.deletePanel(panel.id);
        loadData();
      } catch (err) {
        alert(err.message || 'Error deleting panel');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="GD Panel Management"
        subtitle="Manage Group Discussion panels, room venues, and judge allocations."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'GD Panels' }]}
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add Panel
          </Button>
        }
      />

      {/* Panels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {panels.map((panel) => {
          const panelGroups = groups.filter((g) => g.panelId === panel.id);
          const totalStudents = panelGroups.reduce((acc, g) => acc + g.studentIds.length, 0);
          const completedGroups = panelGroups.filter((g) => g.evaluationStatus === 'completed').length;
          const assignedJudge = judges.find((j) => panel.assignedJudgeIds?.includes(j.id));
          const qualifiedInPanel = quals.filter((q) => q.panelId === panel.id && q.status === 'qualified').length;
          const completionPct = panelGroups.length > 0 ? Math.round((completedGroups / panelGroups.length) * 100) : 0;

          return (
            <Card
              key={panel.id}
              className="border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between"
              noPadding
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
                    {panel.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={completionPct === 100 ? 'success' : 'blue'} size="sm">
                      {completionPct === 100 ? 'Evaluations Done' : 'In Session'}
                    </Badge>
                    <button
                      onClick={() => handleDeletePanel(panel)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                      title="Delete Panel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-2.5">{panel.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{panel.location || 'Main Campus'}</p>
              </div>

              {/* Card Stats */}
              <div className="p-5 space-y-3.5 flex-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-medium block">Groups</span>
                    <span className="font-bold text-slate-800 text-sm">{panelGroups.length} Groups</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-medium block">Candidates</span>
                    <span className="font-bold text-slate-800 text-sm">{totalStudents} Students</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-xs">
                  <span className="text-blue-600 font-semibold uppercase text-[10px] block">Assigned GD Judges</span>
                  <span className="font-bold text-slate-900">
                    {panel.assignedJudgeIds
                      ?.map((id) => judges.find((j) => j.id === id)?.name || id)
                      .join(', ') || 'All Judges'}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Evaluation Progress</span>
                    <span className="font-bold text-slate-900">{completionPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {completedGroups} of {panelGroups.length} groups evaluated
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Qualified for Round 2:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {qualifiedInPanel} Candidates
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(panel)}
                  icon={Edit2}
                >
                  Configure
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPanelForGroups(panel)}
                  icon={Eye}
                >
                  View Groups
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Panel Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New GD Panel"
          subtitle="Configure a new Group Discussion panel room and evaluator judge."
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreatePanel}>
                Create Panel
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreatePanel} className="space-y-4">
            {addPanelError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
                {addPanelError}
              </div>
            )}
            <Input
              label="Panel Name"
              value={newPanelName}
              onChange={(e) => setNewPanelName(e.target.value)}
              placeholder="e.g. Panel B — Seminar Hall"
              required
            />
            <Input
              label="Panel Code"
              value={newPanelCode}
              onChange={(e) => setNewPanelCode(e.target.value)}
              placeholder="e.g. PANEL-B"
              required
            />
            <Input
              label="Venue / Room Location"
              value={newPanelLocation}
              onChange={(e) => setNewPanelLocation(e.target.value)}
              placeholder="e.g. Room 204, Academic Block"
              required
            />
            <Select
              label="Lead Evaluator Judge"
              options={judges.map((j) => ({ value: j.id, label: j.name }))}
              value={newPanelJudgeId}
              onChange={(e) => setNewPanelJudgeId(e.target.value)}
            />
          </form>
        </Modal>
      )}

      {/* View Groups in Selected Panel Modal */}
      {selectedPanelForGroups && (
        <Modal
          isOpen={!!selectedPanelForGroups}
          onClose={() => setSelectedPanelForGroups(null)}
          title={`Groups Assigned to ${selectedPanelForGroups.name}`}
          subtitle={`Showing all 4-6 participant groups allocated to ${selectedPanelForGroups.code}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedPanelForGroups(null)}>
              Close
            </Button>
          }
        >
          {(() => {
            const panelGroups = groups.filter((g) => g.panelId === selectedPanelForGroups.id);
            return (
              <div className="space-y-3">
                {panelGroups.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No groups currently assigned to this panel.</p>
                ) : (
                  panelGroups.map((grp) => {
                    const groupStudents = students.filter((s) => grp.studentIds.includes(s.id));
                    return (
                      <div
                        key={grp.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{grp.groupName}</span>
                            <span className="text-xs text-slate-400 font-mono ml-2">{grp.groupCode}</span>
                          </div>
                          <Badge
                            variant={grp.evaluationStatus === 'completed' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {grp.evaluationStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                          {groupStudents.map((s) => (
                            <span
                              key={s.id}
                              className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                            >
                              {s.name} ({s.registrationId})
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Edit Panel Modal */}
      {editingPanel && (
        <Modal
          isOpen={!!editingPanel}
          onClose={() => setEditingPanel(null)}
          title={`Configure ${editingPanel.name}`}
          subtitle="Update panel title and room venue details."
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingPanel(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSavePanel}>
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSavePanel} className="space-y-3">
            <Input
              label="Panel Name"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              required
            />
            <Input
              label="Venue Location"
              value={panelLocation}
              onChange={(e) => setPanelLocation(e.target.value)}
              placeholder="e.g. Auditorium Hall 1"
              required
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
