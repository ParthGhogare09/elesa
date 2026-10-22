import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import demoService from '../../../services/demoService';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import PageHeader from '../../../components/layout/PageHeader';

export default function JudgeDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const judgeId = currentUser?.id || 'user-judge-1';

  const [allGroups, setAllGroups] = useState([]);
  const [panel, setPanel] = useState(null);
  const [students, setStudents] = useState([]);
  const [judges, setJudges] = useState([]);
  const [myGroupEvals, setMyGroupEvals] = useState([]);
  const [allGroupEvals, setAllGroupEvals] = useState([]);
  const [myStudentEvals, setMyStudentEvals] = useState([]);
  const [recs, setRecs] = useState([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'evaluated' | 'pending'
  const [quickSelectedGroupId, setQuickSelectedGroupId] = useState('');

  useEffect(() => {
    const groups = demoService.getGroups();
    setAllGroups(groups);

    // Get the single main panel
    const panels = demoService.getPanels();
    setPanel(panels[0] || { name: 'Main GD Evaluation Panel', code: 'GD-PANEL', location: 'Central Auditorium' });

    setStudents(demoService.getStudents());
    setJudges(demoService.getUsers().filter((u) => u.role === 'judge'));

    // Group evaluations
    const grpEvals = demoService.getGDGroupEvaluations();
    setAllGroupEvals(grpEvals);
    setMyGroupEvals(grpEvals.filter((e) => e.judgeId === judgeId));

    // Student individual evaluations
    const stdEvals = demoService.getGDEvaluations();
    setMyStudentEvals(stdEvals.filter((e) => e.judgeId === judgeId));

    // Recommendations
    setRecs(demoService.getGDRecommendations().filter((r) => r.judgeId === judgeId));

    if (groups.length > 0 && !quickSelectedGroupId) {
      setQuickSelectedGroupId(groups[0].id);
    }
  }, [currentUser, judgeId]);

  // Check if current judge has evaluated all students in a group
  const isEvaluatedByMe = (group) => {
    if (!group?.studentIds || group.studentIds.length === 0) return false;
    const scoredCount = myStudentEvals.filter((e) => e.groupId === group.id).length;
    return scoredCount >= group.studentIds.length;
  };

  // Group that has all candidates evaluated but pending recommendations (Compulsory Rule)
  const groupPendingRecommendations = allGroups.find((g) => {
    const isEval = isEvaluatedByMe(g);
    const recRecord = recs.find((r) => r.groupId === g.id);
    const hasRecs = recRecord && Array.isArray(recRecord.studentIds) && recRecord.studentIds.length > 0;
    return isEval && !hasRecs;
  });

  const handleSelectGroup = (targetGroupId) => {
    if (groupPendingRecommendations && groupPendingRecommendations.id !== targetGroupId) {
      alert(
        `Recommendation Compulsory:\n\nYou have finished scoring all candidates in "${groupPendingRecommendations.groupName}", but recommendations for Round 2 have not been submitted yet.\n\nYou must finalize recommendations for "${groupPendingRecommendations.groupName}" before starting evaluation of another group.`
      );
      navigate(`/judge/groups/${groupPendingRecommendations.id}`);
      return;
    }
    navigate(`/judge/groups/${targetGroupId}`);
  };

  // Co-judges who evaluated any students in this group
  const getOtherJudgesWhoEvaluated = (groupId) => {
    const stdEvals = demoService.getGDEvaluations();
    const otherJudgeIds = [...new Set(
      stdEvals
        .filter((e) => e.groupId === groupId && e.judgeId !== judgeId)
        .map((e) => e.judgeId)
    )];
    return otherJudgeIds.map((id) => {
      const j = judges.find((u) => u.id === id);
      return j?.name || id;
    });
  };

  // Filtered groups based on search & status
  const filteredGroups = useMemo(() => {
    return allGroups.filter((grp) => {
      // Status filter
      const evaluated = isEvaluatedByMe(grp);
      if (statusFilter === 'evaluated' && !evaluated) return false;
      if (statusFilter === 'pending' && evaluated) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = grp.groupName.toLowerCase().includes(query);
        const matchesCode = grp.groupCode.toLowerCase().includes(query);
        const matchesStudents = grp.studentIds.some((sId) => {
          const s = students.find((std) => std.id === sId);
          return s?.name.toLowerCase().includes(query) || s?.registrationId.toLowerCase().includes(query);
        });
        if (!matchesName && !matchesCode && !matchesStudents) return false;
      }

      return true;
    });
  }, [allGroups, statusFilter, searchQuery, myStudentEvals, students]);

  const totalGroups = allGroups.length;
  const myCompletedCount = allGroups.filter((g) => isEvaluatedByMe(g)).length;
  const myPendingCount = totalGroups - myCompletedCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${currentUser?.name || 'Judge'}`}
        subtitle="Main GD Evaluation Panel • All groups are consolidated here. Select any group below to evaluate individual students (60 Marks Total)."
        badge={<Badge variant="purple">GD Judge Portal</Badge>}
      />

      {/* Compulsory Recommendation Warning Banner */}
      {groupPendingRecommendations && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <span>Recommendation Compulsory: Finalize {groupPendingRecommendations.groupName}</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black uppercase">Required</span>
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                You have finished scoring all candidates in <strong>{groupPendingRecommendations.groupName}</strong>. You must submit 1 to 3 candidate recommendations before starting evaluation of a new group.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm"
            onClick={() => navigate(`/judge/groups/${groupPendingRecommendations.id}`)}
          >
            Finalize {groupPendingRecommendations.groupName} Recommendations &rarr;
          </Button>
        </div>
      )}

      {/* Prominent Quick Group Selector Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">
              Single Evaluation Panel
            </span>
            <span className="text-xs text-blue-100 font-semibold">{panel?.name}</span>
          </div>
          <h3 className="text-lg font-bold">Select Any Group to Start Scoring:</h3>
          <p className="text-xs text-blue-100">
            All {totalGroups} groups are open to you. Select any group directly from the dropdown or the cards below.
          </p>
        </div>

        {/* 1-Click Dropdown & Launch */}
        <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
          <select
            value={quickSelectedGroupId}
            onChange={(e) => setQuickSelectedGroupId(e.target.value)}
            disabled={allGroups.length === 0}
            className="bg-white text-slate-900 text-xs font-bold py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
          >
            {allGroups.length === 0 ? (
              <option value="">No Groups Available</option>
            ) : (
              allGroups.map((g) => {
                const evaled = isEvaluatedByMe(g);
                return (
                  <option key={g.id} value={g.id}>
                    {g.groupName} {evaled ? '✓ (Evaluated)' : '— Pending'}
                  </option>
                );
              })
            )}
          </select>

          <Button
            variant="secondary"
            disabled={!quickSelectedGroupId || allGroups.length === 0}
            onClick={() => quickSelectedGroupId && handleSelectGroup(quickSelectedGroupId)}
            className="!bg-white !text-blue-700 hover:!bg-blue-50 font-bold shrink-0 text-xs disabled:opacity-50"
          >
            Evaluate Selected Group &rarr;
          </Button>
        </div>
      </div>

      {/* Progress & Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase">Total Groups Available</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalGroups} Groups</p>
          <span className="text-[11px] text-slate-500">In Single Main Panel</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-xs font-medium text-emerald-700 uppercase">Evaluated by You</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{myCompletedCount} Groups</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Cohort scores submitted</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-xs font-medium text-amber-700 uppercase">Pending Your Score</span>
          <p className="text-2xl font-bold text-amber-800 mt-1">{myPendingCount} Groups</p>
          <span className="text-[11px] text-amber-600 font-semibold">Open for evaluation</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <span className="text-xs font-medium text-purple-700 uppercase">Your Shortlists</span>
          <p className="text-2xl font-bold text-purple-800 mt-1">{recs.length} Cohorts</p>
          <span className="text-[11px] text-purple-600 font-semibold">Max 3 per group</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search group (e.g. Group 3) or student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Groups ({totalGroups})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending by You ({myPendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('evaluated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'evaluated'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Evaluated by You ({myCompletedCount})
          </button>
        </div>
      </div>

      {/* Grid of All Groups in the Single Panel */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Groups Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No discussion groups have been formed yet. Once the placement administrator creates groups, they will appear here ready for evaluation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((grp) => {
          const evaledByMe = isEvaluatedByMe(grp);
          const myScoredCount = myStudentEvals.filter((e) => e.groupId === grp.id).length;
          const myRec = recs.find((r) => r.groupId === grp.id);
          const otherJudges = getOtherJudgesWhoEvaluated(grp.id);

          // Get names of students in this group
          const groupStudents = students.filter((s) => grp.studentIds.includes(s.id));

          return (
            <div
              key={grp.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-white ${
                evaledByMe
                  ? 'border-emerald-200/90 shadow-xs'
                  : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{grp.groupName}</h4>
                      <span className="text-[11px] font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                        {grp.groupCode}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      evaledByMe && (!myRec || !myRec.studentIds || myRec.studentIds.length === 0)
                        ? 'amber'
                        : evaledByMe
                        ? 'success'
                        : myScoredCount > 0
                        ? 'blue'
                        : 'amber'
                    }
                    size="sm"
                  >
                    {evaledByMe && (!myRec || !myRec.studentIds || myRec.studentIds.length === 0)
                      ? '⚠️ Recommendations Required'
                      : evaledByMe
                      ? '✓ All Evaluated'
                      : myScoredCount > 0
                      ? `${myScoredCount}/${groupStudents.length} Scored`
                      : 'Pending Score'}
                  </Badge>
                </div>

                {/* Candidate Scoring Progress */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Evaluation Progress:</span>
                  <span className={`font-bold ${evaledByMe ? 'text-emerald-700' : 'text-blue-700'}`}>
                    {myScoredCount} / {groupStudents.length} Candidates (60M)
                  </span>
                </div>

                {/* Student Roster in this Group */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Participants ({groupStudents.length} Students):
                  </span>
                  <div className="space-y-0.5">
                    {groupStudents.map((s, idx) => (
                      <div key={s.id} className="text-xs text-slate-700 flex items-center justify-between">
                        <span className="truncate max-w-[180px]">
                          {idx + 1}. {s.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.registrationId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Co-judges transparency */}
                {otherJudges.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-medium">Also scored by:</span>{' '}
                    <span className="font-semibold text-purple-700">{otherJudges.join(', ')}</span>
                  </div>
                )}

                {myRec && (
                  <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ★ {myRec.studentIds.length} of 3 Candidates Recommended for Round 2
                  </div>
                )}
              </div>

              {/* Action Button: Select & Evaluate */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Button
                  variant={
                    evaledByMe && (!myRec || !myRec.studentIds || myRec.studentIds.length === 0)
                      ? 'primary'
                      : evaledByMe
                      ? 'secondary'
                      : 'primary'
                  }
                  className={`w-full justify-center ${
                    evaledByMe && (!myRec || !myRec.studentIds || myRec.studentIds.length === 0)
                      ? '!bg-amber-600 hover:!bg-amber-700 !text-white'
                      : ''
                  }`}
                  onClick={() => handleSelectGroup(grp.id)}
                >
                  {evaledByMe && (!myRec || !myRec.studentIds || myRec.studentIds.length === 0)
                    ? 'Finalize Recommendations (Compulsory) \u2192'
                    : evaledByMe
                    ? 'Review / Edit Scores'
                    : 'Select & Evaluate Group \u2192'}
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
