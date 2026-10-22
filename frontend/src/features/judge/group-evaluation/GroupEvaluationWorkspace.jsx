import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  Sparkles,
  UserCheck,
  Users,
  BarChart3,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import demoService from '../../../services/demoService';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import PageHeader from '../../../components/layout/PageHeader';

export default function GroupEvaluationWorkspace() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const judgeId = currentUser?.id || 'user-judge-1';

  const [group, setGroup] = useState(null);
  const [panel, setPanel] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [allStudentEvalsForGroup, setAllStudentEvalsForGroup] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Individual Student Modal State - Initial marks set to 0 for all criteria
  const [activeStudentIndex, setActiveStudentIndex] = useState(null);
  const [evalForm, setEvalForm] = useState({
    comm: 0,
    clarity: 0,
    confidence: 0,
    reasoning: 0,
    teamwork: 0,
    initiative: 0,
    remarks: '',
    isRecommended: false,
  });
  const [evalError, setEvalError] = useState('');

  // Shortlist Modal State
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [shortlistError, setShortlistError] = useState('');

  const loadGroupData = () => {
    const grp = demoService.getGroupById(groupId);
    if (!grp) {
      alert('Group not found');
      navigate('/judge/dashboard');
      return;
    }
    setGroup(grp);

    const users = demoService.getUsers();
    setAllUsers(users);

    const pnl = demoService.getPanels().find((p) => p.id === grp.panelId);
    setPanel(pnl);

    const allStudents = demoService.getStudents();
    const groupStudents = allStudents.filter((s) => grp.studentIds.includes(s.id));
    setStudents(groupStudents);

    // Load all individual evaluations for this group
    const allEvals = demoService.getGDEvaluations();
    const groupStudentEvals = allEvals.filter((e) => e.groupId === groupId);
    setAllStudentEvalsForGroup(groupStudentEvals);

    // Current judge's map of student evaluations
    const evalMap = {};
    groupStudentEvals
      .filter((e) => e.judgeId === judgeId)
      .forEach((e) => {
        evalMap[e.studentId] = e;
      });
    setEvaluations(evalMap);

    // Load recommendations
    const allRecs = demoService.getGDRecommendations();
    const recRecord = allRecs.find((r) => r.groupId === groupId && r.judgeId === judgeId);
    setRecommendations(recRecord ? recRecord.studentIds : []);
  };

  useEffect(() => {
    loadGroupData();
  }, [groupId, judgeId]);

  const activeStudent = activeStudentIndex !== null ? students[activeStudentIndex] : null;

  // Judge name lookup
  const getJudgeName = (id) => {
    const user = allUsers.find((u) => u.id === id);
    return user ? user.name : id;
  };

  // Co-judges assigned to this group
  const assignedJudgeIds = group?.judgeIds || [];
  const coJudgeIds = assignedJudgeIds.filter((id) => id !== judgeId);

  const handleOpenEvaluate = (index) => {
    setActiveStudentIndex(index);
    const student = students[index];
    const existing = evaluations[student.id];
    const isCurrentlyRec = recommendations.includes(student.id);

    if (existing) {
      setEvalForm({
        comm: existing.criterionScores?.comm ?? 0,
        clarity: existing.criterionScores?.clarity ?? 0,
        confidence: existing.criterionScores?.confidence ?? 0,
        reasoning: existing.criterionScores?.reasoning ?? 0,
        teamwork: existing.criterionScores?.teamwork ?? 0,
        initiative: existing.criterionScores?.initiative ?? 0,
        remarks: existing.remarks || '',
        isRecommended: isCurrentlyRec,
      });
    } else {
      setEvalForm({
        comm: 0,
        clarity: 0,
        confidence: 0,
        reasoning: 0,
        teamwork: 0,
        initiative: 0,
        remarks: '',
        isRecommended: isCurrentlyRec,
      });
    }
    setEvalError('');
  };

  const calculateFormTotal = () => {
    return (
      (Number(evalForm.comm) || 0) +
      (Number(evalForm.clarity) || 0) +
      (Number(evalForm.confidence) || 0) +
      (Number(evalForm.reasoning) || 0) +
      (Number(evalForm.teamwork) || 0) +
      (Number(evalForm.initiative) || 0)
    );
  };

  const handleSaveEvaluation = (status = 'submitted') => {
    setEvalError('');
    if (status === 'submitted' && !evalForm.remarks.trim()) {
      setEvalError("Judge's remarks are mandatory before submitting evaluation.");
      return;
    }

    try {
      demoService.saveGDEvaluation({
        groupId,
        studentId: activeStudent.id,
        judgeId,
        criterionScores: {
          comm: Number(evalForm.comm),
          clarity: Number(evalForm.clarity),
          confidence: Number(evalForm.confidence),
          reasoning: Number(evalForm.reasoning),
          teamwork: Number(evalForm.teamwork),
          initiative: Number(evalForm.initiative),
        },
        remarks: evalForm.remarks,
        status,
      });

      // Update recommendations list immediately
      let updatedRecs = [...recommendations];
      if (evalForm.isRecommended && !updatedRecs.includes(activeStudent.id)) {
        if (updatedRecs.length >= 3) {
          throw new Error('Strict Rule Limit: Each judge can recommend a MAXIMUM of 3 students from any single group for Round 2.');
        }
        updatedRecs.push(activeStudent.id);
      } else if (!evalForm.isRecommended && updatedRecs.includes(activeStudent.id)) {
        updatedRecs = updatedRecs.filter((id) => id !== activeStudent.id);
      }
      setRecommendations(updatedRecs);
      demoService.saveGDRecommendations(groupId, judgeId, updatedRecs);

      loadGroupData();

      if (activeStudentIndex < students.length - 1) {
        handleOpenEvaluate(activeStudentIndex + 1);
      } else {
        setActiveStudentIndex(null);
      }
    } catch (err) {
      setEvalError(err.message || 'Error saving evaluation');
    }
  };

  // Immediate Toggle Recommendation (STRICT BUSINESS RULE: MAX 3 CANDIDATES)
  const handleToggleRecommendation = (studentId) => {
    setShortlistError('');
    let updatedRecs;
    if (recommendations.includes(studentId)) {
      updatedRecs = recommendations.filter((id) => id !== studentId);
    } else {
      if (recommendations.length >= 3) {
        alert('Strict Rule Limit: Each judge can recommend a MAXIMUM of 3 students from any single group for Round 2.');
        return;
      }
      updatedRecs = [...recommendations, studentId];
    }
    setRecommendations(updatedRecs);
    demoService.saveGDRecommendations(groupId, judgeId, updatedRecs);
    loadGroupData();
  };

  const handleSubmitShortlist = () => {
    setShortlistError('');
    try {
      demoService.saveGDRecommendations(groupId, judgeId, recommendations);
      loadGroupData();
      setIsShortlistModalOpen(false);
      alert(`Shortlist submitted! ${recommendations.length} candidate(s) recommended for Round 2 review.`);
    } catch (err) {
      setShortlistError(err.message || 'Error submitting shortlist');
    }
  };

  const evaluatedCount = Object.keys(evaluations).length;

  const handleExitWorkspace = () => {
    if (evaluatedCount === students.length && students.length > 0 && recommendations.length === 0) {
      setIsShortlistModalOpen(true);
      alert('Recommendation Compulsory: Please select 1 to 3 standout candidates to recommend for Round 2 HR Interview before finalizing this group.');
      return;
    }
    navigate('/judge/dashboard');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Live GD Scoring: ${group?.groupName || 'Group'}`}
        subtitle={`Panel ${panel?.code || ''} (${panel?.name || ''}) • Multi-Judge Candidate Evaluation Workspace`}
        breadcrumbs={[
          { label: 'Judge Dashboard', to: '/judge/dashboard' },
          { label: group?.groupName || 'Group' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={Award}
              onClick={() => setIsShortlistModalOpen(true)}
            >
              Recommend for Round 2 ({recommendations.length}/3)
            </Button>
            <Button variant="secondary" onClick={handleExitWorkspace}>
              Back to Dashboard
            </Button>
          </div>
        }
      />

      {/* Multi-Judge Panel Header Info Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{group?.groupName}</h2>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {group?.groupCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Venue: <strong>{panel?.location}</strong> • Panel: <strong>{panel?.name}</strong>
              </p>
            </div>
          </div>

          {/* Active Judge and Multi-Judge Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-xs">
              <span className="text-purple-600 block text-[10px] font-bold uppercase">Active Evaluator:</span>
              <span className="font-bold text-purple-900">{currentUser?.name || 'Judge'}</span>
            </div>

            {coJudgeIds.length > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned Co-Judges:</span>
                <span className="font-semibold text-slate-700">
                  {coJudgeIds.map((id) => getJudgeName(id)).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Status & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Candidate Evaluations (60 Marks Total)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                {evaluatedCount} / {students.length} Evaluated
              </span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{recommendations.length} / 3 Recommended</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={evaluatedCount === students.length && students.length > 0 ? 'success' : 'warning'}
              size="sm"
            >
              {evaluatedCount === students.length && students.length > 0
                ? 'All Candidates Evaluated'
                : 'Scoring In Progress'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Compulsory Recommendation Banner when all candidates scored */}
      {evaluatedCount === students.length && students.length > 0 && recommendations.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <span>Recommendation Compulsory Before Starting New Group</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black uppercase">Required</span>
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                All candidates in this group have been evaluated! You must recommend 1 to 3 standout candidates for Round 2 HR Interviews before completing this group.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm"
            onClick={() => setIsShortlistModalOpen(true)}
          >
            Select & Finalize Recommendations (0/3)
          </Button>
        </div>
      )}

      {/* Completed & Finalized Banner */}
      {evaluatedCount === students.length && students.length > 0 && recommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">
                Group Evaluation & Recommendations Finalized
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                {recommendations.length} candidate(s) recommended for Round 2 HR Interview. All records are synchronized.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            onClick={handleExitWorkspace}
          >
            Finalize & Back to Dashboard
          </Button>
        </div>
      )}

      {/* Individual Candidate Evaluation Cards (60 Marks Total) */}
      <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Evaluating individual student performance across 6 criteria (Communication, Clarity, Confidence, Reasoning, Teamwork, Initiative).
            </span>
            <span>Max 3 recommendations permitted per group.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student, idx) => {
              const evalItem = evaluations[student.id];
              const isEvaluated = !!evalItem;
              const isRecommended = recommendations.includes(student.id);

              // Look up evaluations by other judges for this student
              const otherJudgesEvalsForStudent = allStudentEvalsForGroup.filter(
                (e) => e.studentId === student.id && e.judgeId !== judgeId
              );

              return (
                <div
                  key={student.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-white ${
                    isEvaluated
                      ? 'border-emerald-200/90 shadow-xs'
                      : 'border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{student.name}</h4>
                          <p className="text-[11px] text-slate-400 font-mono">{student.registrationId}</p>
                        </div>
                      </div>
                      {isRecommended && (
                        <Badge variant="amber" size="sm">
                          ★ R2 Shortlist
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-medium">{student.branch}</p>

                    {/* Current Judge's Score Summary */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {isEvaluated ? (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-500 font-medium">Your Score:</span>
                            <span className="font-black text-blue-700 text-sm">
                              {evalItem.totalScore} / 60 ({evalItem.percentage}%)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 italic line-clamp-2 mt-1">
                            "{evalItem.remarks}"
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 py-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Your marks not yet entered</span>
                        </div>
                      )}
                    </div>

                    {/* Co-Judges' Score Cards for this Student */}
                    {otherJudgesEvalsForStudent.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {otherJudgesEvalsForStudent.map((oe) => (
                          <div
                            key={oe.id}
                            className="p-2 rounded-lg bg-purple-50/60 border border-purple-100 text-[11px] flex items-center justify-between"
                          >
                            <span className="text-purple-800 font-medium truncate max-w-[140px]">
                              {getJudgeName(oe.judgeId).split(' ')[0]}:
                            </span>
                            <span className="font-bold text-purple-900">
                              {oe.totalScore}/60 ({oe.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: 1-Click Recommend + Marks */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRecommendation(student.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isRecommended
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
                      }`}
                    >
                      <Award className={`w-3.5 h-3.5 ${isRecommended ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                      <span>{isRecommended ? '★ Recommended' : '☆ Recommend'}</span>
                    </button>

                    <Button
                      variant={isEvaluated ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenEvaluate(idx)}
                    >
                      {isEvaluated ? 'Edit Marks' : 'Evaluate Student'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* ========================================================
          DEDICATED INDIVIDUAL EVALUATION MODAL
         ======================================================== */}
      {activeStudent && (
        <Modal
          isOpen={activeStudentIndex !== null}
          onClose={() => setActiveStudentIndex(null)}
          title={`Evaluating: ${activeStudent.name}`}
          subtitle={`Student #${activeStudentIndex + 1} of ${students.length} • Registration ID: ${activeStudent.registrationId}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={activeStudentIndex === 0}
                  onClick={() => handleOpenEvaluate(activeStudentIndex - 1)}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={activeStudentIndex === students.length - 1}
                  onClick={() => handleOpenEvaluate(activeStudentIndex + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleSaveEvaluation('draft')}>
                  Save Draft
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleSaveEvaluation('submitted')}>
                  Submit Marks &rarr;
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {evalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{evalError}</span>
              </div>
            )}

            {/* 6 Criteria Scoring Grid (Total 60 Marks) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'comm', label: 'Communication Skills', desc: 'Articulation, voice modulation, listening' },
                { key: 'clarity', label: 'Clarity of Thought', desc: 'Structure of points, coherence, conciseness' },
                { key: 'confidence', label: 'Confidence & Poise', desc: 'Body language, composure under challenge' },
                { key: 'reasoning', label: 'Logical Reasoning', desc: 'Fact-based arguments, analytical depth' },
                { key: 'teamwork', label: 'Teamwork & Listening', desc: 'Yielding floor, acknowledging peers' },
                { key: 'initiative', label: 'Initiative & Leadership', desc: 'Steering discussion, synthesizing views' },
              ].map((crit) => (
                <div key={crit.key} className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">{crit.label}</label>
                    <span className="text-xs font-mono font-bold text-blue-600">/ 10</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{crit.desc}</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={evalForm[crit.key] ?? 0}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Math.min(10, Math.max(0, Number(e.target.value) || 0));
                      setEvalForm({ ...evalForm, [crit.key]: val });
                    }}
                    className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Live Auto-Calculated Total */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">Total Evaluated Score</span>
                <span className="text-[11px] text-blue-700">Calculated automatically across all 6 criteria</span>
              </div>
              <span className="text-2xl font-black text-blue-700">
                {calculateFormTotal()} <span className="text-sm font-bold text-blue-500">/ 60</span>
              </span>
            </div>

            {/* Immediate Round 2 Recommendation Toggle */}
            <div
              onClick={() => {
                const nextVal = !evalForm.isRecommended;
                if (nextVal) {
                  const otherRecs = recommendations.filter((id) => id !== activeStudent?.id);
                  if (otherRecs.length >= 3) {
                    alert('Strict Rule Limit: Each judge can recommend a MAXIMUM of 3 students from any single group for Round 2.');
                    return;
                  }
                }
                setEvalForm({ ...evalForm, isRecommended: nextVal });
              }}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                evalForm.isRecommended
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!evalForm.isRecommended}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Award className={`w-4 h-4 ${evalForm.isRecommended ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                    <span>Recommend this Candidate for Round 2 (HR Round)</span>
                    {evalForm.isRecommended && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        ★ Selected
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Standout candidates advance directly to the HR Interview round (Max 3 per group).
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                {evalForm.isRecommended || recommendations.includes(activeStudent?.id)
                  ? `${Math.min(3, recommendations.filter((id) => id !== activeStudent?.id).length + 1)} / 3 Used`
                  : `${recommendations.length} / 3 Used`}
              </span>
            </div>

            {/* Dedicated Judge's Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Judge's Qualitative Remarks (Mandatory)
              </label>
              <textarea
                rows={3}
                value={evalForm.remarks}
                onChange={(e) => setEvalForm({ ...evalForm, remarks: e.target.value })}
                placeholder="Enter observations about student's articulation, participation, analytical strengths, and improvement areas..."
                className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                required
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          SHORTLIST / RECOMMENDATION PANEL (MAX 3 CANDIDATES LIMIT)
         ======================================================== */}
      {isShortlistModalOpen && (
        <Modal
          isOpen={isShortlistModalOpen}
          onClose={() => setIsShortlistModalOpen(false)}
          title={`Round 2 Shortlist Recommendation: ${group?.groupName}`}
          subtitle="Critical Business Rule: A judge can recommend a MAXIMUM of 3 candidates per group for Round 2."
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Slots Used: <strong>{recommendations.length} of 3 maximum</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setIsShortlistModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmitShortlist}>
                  Submit Shortlist Recommendations
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Limit Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Award className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">Strict 3-Candidate Ceiling</span>
                  <span className="text-amber-700 text-[11px]">
                    Select up to 3 standout participants to recommend for Round 2 HR Interviews.
                  </span>
                </div>
              </div>
              <span className="font-black text-sm text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                {recommendations.length} / 3 Selected
              </span>
            </div>

            {shortlistError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{shortlistError}</span>
              </div>
            )}

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {students.map((student) => {
                const evalItem = evaluations[student.id];
                const isSelected = recommendations.includes(student.id);

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleRecommendation(student.id)}
                    className={`p-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 transition ${
                      isSelected ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {student.registrationId} • {student.branch}
                        </p>
                        {evalItem?.remarks && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5">
                            "{evalItem.remarks}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {evalItem ? (
                        <span className="font-bold text-slate-900 text-xs">
                          {evalItem.totalScore} / 60 ({evalItem.percentage}%)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Score Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
