import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  PlusCircle,
  Users,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Grid3X3,
  Award,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import demoService from '../../../services/demoService';
import DataTable from '../../../components/tables/DataTable';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import PageHeader from '../../../components/layout/PageHeader';

export default function GroupManagement() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [panels, setPanels] = useState([]);
  const [judges, setJudges] = useState([]);
  const [recs, setRecs] = useState([]);

  // Guided Creation Wizard State (Steps 1 to 5)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardError, setWizardError] = useState('');

  // Step 1: Info
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  // Step 2: Student Selection (Strictly 4 to 6 students)
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Step 3: Panel Assignment
  const [selectedPanelId, setSelectedPanelId] = useState('panel-a');

  // Step 4: Judge Assignment
  const [selectedJudgeId, setSelectedJudgeId] = useState('user-judge-1');

  // Bulk Generator Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Group Details Modal
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);

  const loadData = () => {
    setGroups(demoService.getGroups());
    setStudents(demoService.getStudents());
    setPanels(demoService.getPanels());
    setJudges(demoService.getUsers().filter((u) => u.role === 'judge'));
    setRecs(demoService.getGDRecommendations());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute unassigned students
  const unassignedStudents = useMemo(() => {
    const assignedIds = new Set();
    groups.forEach((g) => g.studentIds.forEach((id) => assignedIds.add(id)));
    return students.filter((s) => !assignedIds.has(s.id));
  }, [students, groups]);

  const handleOpenWizard = () => {
    const nextGroupNum = groups.length + 1;
    setGroupName(`Group ${nextGroupNum}`);
    setGroupDescription('Standard 4-6 candidate discussion group');
    setSelectedStudentIds([]);
    setSelectedPanelId('panel-a');
    setSelectedJudgeId(judges[0]?.id || 'user-judge-1');
    setCurrentStep(1);
    setWizardError('');
    setIsWizardOpen(true);
  };

  const handleToggleStudentSelection = (studentId) => {
    setWizardError('');
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      if (selectedStudentIds.length >= 6) {
        setWizardError('Maximum 6 students allowed per group.');
        return;
      }
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleNextStep = () => {
    setWizardError('');
    if (currentStep === 1) {
      if (!groupName.trim()) {
        setWizardError('Group name is required.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedStudentIds.length < 4) {
        setWizardError(`At least 4 students required. Currently selected: ${selectedStudentIds.length}`);
        return;
      }
      if (selectedStudentIds.length > 6) {
        setWizardError(`Maximum 6 students allowed. Currently selected: ${selectedStudentIds.length}`);
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedPanelId) {
        setWizardError('Please select a GD panel.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!selectedJudgeId) {
        setWizardError('Please assign an evaluator judge.');
        return;
      }
      setCurrentStep(5);
    }
  };

  const handleSaveGroup = () => {
    try {
      demoService.createGroup({
        groupName,
        studentIds: selectedStudentIds,
        panelId: selectedPanelId,
        judgeIds: [selectedJudgeId],
      });
      loadData();
      setIsWizardOpen(false);
    } catch (err) {
      setWizardError(err.message || 'Error creating group.');
    }
  };

  // Bulk Group Generation
  const handleBulkCreate = () => {
    try {
      if (unassignedStudents.length < 4) {
        alert('Need at least 4 unassigned students to form groups.');
        return;
      }
      demoService.bulkCreateGroups({
        selectedStudentIds: unassignedStudents.map((s) => s.id),
        targetPanelIds: ['panel-a', 'panel-b', 'panel-c', 'panel-d'],
        judgeAssignments: {
          'panel-a': 'user-judge-1',
          'panel-b': 'user-judge-2',
          'panel-c': 'user-judge-1',
          'panel-d': 'user-judge-2',
        },
      });
      loadData();
      setIsBulkModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error in bulk allocation');
    }
  };

  const handleDeleteGroup = (group) => {
    if (window.confirm(`Are you sure you want to delete "${group.groupName}"? Associated group evaluations will be removed.`)) {
      demoService.deleteGroup(group.id);
      loadData();
      if (selectedGroupDetails?.id === group.id) {
        setSelectedGroupDetails(null);
      }
    }
  };

  const columns = [
    {
      header: 'Group Info',
      key: 'groupName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.groupName}</p>
          <p className="text-xs text-slate-400 font-mono">{row.groupCode}</p>
        </div>
      ),
    },
    {
      header: 'Students Count',
      key: 'studentIds',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 text-sm">{row.studentIds.length} / 6</span>
          <span className="text-[11px] text-slate-400 block">Participants</span>
        </div>
      ),
    },
    {
      header: 'Panel & Venue',
      key: 'panelId',
      render: (row) => {
        const p = panels.find((panel) => panel.id === row.panelId);
        return (
          <div>
            <span className="font-semibold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {p?.code || row.panelId}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">{p?.location || '-'}</p>
          </div>
        );
      },
    },
    {
      header: 'Assigned Judge',
      key: 'judgeIds',
      render: (row) => {
        const j = judges.find((judge) => row.judgeIds?.includes(judge.id));
        return (
          <span className="text-xs font-medium text-slate-800">
            {j?.name || 'Prof. Alex Sharma'}
          </span>
        );
      },
    },
    {
      header: 'Evaluation Status',
      key: 'evaluationStatus',
      render: (row) => {
        if (row.evaluationStatus === 'completed') {
          return <Badge variant="success" size="sm">Fully Evaluated</Badge>;
        }
        if (row.evaluationStatus === 'partially_evaluated') {
          return <Badge variant="warning" size="sm">Partially Done</Badge>;
        }
        return <Badge variant="gray" size="sm">Pending GD</Badge>;
      },
    },
    {
      header: 'Recommended (R2)',
      key: 'recommendations',
      render: (row) => {
        const groupRec = recs.find((r) => r.groupId === row.id);
        const count = groupRec ? groupRec.studentIds.length : 0;
        return (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${count > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-400'}`}>
            {count} / 3 Max
          </span>
        );
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedGroupDetails(row)}
            icon={Eye}
          >
            View
          </Button>
          <button
            type="button"
            title="Delete Group"
            onClick={() => handleDeleteGroup(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Group Discussion Allocation"
        subtitle="Organize students into balanced cohorts of 4 to 6 candidates, allocated across 4 panels."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Groups' }]}
        actions={
          <div className="flex items-center gap-2">
            {unassignedStudents.length > 0 && (
              <Button
                variant="secondary"
                icon={Sparkles}
                onClick={() => setIsBulkModalOpen(true)}
              >
                Auto-Distribute ({unassignedStudents.length} Unassigned)
              </Button>
            )}
            <Button variant="primary" icon={PlusCircle} onClick={handleOpenWizard}>
              Create Group (Guided 4-6)
            </Button>
          </div>
        }
      />

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Active Groups</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{groups.length} Groups</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Assigned Students</span>
          <p className="text-xl font-bold text-blue-600 mt-0.5">
            {students.length - unassignedStudents.length} / {students.length}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Unassigned Pool</span>
          <p className="text-xl font-bold text-amber-600 mt-0.5">{unassignedStudents.length} Students</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Group Size Policy</span>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">4 – 6 Participants</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={groups}
        searchPlaceholder="Search groups by name or code..."
        searchKeys={['groupName', 'groupCode']}
        pageSize={10}
      />

      {/* Guided 5-Step Group Creation Wizard */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={`Group Creation Wizard — Step ${currentStep} of 5`}
        subtitle="Forming a balanced discussion group adhering to the 4–6 participant rule."
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            >
              Previous Step
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setIsWizardOpen(false)}>
                Cancel
              </Button>
              {currentStep < 5 ? (
                <Button variant="primary" onClick={handleNextStep}>
                  Next Step
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSaveGroup}>
                  Save &amp; Confirm Group
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step Progress Pills */}
          <div className="grid grid-cols-5 gap-1.5 pb-3 border-b border-slate-100 text-center">
            {['1. Details', '2. Students (4-6)', '3. Panel', '4. Judge', '5. Review'].map((label, idx) => (
              <div
                key={label}
                className={`py-1.5 rounded-lg text-[11px] font-bold ${
                  currentStep === idx + 1
                    ? 'bg-blue-600 text-white'
                    : currentStep > idx + 1
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {wizardError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{wizardError}</span>
            </div>
          )}

          {/* STEP 1: Details */}
          {currentStep === 1 && (
            <div className="space-y-4 py-2">
              <Input
                label="Group Title / Cohort Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Group 21"
                required
              />
              <Input
                label="Discussion Notes / Description (Optional)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="e.g. Mixed branch cohort for Session 2"
              />
            </div>
          )}

          {/* STEP 2: Student Selection (4-6 strictly enforced) */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs">
                <div>
                  <span className="font-bold text-blue-900">Required: 4 to 6 Students</span>
                  <p className="text-blue-700 text-[11px]">Select candidates from unassigned participants.</p>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    selectedStudentIds.length >= 4 && selectedStudentIds.length <= 6
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Selected: {selectedStudentIds.length} / 6
                </span>
              </div>

              <Input
                placeholder="Filter unassigned students by name or branch..."
                icon={Search}
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="!mb-2"
              />

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {unassignedStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">
                    All students are already assigned to active groups.
                  </p>
                ) : (
                  unassignedStudents
                    .filter((s) => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || s.branch.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                    .map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudentSelection(student.id)}
                          className={`p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 transition ${
                            isSelected ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{student.name}</p>
                              <p className="text-[11px] text-slate-400">{student.registrationId} • {student.branch}</p>
                            </div>
                          </div>
                          {isSelected && <Badge variant="blue" size="sm">Added</Badge>}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Assign Panel */}
          {currentStep === 3 && (
            <div className="space-y-3 py-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Select GD Panel (Panel A - D)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {panels.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPanelId(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedPanelId === p.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                      <span className="text-xs font-mono font-bold text-blue-600">{p.code}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.location || 'Campus Center'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Assign Judge */}
          {currentStep === 4 && (
            <div className="space-y-3 py-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Assign Evaluator Judge
              </label>
              <div className="grid grid-cols-2 gap-3">
                {judges.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => setSelectedJudgeId(j.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedJudgeId === j.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 text-sm block">{j.name}</span>
                    <span className="text-xs text-slate-500">{j.title || 'GD Evaluator'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Review Group Formation</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-slate-400 font-medium block">Group Name:</span>
                  <span className="font-bold text-slate-800">{groupName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Panel:</span>
                  <span className="font-bold text-blue-600">
                    {panels.find((p) => p.id === selectedPanelId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Judge:</span>
                  <span className="font-bold text-slate-800">
                    {judges.find((j) => j.id === selectedJudgeId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Participants:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedStudentIds.length} Students (Verified 4-6)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Enrolled Candidates:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedStudentIds.map((id) => {
                    const st = students.find((s) => s.id === id);
                    return (
                      <span
                        key={id}
                        className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium"
                      >
                        {st?.name} ({st?.registrationId})
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Auto-Distribute Bulk Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Auto-Distribute Remaining Candidates"
        subtitle={`System will partition all ${unassignedStudents.length} unassigned candidates into optimal groups of 5.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkCreate}>
              Generate Groups Now
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Candidates will be partitioned evenly into cohorts of 5 (strictly adhering to the 4–6 rule), distributed sequentially across Panel A, Panel B, Panel C, and Panel D.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 font-medium">
            Estimated Groups to Form: {Math.ceil(unassignedStudents.length / 5)} groups.
          </div>
        </div>
      </Modal>

      {/* View Group Details Modal */}
      {selectedGroupDetails && (
        <Modal
          isOpen={!!selectedGroupDetails}
          onClose={() => setSelectedGroupDetails(null)}
          title={selectedGroupDetails.groupName}
          subtitle={`Group Code: ${selectedGroupDetails.groupCode} • Panel: ${
            panels.find((p) => p.id === selectedGroupDetails.panelId)?.code || ''
          }`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteGroup(selectedGroupDetails)}
              >
                Delete Group
              </Button>
              <Button variant="secondary" onClick={() => setSelectedGroupDetails(null)}>
                Close
              </Button>
            </div>
          }
        >
          {(() => {
            const memberStudents = students.filter((s) => selectedGroupDetails.studentIds.includes(s.id));
            const groupRec = recs.find((r) => r.groupId === selectedGroupDetails.id);
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block">Evaluation Progress</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {selectedGroupDetails.evaluationStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Judge Shortlist (Max 3)</span>
                    <span className="font-bold text-amber-700">
                      {groupRec ? `${groupRec.studentIds.length} / 3 Selected` : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {memberStudents.map((st, idx) => {
                    const isRec = groupRec ? groupRec.studentIds.includes(st.id) : false;
                    return (
                      <div key={st.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{st.name}</p>
                            <p className="text-[11px] text-slate-400">{st.registrationId} • {st.branch}</p>
                          </div>
                        </div>
                        {isRec && (
                          <Badge variant="amber" size="sm">
                            ★ Recommended for R2
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
