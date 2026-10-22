import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Grid3X3,
  Layers,
  ClipboardCheck,
  CheckCircle2,
  Award,
  UserCheck,
  Trophy,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Activity,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import demoService from '../../../services/demoService';
import StatCard from '../../../components/common/StatCard';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import PageHeader from '../../../components/layout/PageHeader';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [panels, setPanels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [gdEvals, setGdEvals] = useState([]);
  const [quals, setQuals] = useState([]);
  const [hrEvals, setHrEvals] = useState([]);
  const [finalResults, setFinalResults] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    setStudents(demoService.getStudents());
    setPanels(demoService.getPanels());
    setGroups(demoService.getGroups());
    setGdEvals(demoService.getGDEvaluations());
    setQuals(demoService.getQualifications());
    setHrEvals(demoService.getInterviewEvaluations());
    setFinalResults(demoService.getFinalResults());
    setAuditLogs(demoService.getAuditLogs());
  }, []);

  // Summary Metrics calculations
  const totalStudents = students.length;
  const totalPanels = panels.length;
  const totalGroups = groups.length;
  const completedGroups = groups.filter((g) => g.evaluationStatus === 'completed').length;

  const recs = demoService.getGDRecommendations();
  const recommendedCount = recs.reduce((acc, curr) => acc + curr.studentIds.length, 0);

  const qualifiedForHR = quals.filter((q) => q.status === 'qualified').length;
  const interviewsCompleted = hrEvals.filter((e) => e.status === 'submitted').length / 2; // Assuming dual HR
  const finalSelected = finalResults.filter((r) => r.selectionStatus === 'selected').length;

  // Chart Data: Students per Panel
  const panelChartData = panels.map((p) => {
    const pGroups = groups.filter((g) => g.panelId === p.id);
    const pStudentsCount = pGroups.reduce((acc, g) => acc + g.studentIds.length, 0);
    const pEvaluatedGroups = pGroups.filter((g) => g.evaluationStatus === 'completed').length;
    return {
      name: p.code,
      fullName: p.name,
      students: pStudentsCount,
      evaluated: pEvaluatedGroups * 5,
    };
  });

  // Chart Data: Qualification Distribution
  const qualPieData = [
    { name: 'Qualified for HR', value: qualifiedForHR, color: '#16A34A' },
    {
      name: 'Not Qualified',
      value: quals.filter((q) => q.status === 'not_qualified').length,
      color: '#DC2626',
    },
    {
      name: 'Pending / Review',
      value: Math.max(0, totalStudents - quals.length),
      color: '#60A5FA',
    },
  ];

  // Chart Data: Final Selection Breakdown
  const selectionPieData = [
    { name: 'Selected', value: finalSelected, color: '#2563EB' },
    {
      name: 'Waitlisted',
      value: finalResults.filter((r) => r.selectionStatus === 'waitlisted').length,
      color: '#D97706',
    },
    {
      name: 'Not Selected',
      value: finalResults.filter((r) => r.selectionStatus === 'not_selected').length,
      color: '#94A3B8',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Placement Evaluation Command Center"
        subtitle="End-to-end administration for Round 1 (GD) and Round 2 (HR Interview) evaluations."
        badge={<Badge variant="blue">Drive Active</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={() => navigate('/admin/reports')}
            >
              Export Reports
            </Button>
            <Button
              variant="primary"
              icon={Trophy}
              onClick={() => navigate('/admin/leaderboard')}
            >
              View Leaderboard
            </Button>
          </div>
        }
      />

      {/* Summary Cards Grid (8 Cards as requested) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtext="Participants registered"
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="GD Panels"
          value={totalPanels}
          subtext="Panel A, B, C, D active"
          icon={Grid3X3}
          color="slate"
          onClick={() => navigate('/admin/panels')}
        />
        <StatCard
          title="Total Groups"
          value={totalGroups}
          subtext={`${completedGroups} of ${totalGroups} evaluated`}
          icon={Layers}
          color="purple"
          onClick={() => navigate('/admin/groups')}
        />
        <StatCard
          title="GD Evaluated"
          value={`${Math.round((completedGroups / totalGroups) * 100)}%`}
          subtext={`${completedGroups} groups finished`}
          icon={ClipboardCheck}
          color="blue"
          onClick={() => navigate('/admin/gd-evaluations')}
        />
        <StatCard
          title="Recommended (R1)"
          value={recommendedCount}
          subtext="Max 3 per group by judges"
          icon={Award}
          color="amber"
          onClick={() => navigate('/admin/qualification')}
        />
        <StatCard
          title="Qualified for HR"
          value={qualifiedForHR}
          subtext="Admin approved for R2"
          icon={CheckCircle2}
          color="green"
          onClick={() => navigate('/admin/qualification')}
        />
        <StatCard
          title="Interviews Done"
          value={Math.round(interviewsCompleted)}
          subtext="HR evaluations logged"
          icon={UserCheck}
          color="purple"
          onClick={() => navigate('/admin/interviews')}
        />
        <StatCard
          title="Final Selected"
          value={finalSelected}
          subtext="Ready for final offer"
          icon={Trophy}
          color="blue"
          onClick={() => navigate('/admin/leaderboard')}
        />
      </div>

      {/* Quick Actions Panel */}
      <Card
        title="Admin Quick Actions"
        subtitle="Direct navigation to key stages of the mock placement workflow"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { label: 'Add Students', to: '/admin/students', icon: Users },
            { label: 'Create Group', to: '/admin/groups', icon: Layers },
            { label: 'Manage Panels', to: '/admin/panels', icon: Grid3X3 },
            { label: 'Assign Judges', to: '/admin/judges', icon: Award },
            { label: 'GD Evaluations', to: '/admin/gd-evaluations', icon: ClipboardCheck },
            { label: 'Qualification', to: '/admin/qualification', icon: CheckCircle2 },
            { label: 'HR Interviews', to: '/admin/interviews', icon: UserCheck },
            { label: 'Leaderboard', to: '/admin/leaderboard', icon: Trophy },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 transition group text-center"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 mt-2 group-hover:text-blue-700">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students per Panel Bar Chart */}
        <Card
          title="Students &amp; Evaluation per Panel"
          subtitle="Distribution of candidates and completion across Panels A - D"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={panelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" name="Total Students" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="evaluated" name="Evaluated" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Round 1 Qualification Pie Chart */}
        <Card
          title="Round 1 Qualification"
          subtitle="Shortlisting ratio from GD to HR"
        >
          <div className="h-64 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {qualPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity & Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Live Placement Audit Feed"
          subtitle="Real-time verification log of scoring and qualification changes"
          className="lg:col-span-2"
        >
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No placement activity logged yet. System is initialized and ready for candidates.
              </div>
            ) : (
              auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{log.details}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      By <span className="text-slate-600 font-medium">{log.actorName}</span> •{' '}
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Drive Stage Progress */}
        <Card title="Stage Progression" subtitle="Current status of placement rounds">
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800">Round 1: Group Discussion</span>
                <Badge variant={completedGroups === totalGroups && totalGroups > 0 ? 'success' : 'blue'} size="sm">
                  {totalGroups === 0 ? '0 Groups' : `${completedGroups}/${totalGroups} Scored`}
                </Badge>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                {totalPanels} panel{totalPanels === 1 ? '' : 's'} operating. {completedGroups} of {totalGroups} group{totalGroups === 1 ? '' : 's'} fully scored.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-800">Round 2: HR Interviews</span>
                <Badge variant={qualifiedForHR > 0 ? 'blue' : 'gray'} size="sm">
                  {qualifiedForHR > 0 ? `${qualifiedForHR} Qualified` : 'Awaiting GD'}
                </Badge>
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                {qualifiedForHR} candidate{qualifiedForHR === 1 ? '' : 's'} shortlisted for interview assessment.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Final Results &amp; Offer Rollout</span>
                <Badge variant={finalSelected > 0 ? 'success' : 'gray'} size="sm">
                  {finalSelected > 0 ? `${finalSelected} Offers` : 'Pending Publication'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {finalSelected > 0 ? `${finalSelected} candidates selected for placement.` : 'Awaiting final composite rankings (40% GD + 60% HR).'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
