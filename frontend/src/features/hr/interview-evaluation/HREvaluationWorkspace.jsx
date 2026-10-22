import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Award,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  GraduationCap,
  MessageSquare,
  Compass,
  Star,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import demoService from '../../../services/demoService';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import PageHeader from '../../../components/layout/PageHeader';

export default function HREvaluationWorkspace() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const hrId = currentUser?.id || 'user-hr-1';

  const [student, setStudent] = useState(null);
  const [qual, setQual] = useState(null);
  const [gdEvals, setGdEvals] = useState([]);
  const [group, setGroup] = useState(null);
  const [recommendingJudges, setRecommendingJudges] = useState([]);
  const [showQuestionGuide, setShowQuestionGuide] = useState(false);

  const [scores, setScores] = useState({
    comm: 0,
    confidence: 0,
    problem_solving: 0,
    technical: 0,
    attitude: 0,
  });

  const [strengths, setStrengths] = useState('');
  const [improvementAreas, setImprovementAreas] = useState('');
  const [remarks, setRemarks] = useState('');
  const [recommendation, setRecommendation] = useState('Recommended');
  const [preferredRole, setPreferredRole] = useState('Software Engineering');
  const [error, setError] = useState('');

  useEffect(() => {
    const st = demoService.getStudentById(candidateId);
    if (!st) {
      alert('Candidate not found');
      navigate('/hr/dashboard');
      return;
    }
    setStudent(st);

    // Check qualification or judge recommendation
    const allQuals = demoService.getQualifications();
    let q = allQuals.find((item) => item.studentId === candidateId);
    const allRecs = demoService.getGDRecommendations();
    const isRecommended = allRecs.some((r) => r.studentIds && r.studentIds.includes(candidateId));

    if (!q && !isRecommended) {
      alert('Ineligible: Only candidates recommended by GD judges can be evaluated in HR Round.');
      navigate('/hr/dashboard');
      return;
    }
    setQual(q || { status: 'qualified' });

    // Load GD evaluations and recommending judges
    const allGdEvals = demoService.getGDEvaluations().filter((e) => e.studentId === candidateId);
    setGdEvals(allGdEvals);

    const users = demoService.getUsers();
    const judgeIds = new Set();
    allRecs.forEach((r) => {
      if (r.studentIds && r.studentIds.includes(candidateId)) {
        judgeIds.add(r.judgeId);
      }
    });
    if (q?.recommendedByJudges) {
      q.recommendedByJudges.forEach((id) => judgeIds.add(id));
    }
    allGdEvals.forEach((e) => {
      if (e.recommendation) judgeIds.add(e.judgeId);
    });

    const judgeNames = Array.from(judgeIds).map((id) => {
      const u = users.find((user) => user.id === id);
      return u ? u.name : 'GD Judge';
    });
    setRecommendingJudges(judgeNames);

    // Group info
    const grp = demoService.getGroups().find((g) => g.studentIds && g.studentIds.includes(candidateId));
    setGroup(grp);

    // Check for existing HR evaluation by this interviewer
    const existing = demoService.getInterviewEvaluations().find(
      (e) => e.studentId === candidateId && e.hrId === hrId
    );
    if (existing) {
      setScores({
        comm: existing.criterionScores?.comm ?? 0,
        confidence: existing.criterionScores?.confidence ?? 0,
        problem_solving: existing.criterionScores?.problem_solving ?? 0,
        technical: existing.criterionScores?.technical ?? 0,
        attitude: existing.criterionScores?.attitude ?? 0,
      });
      setStrengths(existing.strengths || '');
      setImprovementAreas(existing.improvementAreas || '');
      setRemarks(existing.remarks || '');
      setRecommendation(existing.recommendation || 'Recommended');
      if (existing.preferredRole) setPreferredRole(existing.preferredRole);
    }
  }, [candidateId, hrId, navigate]);

  const calculateTotal = () => {
    return (
      (Number(scores.comm) || 0) +
      (Number(scores.confidence) || 0) +
      (Number(scores.problem_solving) || 0) +
      (Number(scores.technical) || 0) +
      (Number(scores.attitude) || 0)
    );
  };

  const totalScore = calculateTotal();
  const percentage = Math.round((totalScore / 50) * 100);

  const getTierInfo = (score) => {
    if (score >= 45) return { label: '🌟 Elite Performer (Top 5%)', variant: 'purple' };
    if (score >= 38) return { label: '💎 Outstanding Fit', variant: 'success' };
    if (score >= 30) return { label: '✅ Competent & Recommended', variant: 'blue' };
    return { label: '⚠️ Needs Development', variant: 'warning' };
  };

  const handleScoreChange = (key, val) => {
    const num = Math.min(10, Math.max(0, Number(val)));
    setScores((prev) => ({ ...prev, [key]: num }));
  };

  const handleSave = (status = 'submitted') => {
    setError('');
    if (status === 'submitted' && !remarks.trim()) {
      setError('Interview remarks are mandatory before submitting evaluation.');
      return;
    }

    try {
      demoService.saveInterviewEvaluation({
        studentId: candidateId,
        hrId,
        criterionScores: {
          comm: Number(scores.comm),
          confidence: Number(scores.confidence),
          problem_solving: Number(scores.problem_solving),
          technical: Number(scores.technical),
          attitude: Number(scores.attitude),
        },
        strengths,
        improvementAreas,
        remarks,
        recommendation,
        preferredRole,
        status,
      });

      alert(
        `Interview evaluation successfully ${status === 'submitted' ? 'submitted' : 'saved as draft'}!`
      );
      navigate('/hr/dashboard');
    } catch (err) {
      setError(err.message || 'Error saving interview evaluation');
    }
  };

  const criteriaList = [
    {
      key: 'comm',
      label: '1. Communication & Professional Articulation',
      desc: 'Clarity of speech, structured answering, vocabulary, active listening, and poise.',
      tips: 'Assess clarity, conciseness, structured STAR method, and non-verbal posture.',
    },
    {
      key: 'confidence',
      label: '2. Confidence & Executive Presence',
      desc: 'Professional composure under pressure, grooming, enthusiasm, and authentic confidence.',
      tips: 'Notice eye contact, composure when challenged, and positive body language.',
    },
    {
      key: 'problem_solving',
      label: '3. Problem-Solving & Situational Judgment',
      desc: 'Logical structuring of unfamiliar scenarios, analytical reasoning, and ethical judgment.',
      tips: 'Give a real workplace dilemma or conflict scenario to test their approach.',
    },
    {
      key: 'technical',
      label: '4. Domain Knowledge & Technical Foundations',
      desc: 'Ownership of academic projects, foundational concepts, problem articulation, and industry awareness.',
      tips: 'Probe deep into their role and implementation challenges on capstone projects.',
    },
    {
      key: 'attitude',
      label: '5. Attitude, Cultural Fit & Career Motivation',
      desc: 'Adaptability, team spirit, coachability, company values alignment, and long-term learning zeal.',
      tips: 'Observe how they accept constructive feedback and their genuine curiosity about the role.',
    },
  ];

  const suggestedQuestions = [
    {
      category: 'Behavioral & Leadership',
      q: 'Tell me about a time you handled a major team conflict during a group project. What was the outcome?',
    },
    {
      category: 'Situational & Judgment',
      q: 'If your project deadline was cut in half unexpectedly, how would you prioritize features and communicate with stakeholders?',
    },
    {
      category: 'Technical Ownership',
      q: 'Walk me through the architecture of your primary project. What was the toughest bug you solved and how?',
    },
    {
      category: 'Adaptability & Learning',
      q: 'Tell me about a technology you had to learn from scratch under tight deadlines. How did you master it?',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title={`Interview Scoring: ${student?.name || 'Candidate'}`}
        subtitle={`Registration ID: ${student?.registrationId || ''} • ${student?.branch || ''} • Round 2 HR Assessment`}
        breadcrumbs={[
          { label: 'HR Dashboard', to: '/hr/dashboard' },
          { label: 'Candidate Interview' },
        ]}
        actions={
          <Button variant="secondary" icon={ChevronLeft} onClick={() => navigate('/hr/dashboard')}>
            Back to Candidates
          </Button>
        }
      />

      {/* Candidate Dossier & GD Performance Highlights */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Candidate Profile Info */}
          <div className="flex items-center gap-3.5 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {student?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{student?.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{student?.registrationId}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                <span>{student?.branch}</span>
                {student?.cgpa && <span className="font-bold text-slate-700">• CGPA: {student?.cgpa}</span>}
              </div>
            </div>
          </div>

          {/* Round 1 (GD) Performance Pill */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Round 1 (GD Score)
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                {group?.groupName || 'GD Group'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-700">
                {gdEvals.length > 0 ? gdEvals[0].totalScore : '45'}{' '}
                <span className="text-sm font-semibold text-slate-400">/ 60</span>
              </span>
              <span className="text-xs font-bold text-blue-600">
                ({gdEvals.length > 0 ? gdEvals[0].percentage : '75'}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold text-[11px] truncate">
                Recommended by: {recommendingJudges.length > 0 ? recommendingJudges.join(', ') : 'GD Panel'}
              </span>
            </div>
          </div>

          {/* Active HR Interviewer */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Interviewer
            </span>
            <p className="font-bold text-slate-800 text-sm">{currentUser?.name || 'HR Specialist'}</p>
            <p className="text-xs text-slate-500">{currentUser?.title || 'Talent Acquisition Team'}</p>
            <Badge variant="success" size="sm">
              Round 2 In Progress
            </Badge>
          </div>
        </div>

        {/* GD Judge's Observations Quote (if available) */}
        {gdEvals.length > 0 && gdEvals[0].remarks && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              GD Judge Qualitative Observation:
            </span>
            <p className="text-slate-700 italic">"{gdEvals[0].remarks}"</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Guided Questions Accordion Helper */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-2">
        <button
          type="button"
          onClick={() => setShowQuestionGuide(!showQuestionGuide)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Structured Interview Question Bank & Guidance</span>
            <span className="text-[10px] font-normal text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Standardized Prompts
            </span>
          </div>
          {showQuestionGuide ? (
            <ChevronUp className="w-4 h-4 text-blue-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-700" />
          )}
        </button>

        {showQuestionGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-blue-200/60 text-xs">
            {suggestedQuestions.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/90 border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  {item.category}
                </span>
                <p className="text-slate-800 text-[11px] leading-relaxed">{item.q}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5-Criteria Rubrics (Total 50 Marks) */}
      <Card
        title="Comprehensive Interview Rubrics (50 Marks Total)"
        subtitle="Evaluate candidate competence across 5 core criteria on a scale of 0 to 10."
      >
        <div className="space-y-4">
          {criteriaList.map((crit) => {
            const currentScore = scores[crit.key] ?? 0;

            return (
              <div
                key={crit.key}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{crit.label}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</p>
                  </div>

                  {/* Direct Score Input */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={currentScore}
                      onChange={(e) => handleScoreChange(crit.key, e.target.value)}
                      className="w-16 px-3 py-1.5 text-center font-black text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                    <span className="text-xs font-bold text-slate-400">/ 10</span>
                  </div>
                </div>

                {/* Score Preset Buttons for Fast, Fair Rating */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">
                    Rating Presets:
                  </span>
                  {[
                    { val: 0, label: '0 (None)' },
                    { val: 4, label: '4 (Fair)' },
                    { val: 6, label: '6 (Competent)' },
                    { val: 8, label: '8 (Strong)' },
                    { val: 10, label: '10 (Exceptional)' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => handleScoreChange(crit.key, preset.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        currentScore === preset.val
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Aggregated Total Score & Merit Tier */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wide block">
                Total Aggregated Interview Score
              </span>
              <span className="text-xs text-emerald-800 font-medium">
                Authoritatively summed across all 5 evaluation criteria
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-emerald-800">
                {totalScore} <span className="text-sm font-bold text-emerald-600">/ 50</span>
              </span>
              <div className="text-right">
                <Badge variant={getTierInfo(totalScore).variant} size="sm">
                  {getTierInfo(totalScore).label}
                </Badge>
                <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                  {percentage}% Performance
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Qualitative Feedback, Career Track & Hiring Recommendation */}
      <Card
        title="Qualitative Assessment & Hiring Recommendation"
        subtitle="Mandatory detailed qualitative feedback for merit ranking and placement selection."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Standout Strengths & Technical Highlights
              </label>
              <textarea
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="e.g. Articulated system design trade-offs cleanly; demonstrated strong ownership of capstone full-stack project..."
                className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Development Areas & Growth Potential
              </label>
              <textarea
                rows={3}
                value={improvementAreas}
                onChange={(e) => setImprovementAreas(e.target.value)}
                placeholder="e.g. Could deepen understanding of automated CI/CD pipelines and production observability..."
                className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              Comprehensive Interview Remarks (Mandatory)
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter comprehensive observations regarding professional composure, leadership instincts, culture fit, communication clarity, and offer readiness..."
              className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Preferred Role / Domain Alignment */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                Suggested Domain Alignment
              </label>
              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Software Engineering">Software Engineering (Full-Stack / Backend / Frontend)</option>
                <option value="Data & Artificial Intelligence">Data & Artificial Intelligence / ML</option>
                <option value="Cloud, DevOps & Systems">Cloud, DevOps & Site Reliability</option>
                <option value="Product & Business Consulting">Product, Consulting & Solutions</option>
                <option value="Core Engineering & Electronics">Core Engineering & Embedded</option>
              </select>
            </div>

            {/* Hiring Recommendation Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                Final Hiring Recommendation
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: 'Strongly Recommended',
                    badge: '🌟 Top Hire',
                    color: 'border-purple-500 text-purple-800 bg-purple-50',
                  },
                  {
                    label: 'Recommended',
                    badge: '✅ Standard Hire',
                    color: 'border-blue-500 text-blue-800 bg-blue-50',
                  },
                  {
                    label: 'On Hold',
                    badge: '⏸️ Waitlist',
                    color: 'border-amber-500 text-amber-800 bg-amber-50',
                  },
                  {
                    label: 'Not Recommended',
                    badge: '❌ Below Bar',
                    color: 'border-red-500 text-red-800 bg-red-50',
                  },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setRecommendation(opt.label)}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      recommendation === opt.label
                        ? `${opt.color} shadow-xs ring-2 ring-offset-1`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-normal">{opt.badge}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Footer */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/hr/dashboard')}>
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Save} onClick={() => handleSave('draft')}>
            Save Draft
          </Button>
          <Button variant="primary" icon={Send} onClick={() => handleSave('submitted')}>
            Submit Interview Evaluation
          </Button>
        </div>
      </div>
    </div>
  );
}
