import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Users,
  Settings2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import demoService from '../../../services/demoService';
import DataTable from '../../../components/tables/DataTable';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Select from '../../../components/common/Select';
import PageHeader from '../../../components/layout/PageHeader';

export default function InterviewManagement() {
  const [quals, setQuals] = useState([]);
  const [students, setStudents] = useState([]);
  const [hrUsers, setHrUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [hrEvals, setHrEvals] = useState([]);
  const [event, setEvent] = useState(null);

  const [workflow, setWorkflow] = useState('workflow_b'); // workflow_a (single HR) or workflow_b (dual HR)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [assignedHrIds, setAssignedHrIds] = useState(['user-hr-1', 'user-hr-2']);

  const loadData = () => {
    const allQuals = demoService.getQualifications();
    setQuals(allQuals.filter((q) => q.status === 'qualified')); // Only qualified candidates!
    setStudents(demoService.getStudents());
    const users = demoService.getUsers();
    setHrUsers(users.filter((u) => u.role === 'hr'));
    setAssignments(demoService.getInterviewAssignments());
    setHrEvals(demoService.getInterviewEvaluations());
    const ev = demoService.getEvent();
    setEvent(ev);
    setWorkflow(ev?.hrScoringConfig?.workflow || 'workflow_b');
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWorkflowChange = (newWorkflow) => {
    setWorkflow(newWorkflow);
    demoService.updateEvent({
      hrScoringConfig: {
        ...event.hrScoringConfig,
        workflow: newWorkflow,
      },
    });
    alert(`Interview workflow updated to: ${newWorkflow === 'workflow_b' ? 'Workflow B (Both HR Interviewers Evaluate Each Candidate)' : 'Workflow A (Single HR Interviewer Distributed)'}`);
  };

  const handleAutoAssignAll = () => {
    try {
      const count = demoService.autoAssignAllRecommendedToAllHRs();
      loadData();
      alert(`Successfully auto-assigned ${quals.length} recommended candidate(s) to all HR Interviewers!`);
    } catch (err) {
      alert(err.message || 'Error auto-assigning candidates');
    }
  };

  const handleAssignCandidate = (e) => {
    e.preventDefault();
    if (!selectedCandidateId || assignedHrIds.length === 0) return;

    try {
      demoService.assignCandidateToHR({
        studentId: selectedCandidateId,
        hrIds: assignedHrIds,
      });
      loadData();
      setIsAssignModalOpen(false);
      setSelectedCandidateId('');
    } catch (err) {
      alert(err.message || 'Error assigning candidate');
    }
  };

  const columns = [
    {
      header: 'Qualified Candidate',
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
      header: 'Round 1 GD Score',
      key: 'gdScore',
      render: (row) => (
        <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {row.gdScore} / 60 ({row.gdPercentage}%)
        </span>
      ),
    },
    {
      header: 'Assigned HR Interviewer(s) & Status',
      key: 'hrStatus',
      render: (row) => {
        const studentAssignments = assignments.filter((a) => a.studentId === row.studentId);
        if (studentAssignments.length === 0) return <span className="text-xs text-slate-400 italic">Unassigned</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {studentAssignments.map((asgn) => {
              const hr = hrUsers.find((u) => u.id === asgn.hrId);
              const evalItem = hrEvals.find((e) => e.studentId === row.studentId && e.hrId === asgn.hrId);
              return (
                <div key={asgn.id || asgn.hrId} className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                  <span className="font-semibold text-slate-800 block text-[11px]">{hr?.name || asgn.hrId}</span>
                  {evalItem ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                      Done: {evalItem.totalScore}/50
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-medium">Pending</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      header: 'Overall HR Status',
      key: 'overall',
      render: (row) => {
        const studentEvals = hrEvals.filter((e) => e.studentId === row.studentId);
        if (workflow === 'workflow_b') {
          if (studentEvals.length >= 2) {
            return <Badge variant="success" size="sm">Both Evaluated</Badge>;
          }
          if (studentEvals.length === 1) {
            return <Badge variant="warning" size="sm">1 of 2 Complete</Badge>;
          }
          return <Badge variant="gray" size="sm">Pending</Badge>;
        } else {
          return studentEvals.length > 0 ? (
            <Badge variant="success" size="sm">Completed</Badge>
          ) : (
            <Badge variant="gray" size="sm">Pending</Badge>
          );
        }
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Round 2 — HR Interview Management"
        subtitle="Coordinate candidate assignments across the registered HR Interviewers under configured evaluation workflows."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'HR Interviews' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Sparkles} onClick={handleAutoAssignAll}>
              Auto-Assign All Recommended
            </Button>
            <Button variant="primary" icon={UserCheck} onClick={() => setIsAssignModalOpen(true)}>
              Assign Candidate to HR
            </Button>
          </div>
        }
      />

      {/* Workflow Selector Card */}
      <Card
        title="Evaluation Workflow Configuration"
        subtitle="Control whether candidates are assessed by a single interviewer or independently by both interviewers."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => handleWorkflowChange('workflow_b')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              workflow === 'workflow_b'
                ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Workflow B: Dual Independent Evaluation (Active)
              </span>
              {workflow === 'workflow_b' && <Badge variant="blue" size="sm">Configured</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Each candidate is interviewed by <strong>both HR Interviewer 1 and 2</strong>.
              Combined HR percentage is calculated as the arithmetic mean of both evaluations.
            </p>
          </div>

          <div
            onClick={() => handleWorkflowChange('workflow_a')}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              workflow === 'workflow_a'
                ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Workflow A: Single Interviewer Split
              </span>
              {workflow === 'workflow_a' && <Badge variant="blue" size="sm">Configured</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Candidates are split between HR 1 and HR 2 (e.g. odd/even or 1-16 / 17-32).
              Each candidate receives exactly one comprehensive evaluation.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase">Qualified Candidates</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{quals.length} Students</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase">HR Interviewers</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">2 Interviewers</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <span className="text-xs font-medium text-blue-700 uppercase">Evaluations Logged</span>
          <p className="text-2xl font-bold text-blue-800 mt-1">{hrEvals.length} Evaluations</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-xs font-medium text-emerald-700 uppercase">Completion Rate</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {quals.length > 0 ? Math.round((hrEvals.length / (quals.length * (workflow === 'workflow_b' ? 2 : 1))) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Qualified Candidates Roster */}
      <DataTable
        columns={columns}
        data={quals}
        searchPlaceholder="Search qualified candidates..."
        searchKeys={['studentId', 'gdScore']}
        pageSize={12}
      />

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Candidate for HR Interview"
        subtitle="Only candidates with approved Round 1 Qualification status can be scheduled."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignCandidate}>
              Confirm Assignment
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignCandidate} className="space-y-4">
          <Select
            label="Qualified Candidate"
            options={quals.map((q) => {
              const st = students.find((s) => s.id === q.studentId);
              return {
                value: q.studentId,
                label: `${st?.name || q.studentId} (${st?.registrationId || ''}) — GD: ${q.gdScore}/60`,
              };
            })}
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            placeholder="Select a qualified candidate"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Assign to Interviewer(s)
            </label>
            <div className="space-y-2">
              {hrUsers.map((hr) => (
                <label
                  key={hr.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={assignedHrIds.includes(hr.id)}
                    onChange={(e) => {
                      if (e.target.checked) setAssignedHrIds([...assignedHrIds, hr.id]);
                      else setAssignedHrIds(assignedHrIds.filter((id) => id !== hr.id));
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800">{hr.name}</span>
                    <span className="text-slate-400 block text-[11px]">{hr.title}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
