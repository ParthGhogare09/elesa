import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';
import demoService from '../../../services/demoService';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import PageHeader from '../../../components/layout/PageHeader';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [panels, setPanels] = useState([]);
  const [quals, setQuals] = useState([]);
  const [gdEvals, setGdEvals] = useState([]);
  const [hrEvals, setHrEvals] = useState([]);
  const [finalResults, setFinalResults] = useState([]);

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [panelFilter, setPanelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    registrationId: '',
    name: '',
    email: '',
    branch: 'Computer Science & Engineering',
    year: '4th Year (Batch of 2026)',
    contactNumber: '',
  });
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setStudents(demoService.getStudents());
    setGroups(demoService.getGroups());
    setPanels(demoService.getPanels());
    setQuals(demoService.getQualifications());
    setGdEvals(demoService.getGDEvaluations());
    setHrEvals(demoService.getInterviewEvaluations());
    setFinalResults(demoService.getFinalResults());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Find group & panel for student
      const group = groups.find((g) => g.studentIds.includes(student.id));
      const qual = quals.find((q) => q.studentId === student.id);

      if (branchFilter && student.branch !== branchFilter) return false;
      if (panelFilter && (!group || group.panelId !== panelFilter)) return false;
      if (statusFilter) {
        if (statusFilter === 'qualified' && qual?.status !== 'qualified') return false;
        if (statusFilter === 'not_qualified' && qual?.status !== 'not_qualified') return false;
        if (statusFilter === 'unassigned' && group) return false;
      }
      return true;
    });
  }, [students, groups, quals, branchFilter, panelFilter, statusFilter]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    const nextNum = students.length + 1;
    setFormData({
      registrationId: `PP-2026-${String(nextNum).padStart(3, '0')}`,
      name: '',
      email: '',
      branch: 'Computer Science & Engineering',
      year: '4th Year (Batch of 2026)',
      contactNumber: '+91 98',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (!formData.name.trim() || !formData.email.trim() || !formData.registrationId.trim()) {
        throw new Error('Please fill in all mandatory fields.');
      }
      if (isEditing) {
        demoService.updateStudent(formData.id, formData);
      } else {
        demoService.addStudent(formData);
      }
      loadData();
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error saving student');
    }
  };

  const handleDeleteStudent = (student) => {
    if (window.confirm(`Are you sure you want to delete student "${student.name}" (${student.registrationId})? This action cannot be undone.`)) {
      try {
        demoService.deleteStudent(student.id);
        loadData();
      } catch (err) {
        alert(err.message || 'Error deleting student');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Registration ID',
      'Name',
      'Email',
      'Branch',
      'Year',
      'Group',
      'Panel',
      'GD Score (/60)',
      'Round 1 Status',
      'Final Status',
    ];
    const rows = filteredStudents.map((s) => {
      const grp = groups.find((g) => g.studentIds.includes(s.id));
      const pnl = panels.find((p) => p.id === grp?.panelId);
      const q = quals.find((item) => item.studentId === s.id);
      const res = finalResults.find((r) => r.studentId === s.id);
      return [
        `"${s.registrationId}"`,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.branch}"`,
        `"${s.year}"`,
        `"${grp?.groupName || 'Unassigned'}"`,
        `"${pnl?.name || '-'}"`,
        `"${q?.gdScore || '-'}"`,
        `"${q?.status || 'Pending'}"`,
        `"${res?.selectionStatus || '-'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlacePro_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: 'Student',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.registrationId}</p>
        </div>
      ),
    },
    {
      header: 'Branch & Year',
      key: 'branch',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-xs font-medium text-slate-800">{row.branch}</p>
          <p className="text-[11px] text-slate-400">{row.year}</p>
        </div>
      ),
    },
    {
      header: 'Group & Panel',
      key: 'group',
      render: (row) => {
        const group = groups.find((g) => g.studentIds.includes(row.id));
        const panel = panels.find((p) => p.id === group?.panelId);
        if (!group) {
          return <Badge variant="warning" size="sm">Unassigned</Badge>;
        }
        return (
          <div>
            <p className="text-xs font-medium text-slate-800">{group.groupName}</p>
            <p className="text-[11px] text-blue-600 font-semibold">{panel?.code || '-'}</p>
          </div>
        );
      },
    },
    {
      header: 'Round 1 (GD)',
      key: 'gdStatus',
      render: (row) => {
        const qual = quals.find((q) => q.studentId === row.id);
        const evalItem = gdEvals.find((e) => e.studentId === row.id);
        if (!evalItem) {
          return <span className="text-xs text-slate-400">Not Evaluated</span>;
        }
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-xs">{evalItem.totalScore}/60</span>
              <span className="text-[11px] text-slate-500">({evalItem.percentage}%)</span>
            </div>
            {evalItem.recommendation && (
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                Recommended
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Qualification',
      key: 'qualification',
      render: (row) => {
        const qual = quals.find((q) => q.studentId === row.id);
        if (!qual) return <Badge variant="gray" size="sm">Pending</Badge>;
        if (qual.status === 'qualified') return <Badge variant="success" size="sm">Qualified</Badge>;
        if (qual.status === 'not_qualified') return <Badge variant="danger" size="sm">Not Qualified</Badge>;
        return <Badge variant="warning" size="sm">Under Review</Badge>;
      },
    },
    {
      header: 'Final Selection',
      key: 'finalStatus',
      render: (row) => {
        const res = finalResults.find((r) => r.studentId === row.id);
        if (!res) return <span className="text-xs text-slate-400">—</span>;
        if (res.selectionStatus === 'selected') {
          return (
            <Badge variant="blue" size="sm">
              Selected (Rank #{res.rank})
            </Badge>
          );
        }
        if (res.selectionStatus === 'waitlisted') {
          return <Badge variant="warning" size="sm">Waitlisted</Badge>;
        }
        return <span className="text-xs text-slate-400">Not Selected</span>;
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStudentForProfile(row)}
            title="View Full Evaluation Profile"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFormData(row);
              setIsEditing(true);
              setIsAddModalOpen(true);
            }}
            title="Edit Student Info"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteStudent(row)}
            title="Delete Student"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-700" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory &amp; Candidates"
        subtitle={`Total registered candidates (${students.length}) across 4 GD Panels and HR rounds.`}
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Students' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="primary" icon={UserPlus} onClick={handleOpenAdd}>
              Add Student
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Filter by Branch"
          options={[
            { value: 'Computer Science & Engineering', label: 'Computer Science & Eng' },
            { value: 'Information Technology', label: 'Information Technology' },
            { value: 'Electronics & Communication', label: 'Electronics & Comm' },
            { value: 'Mechanical Engineering', label: 'Mechanical Eng' },
            { value: 'Electrical & Electronics', label: 'Electrical & Electronics' },
          ]}
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          placeholder="All Engineering Branches"
        />

        <Select
          label="Filter by Panel"
          options={panels.map((p) => ({ value: p.id, label: `${p.code} (${p.name})` }))}
          value={panelFilter}
          onChange={(e) => setPanelFilter(e.target.value)}
          placeholder="All GD Panels (A, B, C, D)"
        />

        <Select
          label="Round 1 Status"
          options={[
            { value: 'qualified', label: 'Qualified for HR (Round 2)' },
            { value: 'not_qualified', label: 'Not Qualified' },
            { value: 'unassigned', label: 'Unassigned to Any Group' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Qualification States"
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search by student name or registration ID..."
        searchKeys={['name', 'registrationId', 'email', 'branch']}
        pageSize={12}
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditing ? 'Edit Student Details' : 'Register New Student'}
        subtitle="Ensure registration ID and email are unique across the placement drive."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveStudent}>
              {isEditing ? 'Update Student' : 'Save & Register Student'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration ID"
              value={formData.registrationId}
              onChange={(e) => setFormData({ ...formData, registrationId: e.target.value })}
              required
              placeholder="PP-2026-101"
            />
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Aarav Sharma"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="student@campus.edu"
            />
            <Input
              label="Contact Number"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Branch"
              options={[
                { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Electronics & Communication', label: 'Electronics & Communication' },
                { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
                { value: 'Electrical & Electronics', label: 'Electrical & Electronics' },
              ]}
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />
            <Input
              label="Year & Cohort"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Student Profile & Evaluation History Modal */}
      {selectedStudentForProfile && (
        <Modal
          isOpen={!!selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          title={`Candidate Dossier: ${selectedStudentForProfile.name}`}
          subtitle={`Registration ID: ${selectedStudentForProfile.registrationId} • ${selectedStudentForProfile.branch}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedStudentForProfile(null)}>
              Close Dossier
            </Button>
          }
        >
          {(() => {
            const studentId = selectedStudentForProfile.id;
            const group = groups.find((g) => g.studentIds.includes(studentId));
            const panel = panels.find((p) => p.id === group?.panelId);
            const gdEval = gdEvals.find((e) => e.studentId === studentId);
            const qual = quals.find((q) => q.studentId === studentId);
            const studentHrEvals = hrEvals.filter((e) => e.studentId === studentId);
            const res = finalResults.find((r) => r.studentId === studentId);

            return (
              <div className="space-y-5">
                {/* Academic & Allocation Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned Group</span>
                    <p className="text-xs font-bold text-slate-800">{group?.groupName || 'Unassigned'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">GD Panel</span>
                    <p className="text-xs font-bold text-blue-600">{panel?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Round 1 Decision</span>
                    <p className="text-xs font-bold text-emerald-600 capitalize">{qual?.status || 'Pending'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Final Rank</span>
                    <p className="text-xs font-bold text-slate-900">{res ? `#${res.rank} (${res.selectionStatus})` : 'Pending'}</p>
                  </div>
                </div>

                {/* Round 1 (GD) Detailed Scorecard */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Round 1: Group Discussion Evaluation
                    </h4>
                    {gdEval ? (
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                        Total: {gdEval.totalScore} / 60 ({gdEval.percentage}%)
                      </span>
                    ) : (
                      <Badge variant="gray" size="sm">Not Yet Evaluated</Badge>
                    )}
                  </div>

                  {gdEval ? (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                        {Object.entries(gdEval.criterionScores).map(([critId, score]) => (
                          <div key={critId} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                            <span className="text-slate-600 capitalize font-medium">{critId.replace('_', ' ')}</span>
                            <span className="font-bold text-slate-900">{score}/10</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-800 uppercase block mb-1">Judge's Remarks:</span>
                        <p className="text-xs text-slate-700 italic">"{gdEval.remarks}"</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Evaluation pending live GD session.</p>
                  )}
                </div>

                {/* Round 2 (HR Interview) Detailed Scorecard */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Round 2: HR Interview Evaluations
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {studentHrEvals.length} Evaluation(s) Submitted
                    </span>
                  </div>

                  {studentHrEvals.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Interview evaluation not yet completed.</p>
                  ) : (
                    <div className="space-y-3">
                      {studentHrEvals.map((hr, idx) => (
                        <div key={hr.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-900">
                              HR Evaluator #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Score: {hr.totalScore} / 50 ({hr.percentage}%) • {hr.recommendation}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mb-1">
                            <strong className="text-slate-700">Strengths:</strong> {hr.strengths}
                          </p>
                          <p className="text-xs text-slate-600">
                            <strong className="text-slate-700">Remarks:</strong> {hr.remarks}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
