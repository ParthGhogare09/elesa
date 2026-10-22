import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Users,
  Download,
  CheckCheck,
  Send,
  AlertCircle,
  Eye,
  Filter,
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

export default function QualificationManagement() {
  const [quals, setQuals] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [panels, setPanels] = useState([]);
  const [recs, setRecs] = useState([]);
  const [gdEvals, setGdEvals] = useState([]);

  const [statusFilter, setStatusFilter] = useState('');
  const [panelFilter, setPanelFilter] = useState('');
  const [recommendationFilter, setRecommendationFilter] = useState('');

  // Add Qualification Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    studentId: '',
    status: 'qualified',
    gdScore: 48,
    remarks: 'Approved by administrator for Round 2 HR interview.',
  });
  const [addError, setAddError] = useState('');

  const loadData = () => {
    setQuals(demoService.getQualifications());
    setStudents(demoService.getStudents());
    setGroups(demoService.getGroups());
    setPanels(demoService.getPanels());
    setRecs(demoService.getGDRecommendations());
    setGdEvals(demoService.getGDEvaluations());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEvaluated = gdEvals.length;
  const recommendedStudentsSet = useMemo(() => {
    const s = new Set();
    recs.forEach((r) => r.studentIds.forEach((id) => s.add(id)));
    return s;
  }, [recs]);

  const approvedForRound2 = quals.filter((q) => q.status === 'qualified').length;
  const notQualified = quals.filter((q) => q.status === 'not_qualified').length;
  const pendingReview = quals.filter((q) => q.status === 'pending' || q.status === 'under_review').length;

  const handleUpdateStatus = (studentId, status, remarks) => {
    demoService.updateQualificationStatus(studentId, status, remarks);
    loadData();
  };

  const handleDeleteQualification = (row) => {
    const student = students.find((s) => s.id === row.studentId);
    if (window.confirm(`Are you sure you want to remove qualification record for "${student?.name || row.studentId}"?`)) {
      demoService.deleteQualification(row.id);
      loadData();
    }
  };

  const handleOpenAddModal = () => {
    const qualifiedStudentIds = new Set(quals.map(q => q.studentId));
    const candidateStudent = students.find(s => !qualifiedStudentIds.has(s.id)) || students[0];
    setAddForm({
      studentId: candidateStudent?.id || '',
      status: 'qualified',
      gdScore: 48,
      remarks: 'Approved by administrator for Round 2 HR interview.',
    });
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleSaveQualification = () => {
    try {
      if (!addForm.studentId) throw new Error('Please select a student.');
      const group = groups.find(g => g.studentIds?.includes(addForm.studentId));
      const gdScoreNum = Number(addForm.gdScore) || 0;
      demoService.addQualification({
        studentId: addForm.studentId,
        groupId: group ? group.id : (groups[0]?.id || 'grp-1'),
        panelId: group ? group.panelId : (panels[0]?.id || 'panel-1'),
        status: addForm.status,
        gdScore: gdScoreNum,
        gdPercentage: Math.round((gdScoreNum / 60) * 100),
        remarks: addForm.remarks || 'Admin qualification entry.',
      });
      loadData();
      setIsAddModalOpen(false);
    } catch (err) {
      setAddError(err.message || 'Error saving qualification entry');
    }
  };

  const handleBatchApproveRecommended = () => {
    const count = demoService.batchApproveAllRecommended();
    loadData();
    alert(`Successfully approved ${count} judge-recommended candidates for Round 2 HR interviews!`);
  };

  const handleExportShortlist = () => {
    const headers = [
      'Registration ID',
      'Name',
      'Branch',
      'Group',
      'Panel',
      'GD Score',
      'GD %',
      'Judge Recommended',
      'Qualification Status',
      'Remarks',
    ];
    const rows = quals.map((q) => {
      const student = students.find((s) => s.id === q.studentId);
      const group = groups.find((g) => g.id === q.groupId);
      const panel = panels.find((p) => p.id === q.panelId);
      const isRec = recommendedStudentsSet.has(q.studentId) ? 'Yes' : 'No';
      return [
        `"${student?.registrationId || ''}"`,
        `"${student?.name || ''}"`,
        `"${student?.branch || ''}"`,
        `"${group?.groupName || ''}"`,
        `"${panel?.code || ''}"`,
        `"${q.gdScore}"`,
        `"${q.gdPercentage}%"`,
        `"${isRec}"`,
        `"${q.status}"`,
        `"${q.remarks || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlacePro_Round2_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQuals = useMemo(() => {
    return quals.filter((q) => {
      if (statusFilter && q.status !== statusFilter) return false;
      if (panelFilter && q.panelId !== panelFilter) return false;
      if (recommendationFilter === 'recommended' && !recommendedStudentsSet.has(q.studentId)) return false;
      if (recommendationFilter === 'not_recommended' && recommendedStudentsSet.has(q.studentId)) return false;
      return true;
    });
  }, [quals, statusFilter, panelFilter, recommendationFilter, recommendedStudentsSet]);

  const columns = [
    {
      header: 'Candidate',
      key: 'studentId',
      sortable: true,
      render: (row) => {
        const student = students.find((s) => s.id === row.studentId);
        return (
          <div>
            <p className="font-bold text-slate-900">{student?.name || row.studentId}</p>
            <p className="text-xs text-slate-400 font-mono">{student?.registrationId}</p>
          </div>
        );
      },
    },
    {
      header: 'Group & Panel',
      key: 'group',
      render: (row) => {
        const group = groups.find((g) => g.id === row.groupId);
        const panel = panels.find((p) => p.id === row.panelId);
        return (
          <div>
            <span className="text-xs font-semibold text-slate-800">{group?.groupName}</span>
            <p className="text-[11px] text-blue-600 font-bold">{panel?.code || '-'}</p>
          </div>
        );
      },
    },
    {
      header: 'GD Score',
      key: 'gdScore',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">{row.gdScore} / 60</span>
          <span className="text-[11px] text-slate-500 block">({row.gdPercentage}%)</span>
        </div>
      ),
    },
    {
      header: 'Judge Recommendation',
      key: 'recommendation',
      render: (row) => {
        const isRec = recommendedStudentsSet.has(row.studentId);
        return isRec ? (
          <Badge variant="amber" size="sm">★ Recommended (Max 3)</Badge>
        ) : (
          <span className="text-xs text-slate-400">Not in Shortlist</span>
        );
      },
    },
    {
      header: 'Admin Decision',
      key: 'status',
      render: (row) => {
        if (row.status === 'qualified') {
          return <Badge variant="success" size="sm">Qualified (Round 2)</Badge>;
        }
        if (row.status === 'not_qualified') {
          return <Badge variant="danger" size="sm">Not Qualified</Badge>;
        }
        return <Badge variant="warning" size="sm">Under Review</Badge>;
      },
    },
    {
      header: 'HR Eligibility',
      key: 'hrEligibility',
      render: (row) =>
        row.status === 'qualified' ? (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Eligible for Interview
          </span>
        ) : (
          <span className="text-xs text-slate-400">Ineligible</span>
        ),
    },
    {
      header: 'Administrative Action',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'qualified' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus(row.studentId, 'qualified', 'Administrator approved for Round 2.')}
            >
              Approve
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleUpdateStatus(row.studentId, 'not_qualified', 'Administrator marked not qualified.')}
            >
              Revoke
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdateStatus(row.studentId, 'under_review', 'Marked for committee review.')}
          >
            Review
          </Button>
          <button
            type="button"
            title="Delete Qualification Record"
            onClick={() => handleDeleteQualification(row)}
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
        title="Round 1 Qualification &amp; Shortlist Approval"
        subtitle="Review judge recommendations (maximum 3 per group) and confirm the official candidate shortlist for Round 2 HR Interviews."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Qualification' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Download} onClick={handleExportShortlist}>
              Export Shortlist (CSV)
            </Button>
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={handleBatchApproveRecommended}
            >
              Batch Approve ({recommendedStudentsSet.size})
            </Button>
            <Button
              variant="primary"
              icon={PlusCircle}
              onClick={handleOpenAddModal}
            >
              Add Qualification
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase">GD Evaluated</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalEvaluated} Candidates</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <span className="text-xs font-medium text-amber-700 uppercase">Judge Recommended</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{recommendedStudentsSet.size} Candidates</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-xs font-medium text-emerald-700 uppercase">Approved for Round 2</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{approvedForRound2} Candidates</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase">Not Selected</span>
          <p className="text-2xl font-bold text-slate-600 mt-1">{notQualified} Candidates</p>
        </div>
      </div>

      {/* Important Business Rule Alert */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm block">Administrator Authorization Rule</span>
          <p className="text-blue-800 mt-0.5">
            A GD Judge recommendation is an advisory shortlist (strictly limited to 3 candidates per group).
            Only candidates explicitly approved as <strong>"Qualified"</strong> by the administrator are eligible to be assigned for Round 2 HR Interviews.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Qualification Status"
          options={[
            { value: 'qualified', label: 'Qualified for HR (Round 2)' },
            { value: 'not_qualified', label: 'Not Qualified' },
            { value: 'under_review', label: 'Under Review' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Qualification Decisions"
        />

        <Select
          label="Panel"
          options={panels.map((p) => ({ value: p.id, label: `${p.code} (${p.name})` }))}
          value={panelFilter}
          onChange={(e) => setPanelFilter(e.target.value)}
          placeholder="All Panels"
        />

        <Select
          label="Recommendation"
          options={[
            { value: 'recommended', label: 'Judge Recommended (★)' },
            { value: 'not_recommended', label: 'Not Recommended' },
          ]}
          value={recommendationFilter}
          onChange={(e) => setRecommendationFilter(e.target.value)}
          placeholder="All Recommendations"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredQuals}
        searchPlaceholder="Search candidates by name, registration ID or score..."
        searchKeys={['studentId', 'status', 'gdScore']}
        pageSize={12}
      />

      {/* Modal: Add Qualification */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Round 1 Qualification Record"
          subtitle="Manually grant or adjust Round 2 HR interview qualification status for a candidate."
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveQualification}>
                Save Qualification
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {addError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                {addError}
              </div>
            )}

            <Select
              label="Select Student"
              value={addForm.studentId}
              onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.registrationId || s.id}) - ${s.branch || ''}`,
              }))}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Qualification Status"
                value={addForm.status}
                onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                options={[
                  { value: 'qualified', label: 'Qualified (Round 2 HR)' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'not_qualified', label: 'Not Qualified' },
                ]}
                required
              />

              <Input
                label="GD Score (out of 60)"
                type="number"
                min="0"
                max="60"
                value={addForm.gdScore}
                onChange={(e) => setAddForm({ ...addForm, gdScore: e.target.value })}
                required
              />
            </div>

            <Input
              label="Administrative Remarks"
              value={addForm.remarks}
              onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
              placeholder="e.g. Authorized qualification for Round 2 HR interview."
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
