import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Eye,
  Edit3,
  Award,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
  Users,
  BarChart3,
  Layers,
  PlusCircle,
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

export default function GDEvaluationReview() {
  const [evals, setEvals] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [panels, setPanels] = useState([]);
  const [judges, setJudges] = useState([]);
  const [quals, setQuals] = useState([]);

  // Filters for Individual Tab
  const [panelFilter, setPanelFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [judgeFilter, setJudgeFilter] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState('');

  // Individual Drawer / Modal
  const [selectedEval, setSelectedEval] = useState(null);
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editedRemarks, setEditedRemarks] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');

  // Add Individual GD Score Modal - Initial marks set to 0
  const [isAddIndividualOpen, setIsAddIndividualOpen] = useState(false);
  const [individualForm, setIndividualForm] = useState({
    studentId: '',
    groupId: '',
    judgeId: '',
    criterionScores: { comm: 0, clarity: 0, confidence: 0, reasoning: 0, teamwork: 0, initiative: 0 },
    remarks: 'Consistent contributions, good articulation, and positive team demeanour.',
  });
  const [addIndividualError, setAddIndividualError] = useState('');

  const loadData = () => {
    setEvals(demoService.getGDEvaluations());
    setStudents(demoService.getStudents());
    setGroups(demoService.getGroups());
    setPanels(demoService.getPanels());
    setJudges(demoService.getUsers().filter((u) => u.role === 'judge'));
    setQuals(demoService.getQualifications());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteEval = (evalRecord) => {
    const student = students.find((s) => s.id === evalRecord.studentId);
    if (window.confirm(`Are you sure you want to delete GD evaluation for "${student?.name || evalRecord.studentId}"?`)) {
      demoService.deleteGDEvaluation(evalRecord.id);
      loadData();
      if (selectedEval?.id === evalRecord.id) {
        setSelectedEval(null);
      }
    }
  };

  const handleOpenAddIndividual = () => {
    const firstStudent = students[0];
    const studentGroup = groups.find(g => g.studentIds?.includes(firstStudent?.id)) || groups[0];
    setIndividualForm({
      studentId: firstStudent?.id || '',
      groupId: studentGroup?.id || '',
      judgeId: judges[0]?.id || 'user-judge-1',
      criterionScores: { comm: 0, clarity: 0, confidence: 0, reasoning: 0, teamwork: 0, initiative: 0 },
      remarks: '',
    });
    setAddIndividualError('');
    setIsAddIndividualOpen(true);
  };

  const handleStudentSelectChange = (stId) => {
    const foundGroup = groups.find(g => g.studentIds?.includes(stId));
    setIndividualForm(prev => ({
      ...prev,
      studentId: stId,
      groupId: foundGroup ? foundGroup.id : prev.groupId,
    }));
  };

  const handleSaveIndividualEval = () => {
    try {
      if (!individualForm.studentId) throw new Error('Please select a student.');
      if (!individualForm.groupId) throw new Error('Please select a group.');
      if (!individualForm.judgeId) throw new Error('Please select an evaluator judge.');
      if (!individualForm.remarks?.trim()) throw new Error('Remarks are required.');

      demoService.saveGDEvaluation({
        studentId: individualForm.studentId,
        groupId: individualForm.groupId,
        judgeId: individualForm.judgeId,
        criterionScores: individualForm.criterionScores,
        remarks: individualForm.remarks.trim(),
        status: 'submitted',
      });
      loadData();
      setIsAddIndividualOpen(false);
    } catch (err) {
      setAddIndividualError(err.message || 'Error saving GD evaluation');
    }
  };

  // Filter individual student evaluations
  const filteredEvals = useMemo(() => {
    return evals.filter((item) => {
      const group = groups.find((g) => g.id === item.groupId);
      if (panelFilter && group?.panelId !== panelFilter) return false;
      if (groupFilter && item.groupId !== groupFilter) return false;
      if (judgeFilter && item.judgeId !== judgeFilter) return false;
      if (recommendationFilter === 'recommended' && !item.recommendation) return false;
      if (recommendationFilter === 'not_recommended' && item.recommendation) return false;
      return true;
    });
  }, [evals, groups, panelFilter, groupFilter, judgeFilter, recommendationFilter]);

  const handleOpenDetail = (evalRecord) => {
    setSelectedEval(evalRecord);
    setEditedRemarks(evalRecord.remarks);
    setCorrectionReason('');
    setIsEditingScore(false);
  };

  const handleSaveCorrection = () => {
    if (!correctionReason.trim()) {
      alert('A valid reason is required for administrator score or remark correction.');
      return;
    }
    demoService.logAction(
      'GD_SCORE_AUDITED_CORRECTION',
      'GDEvaluation',
      selectedEval.id,
      `Admin adjusted remarks for student ${selectedEval.studentId}. Reason: ${correctionReason}`
    );
    selectedEval.remarks = editedRemarks;
    demoService.saveGDEvaluation(selectedEval);
    loadData();
    setIsEditingScore(false);
    alert('Correction recorded with complete audit log trail.');
  };

  // Columns for Individual Student Evaluations (60 Marks)
  const individualColumns = [
    {
      header: 'Student',
      key: 'studentId',
      sortable: true,
      render: (row) => {
        const student = students.find((s) => s.id === row.studentId);
        return (
          <div>
            <p className="font-bold text-slate-900">{student?.name || row.studentId}</p>
            <p className="text-xs text-slate-400 font-mono">{student?.registrationId || '-'}</p>
          </div>
        );
      },
    },
    {
      header: 'Group & Panel',
      key: 'groupId',
      render: (row) => {
        const group = groups.find((g) => g.id === row.groupId);
        const panel = panels.find((p) => p.id === group?.panelId);
        return (
          <div>
            <p className="text-xs font-semibold text-slate-800">{group?.groupName || row.groupId}</p>
            <p className="text-[11px] text-blue-600 font-bold">{panel?.code || '-'}</p>
          </div>
        );
      },
    },
    {
      header: 'Evaluator Judge',
      key: 'judgeId',
      render: (row) => {
        const judge = judges.find((j) => j.id === row.judgeId);
        return <span className="text-xs text-slate-700 font-medium">{judge?.name || row.judgeId}</span>;
      },
    },
    {
      header: 'Marks Breakdown',
      key: 'criterionScores',
      render: (row) => (
        <div className="flex gap-1 text-[11px] font-mono">
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600" title="Communication">C:{row.criterionScores?.comm}</span>
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600" title="Clarity">Cl:{row.criterionScores?.clarity}</span>
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600" title="Confidence">Cf:{row.criterionScores?.confidence}</span>
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600" title="Reasoning">R:{row.criterionScores?.reasoning}</span>
        </div>
      ),
    },
    {
      header: 'Total GD Score',
      key: 'totalScore',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 text-sm">{row.totalScore} / 60</span>
          <span className="text-[11px] text-slate-500 block font-medium">({row.percentage}%)</span>
        </div>
      ),
    },
    {
      header: 'Judge Shortlist',
      key: 'recommendation',
      render: (row) =>
        row.recommendation ? (
          <Badge variant="amber" size="sm">★ Recommended</Badge>
        ) : (
          <span className="text-xs text-slate-400">Not Shortlisted</span>
        ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => handleOpenDetail(row)} icon={Eye}>
            Review
          </Button>
          <button
            type="button"
            title="Delete GD Evaluation"
            onClick={() => handleDeleteEval(row)}
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
        title="Group Discussion Candidate Evaluations"
        subtitle="Review and inspect individual candidate performance across 6 criteria (60 Marks Total)."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'GD Evaluations' }]}
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={handleOpenAddIndividual}>
            Add GD Score
          </Button>
        }
      />

      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            label="Filter by Panel"
            options={panels.map((p) => ({ value: p.id, label: `${p.code} (${p.name})` }))}
            value={panelFilter}
            onChange={(e) => setPanelFilter(e.target.value)}
            placeholder="All Panels"
          />

          <Select
            label="Filter by Group"
            options={groups.map((g) => ({ value: g.id, label: g.groupName }))}
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            placeholder="All Groups"
          />

          <Select
            label="Filter by Judge"
            options={judges.map((j) => ({ value: j.id, label: j.name }))}
            value={judgeFilter}
            onChange={(e) => setJudgeFilter(e.target.value)}
            placeholder="All Judges"
          />

          <Select
            label="Filter by Recommendation"
            options={[
              { value: 'recommended', label: 'Only Judge Recommended (★)' },
              { value: 'not_recommended', label: 'Not Recommended' },
            ]}
            value={recommendationFilter}
            onChange={(e) => setRecommendationFilter(e.target.value)}
            placeholder="All Recommendations"
          />
        </div>

        <DataTable
          columns={individualColumns}
          data={filteredEvals}
          searchPlaceholder="Search by student registration ID or score..."
          searchKeys={['studentId', 'totalScore', 'remarks']}
          pageSize={12}
        />
      </div>

      {/* Individual Evaluation Detail & Audited Correction Drawer */}
      {selectedEval && (
        <Modal
          isOpen={!!selectedEval}
          onClose={() => setSelectedEval(null)}
          title="GD Individual Evaluation Review Drawer"
          subtitle="Inspect criterion breakdown, judge qualitative observations, and qualification eligibility."
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteEval(selectedEval)}
              >
                Delete Evaluation
              </Button>
              <Button variant="secondary" onClick={() => setSelectedEval(null)}>
                Close
              </Button>
            </div>
          }
        >
          {(() => {
            const student = students.find((s) => s.id === selectedEval.studentId);
            const group = groups.find((g) => g.id === selectedEval.groupId);
            const panel = panels.find((p) => p.id === group?.panelId);
            const judge = judges.find((j) => j.id === selectedEval.judgeId);

            return (
              <div className="space-y-4">
                {/* Header Information */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Candidate</span>
                    <span className="font-bold text-slate-900">{student?.name}</span>
                    <p className="text-[11px] text-slate-500 font-mono">{student?.registrationId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Cohort &amp; Panel</span>
                    <span className="font-bold text-slate-800">{group?.groupName}</span>
                    <p className="text-[11px] text-blue-600 font-semibold">{panel?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Evaluating Judge</span>
                    <span className="font-bold text-slate-800">{judge?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Shortlist Status</span>
                    {selectedEval.recommendation ? (
                      <Badge variant="amber" size="sm">★ Recommended (Max 3)</Badge>
                    ) : (
                      <span className="text-slate-500">Not Shortlisted</span>
                    )}
                  </div>
                </div>

                {/* Criterion Breakdown Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Criterion Scoring Rubric (Out of 60 Total)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { key: 'comm', label: 'Communication Skills', max: 10 },
                      { key: 'clarity', label: 'Clarity of Thought', max: 10 },
                      { key: 'confidence', label: 'Confidence', max: 10 },
                      { key: 'reasoning', label: 'Logical Reasoning', max: 10 },
                      { key: 'teamwork', label: 'Teamwork & Listening', max: 10 },
                      { key: 'initiative', label: 'Initiative & Leadership', max: 10 },
                    ].map((crit) => (
                      <div key={crit.key} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <span className="text-slate-600 font-medium">{crit.label}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {selectedEval.criterionScores?.[crit.key] || 0} / {crit.max}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-sm">Aggregated GD Score:</span>
                    <span className="font-black text-blue-700 text-lg">
                      {selectedEval.totalScore} / 60 ({selectedEval.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Judge Remarks & Audited Correction */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Judge Qualitative Remarks
                    </h4>
                    {!isEditingScore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => setIsEditingScore(true)}
                      >
                        Authorize Remark Correction
                      </Button>
                    )}
                  </div>

                  {!isEditingScore ? (
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-700 italic">"{selectedEval.remarks}"</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <Input
                        label="Updated Remarks"
                        value={editedRemarks}
                        onChange={(e) => setEditedRemarks(e.target.value)}
                      />
                      <Input
                        label="Administrative Correction Reason (Recorded in Audit Trail)"
                        value={correctionReason}
                        onChange={(e) => setCorrectionReason(e.target.value)}
                        placeholder="e.g. Authorized typo correction requested by Judge"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsEditingScore(false)}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSaveCorrection}>
                          Save Audited Correction
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}



      {/* Modal: Add Individual GD Score */}
      {isAddIndividualOpen && (
        <Modal
          isOpen={isAddIndividualOpen}
          onClose={() => setIsAddIndividualOpen(false)}
          title="Add Individual GD Evaluation Score"
          subtitle="Record candidate performance across 6 criteria (60 marks maximum)."
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsAddIndividualOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveIndividualEval}>
                Save Evaluation
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {addIndividualError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                {addIndividualError}
              </div>
            )}

            <Select
              label="Select Student"
              value={individualForm.studentId}
              onChange={(e) => handleStudentSelectChange(e.target.value)}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.registrationId || s.id})`,
              }))}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Assign to Group"
                value={individualForm.groupId}
                onChange={(e) => setIndividualForm({ ...individualForm, groupId: e.target.value })}
                options={groups.map((g) => ({ value: g.id, label: g.groupName }))}
                required
              />
              <Select
                label="Evaluator Judge"
                value={individualForm.judgeId}
                onChange={(e) => setIndividualForm({ ...individualForm, judgeId: e.target.value })}
                options={judges.map((j) => ({ value: j.id, label: j.name }))}
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5 uppercase text-[10px] tracking-wider">
                Criteria Scoring (0–10 Marks Each, Max 60)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'comm', label: 'Communication' },
                  { key: 'clarity', label: 'Clarity of Thought' },
                  { key: 'confidence', label: 'Confidence' },
                  { key: 'reasoning', label: 'Logical Reasoning' },
                  { key: 'teamwork', label: 'Teamwork & Listening' },
                  { key: 'initiative', label: 'Initiative & Leadership' },
                ].map((crit) => (
                  <div key={crit.key} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-600 block mb-1">{crit.label}</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={individualForm.criterionScores[crit.key] ?? 0}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.min(10, Math.max(0, Number(e.target.value) || 0));
                        setIndividualForm({
                          ...individualForm,
                          criterionScores: {
                            ...individualForm.criterionScores,
                            [crit.key]: val,
                          },
                        });
                      }}
                      className="w-full text-center font-bold text-sm bg-white border border-slate-300 rounded p-1 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Input
              label="Judge Remarks"
              value={individualForm.remarks}
              onChange={(e) => setIndividualForm({ ...individualForm, remarks: e.target.value })}
              placeholder="e.g. Well articulated perspectives and balanced floor time."
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
