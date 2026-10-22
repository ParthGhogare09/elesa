import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  Search,
  Eye,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle,
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

export default function InterviewResults() {
  const [students, setStudents] = useState([]);
  const [quals, setQuals] = useState([]);
  const [gdEvals, setGdEvals] = useState([]);
  const [hrEvals, setHrEvals] = useState([]);
  const [hrUsers, setHrUsers] = useState([]);
  const [finalResults, setFinalResults] = useState([]);

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Add HR Evaluation Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    studentId: '',
    hrId: 'user-hr-1',
    criterionScores: { comm: 0, confidence: 0, problem_solving: 0, technical: 0, attitude: 0 },
    recommendation: 'Recommended',
    remarks: '',
  });
  const [addError, setAddError] = useState('');

  const loadData = () => {
    setStudents(demoService.getStudents());
    setQuals(demoService.getQualifications().filter((q) => q.status === 'qualified'));
    setGdEvals(demoService.getGDEvaluations());
    setHrEvals(demoService.getInterviewEvaluations());
    setHrUsers(demoService.getUsers().filter((u) => u.role === 'hr'));
    setFinalResults(demoService.getFinalResults());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCandidateEvals = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    const candidateEvals = hrEvals.filter((e) => e.studentId === studentId);
    if (candidateEvals.length === 0) {
      alert('No interview evaluations found for this candidate.');
      return;
    }
    if (window.confirm(`Delete ${candidateEvals.length} HR evaluation score(s) for "${student?.name || studentId}"?`)) {
      candidateEvals.forEach((e) => demoService.deleteInterviewEvaluation(e.id));
      demoService.recalculateFinalScores({});
      loadData();
      if (selectedCandidate === studentId) setSelectedCandidate(null);
    }
  };

  const handleDeleteSingleEval = (evalId, hrName) => {
    if (window.confirm(`Are you sure you want to delete ${hrName}'s evaluation for this candidate?`)) {
      demoService.deleteInterviewEvaluation(evalId);
      demoService.recalculateFinalScores({});
      loadData();
    }
  };

  const handleOpenAddModal = () => {
    setAddForm({
      studentId: quals[0]?.studentId || '',
      hrId: 'user-hr-1',
      criterionScores: { comm: 0, confidence: 0, problem_solving: 0, technical: 0, attitude: 0 },
      recommendation: 'Recommended',
      remarks: '',
    });
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleSaveHREval = () => {
    try {
      if (!addForm.studentId) throw new Error('Please select a candidate.');
      if (!addForm.hrId) throw new Error('Please select an HR interviewer.');
      if (!addForm.remarks?.trim()) throw new Error('Remarks are required.');

      demoService.saveInterviewEvaluation({
        studentId: addForm.studentId,
        hrId: addForm.hrId,
        criterionScores: addForm.criterionScores,
        recommendation: addForm.recommendation,
        remarks: addForm.remarks.trim(),
        status: 'submitted',
      });
      demoService.recalculateFinalScores({});
      loadData();
      setIsAddModalOpen(false);
    } catch (err) {
      setAddError(err.message || 'Error recording HR evaluation');
    }
  };

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
      header: 'GD Score (40% Weight)',
      key: 'gdScore',
      render: (row) => {
        const gd = gdEvals.find((e) => e.studentId === row.studentId);
        if (!gd) return <span className="text-xs text-slate-400">—</span>;
        return (
          <div>
            <span className="font-bold text-slate-800 text-xs">{gd.totalScore} / 60</span>
            <span className="text-[11px] text-slate-500 block">({gd.percentage}%)</span>
          </div>
        );
      },
    },
    {
      header: 'HR Evaluation Scores',
      key: 'hrScores',
      render: (row) => {
        const studentEvals = hrEvals.filter((e) => e.studentId === row.studentId);
        if (studentEvals.length === 0) return <span className="text-xs text-slate-400 italic">Pending Interview</span>;
        return (
          <div className="flex flex-wrap gap-2">
            {studentEvals.map((e) => {
              const hr = hrUsers.find((u) => u.id === e.hrId);
              return (
                <div key={e.id} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                  <span className="font-bold text-slate-800 block text-[11px]">{hr?.name || e.hrId}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-extrabold text-slate-900">{e.totalScore} / 50</span>
                    <span className="text-[10px] text-blue-600">({e.recommendation})</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      header: 'Combined HR Score',
      key: 'combinedHr',
      render: (row) => {
        const res = finalResults.find((r) => r.studentId === row.studentId);
        if (!res) return <span className="text-xs text-slate-400">Awaiting dual marks</span>;
        return (
          <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {res.hrPercentage}% ({res.hrScore}/50)
          </span>
        );
      },
    },
    {
      header: 'Composite Final Score',
      key: 'finalScore',
      sortable: true,
      render: (row) => {
        const res = finalResults.find((r) => r.studentId === row.studentId);
        if (!res) return <span className="text-xs text-slate-400">—</span>;
        return (
          <div>
            <span className="font-extrabold text-blue-700 text-sm">{res.finalScore} / 100</span>
            <span className="text-[10px] text-slate-400 block font-medium">Rank #{res.rank}</span>
          </div>
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
            onClick={() => setSelectedCandidate(row.studentId)}
            icon={Eye}
          >
            Compare
          </Button>
          <button
            type="button"
            title="Delete HR Evaluations"
            onClick={() => handleDeleteCandidateEvals(row.studentId)}
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
        title="Round 2 Interview Results &amp; Dual HR Comparison"
        subtitle="Side-by-side comparative inspection of HR 1 and HR 2 scoring rubrics, qualitative observations, and composite scores."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Interview Results' }]}
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={handleOpenAddModal}>
            Add HR Evaluation
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>
            Scoring Equation: <strong className="text-slate-900">Composite Final = (GD% × 40%) + (Mean HR% × 60%)</strong>
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">Normalized out of 100 maximum merit points</span>
      </div>

      <DataTable
        columns={columns}
        data={quals}
        searchPlaceholder="Search candidates..."
        searchKeys={['studentId']}
        pageSize={12}
      />

      {/* Side-by-Side Dual HR Comparison Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title="Comparative Interview Rubric Breakdown"
          subtitle="Independent scoring analysis from both HR Interviewers"
          size="xl"
          footer={
            <Button variant="secondary" onClick={() => setSelectedCandidate(null)}>
              Close Comparison
            </Button>
          }
        >
          {(() => {
            const student = students.find((s) => s.id === selectedCandidate);
            const gd = gdEvals.find((e) => e.studentId === selectedCandidate);
            const studentHrEvals = hrEvals.filter((e) => e.studentId === selectedCandidate);
            const res = finalResults.find((r) => r.studentId === selectedCandidate);

            return (
              <div className="space-y-5">
                {/* Header Summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Candidate Name</span>
                    <span className="font-bold text-slate-900">{student?.name}</span>
                    <p className="text-[11px] text-slate-500 font-mono">{student?.registrationId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Round 1 (GD Score)</span>
                    <span className="font-bold text-blue-700">
                      {gd ? `${gd.totalScore}/60 (${gd.percentage}%)` : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Combined HR Score</span>
                    <span className="font-bold text-emerald-700">
                      {res ? `${res.hrPercentage}% (${res.hrScore}/50)` : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Final Composite Rank</span>
                    <span className="font-bold text-slate-900">
                      {res ? `#${res.rank} (${res.finalScore}/100)` : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Candidate HR Evaluations Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentHrEvals.length === 0 ? (
                    <div className="md:col-span-2 p-8 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-slate-200">
                      No HR interview evaluations recorded yet for this candidate.
                    </div>
                  ) : (
                    studentHrEvals.map((he) => {
                      const hrObj = hrUsers.find((u) => u.id === he.hrId);
                      return (
                        <div key={he.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-bold text-slate-900 text-sm">
                                {hrObj?.name || he.hrId}
                              </span>
                              <p className="text-xs text-slate-500">
                                {hrObj?.title || 'HR Interviewer'}
                              </p>
                            </div>
                            <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">
                              {he.totalScore} / 50 ({he.percentage}%)
                            </span>
                          </div>

                          <div className="mt-3 space-y-3 text-xs">
                            <div className="space-y-1.5">
                              {Object.entries(he.criterionScores || {}).map(([k, score]) => (
                                <div key={k} className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                                  <span className="text-slate-600 capitalize">{k.replace('_', ' ')}</span>
                                  <span className="font-bold text-slate-900">{score} / 10</span>
                                </div>
                              ))}
                            </div>
                            {he.strengths && (
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="font-bold text-slate-700 block mb-0.5">Strengths:</span>
                                <p className="text-slate-600 italic">"{he.strengths}"</p>
                              </div>
                            )}
                            {he.remarks && (
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="font-bold text-slate-700 block mb-0.5">Interviewer Remarks:</span>
                                <p className="text-slate-600 italic">"{he.remarks}"</p>
                              </div>
                            )}
                            <div className="pt-1 flex items-center justify-between">
                              <div>
                                <span className="text-slate-500">Verdict: </span>
                                <strong className="text-slate-800">{he.recommendation}</strong>
                              </div>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={Trash2}
                                onClick={() => handleDeleteSingleEval(he.id, hrObj?.name || 'HR')}
                              >
                                Delete Score
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Modal: Add HR Evaluation */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add HR Interview Evaluation"
          subtitle="Record candidate performance across 5 criteria (50 marks maximum)."
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveHREval}>
                Save Evaluation
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
              label="Select Qualified Candidate"
              value={addForm.studentId}
              onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
              options={quals.map((q) => {
                const s = students.find((st) => st.id === q.studentId);
                return {
                  value: q.studentId,
                  label: `${s?.name || q.studentId} (${s?.registrationId || ''}) - GD Score: ${q.gdScore}/60`,
                };
              })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="HR Interviewer"
                value={addForm.hrId}
                onChange={(e) => setAddForm({ ...addForm, hrId: e.target.value })}
                options={hrUsers.map((u) => ({
                  value: u.id,
                  label: `${u.name} (HR ${u.interviewerNumber || (hrUsers.indexOf(u) + 1)})`,
                }))}
                required
              />

              <Select
                label="Hiring Recommendation"
                value={addForm.recommendation}
                onChange={(e) => setAddForm({ ...addForm, recommendation: e.target.value })}
                options={[
                  { value: 'Strongly Recommended', label: 'Strongly Recommended' },
                  { value: 'Recommended', label: 'Recommended' },
                  { value: 'On Hold', label: 'On Hold' },
                  { value: 'Not Recommended', label: 'Not Recommended' },
                ]}
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5 uppercase text-[10px] tracking-wider">
                HR Interview Criteria (0–10 Marks Each, Max 50)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'comm', label: 'Communication' },
                  { key: 'confidence', label: 'Confidence & Grooming' },
                  { key: 'problem_solving', label: 'Problem-Solving' },
                  { key: 'technical', label: 'Technical Awareness' },
                  { key: 'attitude', label: 'Attitude & Motivation' },
                ].map((crit) => (
                  <div key={crit.key} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-600 block mb-1">{crit.label}</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={addForm.criterionScores[crit.key] ?? 0}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.min(10, Math.max(0, Number(e.target.value) || 0));
                        setAddForm({
                          ...addForm,
                          criterionScores: {
                            ...addForm.criterionScores,
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
              label="Qualitative Feedback / Remarks"
              value={addForm.remarks}
              onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
              placeholder="e.g. Demonstrated solid fundamentals and confident communication."
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
