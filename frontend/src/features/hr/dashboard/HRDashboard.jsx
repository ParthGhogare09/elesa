import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  FileText,
  Award,
  Search,
  Filter,
  Users,
  Layers,
  ChevronRight,
  Star,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import demoService from '../../../services/demoService';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import PageHeader from '../../../components/layout/PageHeader';

export default function HRDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const hrId = currentUser?.id || 'user-hr-1';

  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'strongly_recommended'

  const loadCandidates = () => {
    // EVERY HR interviewer sees ALL candidates who have been recommended by judges in Round 1 GD
    const list = demoService.getRecommendedCandidatesForHR();
    setRecommendedCandidates(list);
  };

  useEffect(() => {
    loadCandidates();
  }, [hrId]);

  // Derived metrics
  const totalRecommended = recommendedCandidates.length;

  const myEvaluationsCount = recommendedCandidates.filter((item) =>
    item.hrEvals.some((e) => e.hrId === hrId)
  ).length;

  const myPendingCount = Math.max(0, totalRecommended - myEvaluationsCount);

  const stronglyRecommendedCount = recommendedCandidates.filter((item) =>
    item.hrEvals.some((e) => e.recommendation === 'Strongly Recommended')
  ).length;

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return recommendedCandidates.filter((item) => {
      const student = item.student;
      const myEval = item.hrEvals.find((e) => e.hrId === hrId);

      // Status filter
      if (statusFilter === 'pending' && myEval) return false;
      if (statusFilter === 'completed' && !myEval) return false;
      if (statusFilter === 'strongly_recommended' && myEval?.recommendation !== 'Strongly Recommended') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student?.name?.toLowerCase().includes(q);
        const matchesReg = student?.registrationId?.toLowerCase().includes(q);
        const matchesBranch = student?.branch?.toLowerCase().includes(q);
        const matchesGroup = item.groupName?.toLowerCase().includes(q);
        if (!matchesName && !matchesReg && !matchesBranch && !matchesGroup) return false;
      }

      return true;
    });
  }, [recommendedCandidates, statusFilter, searchQuery, hrId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`HR Interview Portal: ${currentUser?.name || 'HR Interviewer'}`}
        subtitle="All candidates recommended from Round 1 GD are consolidated here. Evaluate individual competencies across 5 core criteria (50 Marks Total)."
        badge={<Badge variant="success">HR Interview Portal</Badge>}
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              GD Recommended Pool
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalRecommended}</p>
            <span className="text-[10px] text-slate-500 font-medium">All Round 2 Candidates</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Pending Your Interview
            </span>
            <p className="text-2xl font-black text-amber-900 mt-0.5">{myPendingCount}</p>
            <span className="text-[10px] text-amber-700 font-medium">Awaiting Your Scoring</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Completed By You
            </span>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">{myEvaluationsCount}</p>
            <span className="text-[10px] text-emerald-700 font-medium">
              {totalRecommended > 0 ? Math.round((myEvaluationsCount / totalRecommended) * 100) : 0}% Progress
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
              Top Recommendations
            </span>
            <p className="text-2xl font-black text-purple-900 mt-0.5">{stronglyRecommendedCount}</p>
            <span className="text-[10px] text-purple-700 font-medium">Priority Hires Marked</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, reg ID, branch, or GD group..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Recommended ({totalRecommended})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending My Interview ({myPendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed By Me ({myEvaluationsCount})
            </button>
            <button
              onClick={() => setStatusFilter('strongly_recommended')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusFilter === 'strongly_recommended'
                  ? 'bg-white text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top Hires ({stronglyRecommendedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Candidate List Display */}
      {filteredCandidates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Candidates Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {totalRecommended === 0
              ? 'GD Judges have not yet submitted recommendations for Round 2. Once GD judges finalize candidate recommendations, all candidates will appear here automatically.'
              : 'No candidates matched your current search and filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((item, idx) => {
            const student = item.student;
            const myEval = item.hrEvals.find((e) => e.hrId === hrId);
            const otherHrEvals = item.hrEvals.filter((e) => e.hrId !== hrId);
            const isCompletedByMe = !!myEval;

            return (
              <div
                key={student.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-white ${
                  isCompletedByMe
                    ? 'border-emerald-200/90 shadow-xs'
                    : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Avatar & Details */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{student.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{student.registrationId}</p>
                      </div>
                    </div>

                    <Badge
                      variant={isCompletedByMe ? 'success' : 'warning'}
                      size="sm"
                    >
                      {isCompletedByMe ? '✓ Evaluated' : 'Pending Interview'}
                    </Badge>
                  </div>

                  {/* Branch & Group Pill */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{student.branch}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{item.groupName}</span>
                    {student.cgpa && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-700 font-bold">CGPA: {student.cgpa}</span>
                      </>
                    )}
                  </div>

                  {/* Round 1 (GD) Performance & Recommending Judges */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Round 1 (GD Score):
                      </span>
                      <span className="font-black text-blue-700">
                        {item.avgGdScore} <span className="text-slate-400 text-[10px]">/ 60</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Recommended by: {item.recommendingJudgeNames.join(', ')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Current HR Evaluation Result (if completed) */}
                  {myEval && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-900">Your Score:</span>
                        <span className="font-black text-emerald-800 text-sm">
                          {myEval.totalScore} / 50 ({Math.round(myEval.percentage)}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                        <span className="text-[10px] text-emerald-700 font-medium">Recommendation:</span>
                        <span className="text-[11px] font-bold text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-200">
                          {myEval.recommendation}
                        </span>
                      </div>
                      {myEval.remarks && (
                        <p className="text-[11px] text-emerald-800 italic line-clamp-1 mt-1">
                          "{myEval.remarks}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Co-HR evaluations transparency */}
                  {otherHrEvals.length > 0 && (
                    <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                      <span className="font-medium text-slate-400 block text-[10px] uppercase">
                        Also Evaluated By Other HR(s):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {otherHrEvals.map((oe) => (
                          <span
                            key={oe.id}
                            className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-mono text-[10px] font-semibold"
                          >
                            HR Score: {oe.totalScore}/50 ({oe.recommendation})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Button
                    variant={isCompletedByMe ? 'secondary' : 'primary'}
                    className="w-full justify-center text-xs font-bold"
                    onClick={() => navigate(`/hr/interview/${student.id}`)}
                  >
                    {isCompletedByMe ? 'Review / Edit Evaluation' : 'Conduct HR Interview \u2192'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
