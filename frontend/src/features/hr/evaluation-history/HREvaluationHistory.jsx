import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import demoService from '../../../services/demoService';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import PageHeader from '../../../components/layout/PageHeader';

export default function HREvaluationHistory() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const hrId = currentUser?.id || 'user-hr-1';

  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);

  const loadData = () => {
    const allEvals = demoService.getInterviewEvaluations();
    setEvaluations(allEvals.filter((e) => e.hrId === hrId));
    setStudents(demoService.getStudents());
  };

  useEffect(() => {
    loadData();
  }, [hrId]);

  const handleDeleteEval = (id) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      demoService.deleteInterviewEvaluation(id);
      demoService.recalculateFinalScores({});
      loadData();
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
      header: 'Score Breakdown',
      key: 'criterionScores',
      render: (row) => (
        <div className="flex gap-1 text-[11px] font-mono">
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">C:{row.criterionScores?.comm}</span>
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">Cf:{row.criterionScores?.confidence}</span>
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">PS:{row.criterionScores?.problem_solving}</span>
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">T:{row.criterionScores?.technical}</span>
          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">A:{row.criterionScores?.attitude}</span>
        </div>
      ),
    },
    {
      header: 'Total Score',
      key: 'totalScore',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-emerald-700 text-sm">{row.totalScore} / 50</span>
          <span className="text-[11px] text-slate-500 block">({row.percentage}%)</span>
        </div>
      ),
    },
    {
      header: 'Recommendation',
      key: 'recommendation',
      render: (row) => (
        <Badge
          variant={
            row.recommendation === 'Strongly Recommended'
              ? 'success'
              : row.recommendation === 'Recommended'
              ? 'blue'
              : row.recommendation === 'On Hold'
              ? 'warning'
              : 'danger'
          }
          size="sm"
        >
          {row.recommendation}
        </Badge>
      ),
    },
    {
      header: 'Remarks',
      key: 'remarks',
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-xs truncate italic">
          "{row.remarks}"
        </p>
      ),
    },
    {
      header: 'Action',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/hr/interview/${row.studentId}`)}
            icon={Eye}
          >
            View / Edit
          </Button>
          <button
            type="button"
            title="Delete Evaluation"
            onClick={() => handleDeleteEval(row.id)}
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
        title="Completed Interview Evaluations History"
        subtitle="Log of all interview scoring rubrics and hiring recommendations submitted by your account."
        breadcrumbs={[
          { label: 'HR Dashboard', to: '/hr/dashboard' },
          { label: 'Evaluation History' },
        ]}
      />

      <DataTable
        columns={columns}
        data={evaluations}
        searchPlaceholder="Search evaluation history..."
        searchKeys={['studentId', 'recommendation', 'remarks']}
        pageSize={10}
      />
    </div>
  );
}
