export const DEFAULT_GD_CRITERIA = [
  { id: 'comm', name: 'Communication Skills', maxMarks: 10, description: 'Articulation, vocabulary, active listening, voice modulation' },
  { id: 'clarity', name: 'Clarity of Thought', maxMarks: 10, description: 'Structure of arguments, conciseness, coherence' },
  { id: 'confidence', name: 'Confidence', maxMarks: 10, description: 'Body language, composure under challenge, presence' },
  { id: 'reasoning', name: 'Logical Reasoning', maxMarks: 10, description: 'Data-driven points, fact checking, analytical depth' },
  { id: 'teamwork', name: 'Teamwork & Listening', maxMarks: 10, description: 'Yielding floor, acknowledging others, constructive build-up' },
  { id: 'initiative', name: 'Initiative & Leadership', maxMarks: 10, description: 'Opening/steering discussion, moderating, synthesizing conclusions' },
];

export const DEFAULT_HR_CRITERIA = [
  { id: 'comm', name: 'Communication Skills', maxMarks: 10, description: 'Professional fluency, tone, concise answering' },
  { id: 'confidence', name: 'Confidence and Professionalism', maxMarks: 10, description: 'Grooming, body language, emotional intelligence' },
  { id: 'problem_solving', name: 'Problem-Solving Ability', maxMarks: 10, description: 'Structured approach to situational & behavioral queries' },
  { id: 'technical', name: 'Technical Awareness', maxMarks: 10, description: 'Domain fundamentals, project ownership, industry trends' },
  { id: 'attitude', name: 'Attitude and Career Motivation', maxMarks: 10, description: 'Company alignment, culture fit, long-term learning zeal' },
];

export const DEFAULT_GROUP_GD_CRITERIA = [
  { id: 'topic_depth', name: 'Topic Depth & Domain Context', maxMarks: 10, description: 'Comprehensiveness of discussion, nuanced perspectives, subject relevance' },
  { id: 'discussion_flow', name: 'Discussion Flow & Constructive Debate', maxMarks: 10, description: 'Smooth transitions, healthy rebuttals, absence of aggressive shouting' },
  { id: 'team_synergy', name: 'Team Synergy & Inclusiveness', maxMarks: 10, description: 'Collective participation, encouraging reserved speakers, shared airspace' },
  { id: 'decorum_time', name: 'Decorum & Time Discipline', maxMarks: 10, description: 'Professional etiquette, punctuality, structured time management' },
];

export const MOCK_USERS = [
  {
    id: 'user-admin-1',
    name: 'Dr. Rajesh Iyer',
    email: 'admin@placepro.demo',
    role: 'admin',
    title: 'Dean of Training & Placement',
    avatar: 'RI',
    isActive: true,
  },
  {
    id: 'user-judge-1',
    name: 'Prof. Alex Sharma',
    email: 'judge@placepro.demo',
    role: 'judge',
    title: 'Senior GD Evaluator & Corporate Trainer',
    avatar: 'AS',
    isActive: true,
    assignedPanels: ['panel-1'],
  },
  {
    id: 'user-judge-2',
    name: 'Prof. Priya Nair',
    email: 'judge2@placepro.demo',
    role: 'judge',
    title: 'Head of Business Communications',
    avatar: 'PN',
    isActive: true,
    assignedPanels: ['panel-1'],
  },
  {
    id: 'user-judge-3',
    name: 'Dr. Rajesh Menon',
    email: 'judge3@placepro.demo',
    role: 'judge',
    title: 'Industry Specialist & Senior Evaluator',
    avatar: 'RM',
    isActive: true,
    assignedPanels: ['panel-1'],
  },
  {
    id: 'user-judge-4',
    name: 'Prof. Ananya Roy',
    email: 'judge4@placepro.demo',
    role: 'judge',
    title: 'Leadership & Behavioral Science Coach',
    avatar: 'AR',
    isActive: true,
    assignedPanels: ['panel-1'],
  },
  {
    id: 'user-hr-1',
    name: 'Vikram Patel',
    email: 'hr@placepro.demo',
    role: 'hr',
    title: 'Head of Talent Acquisition (Tech Division)',
    avatar: 'VP',
    isActive: true,
    interviewerNumber: 1,
  },
  {
    id: 'user-hr-2',
    name: 'Sneha Gupta',
    email: 'hr2@placepro.demo',
    role: 'hr',
    title: 'Senior HR Business Partner & Lead Recruiter',
    avatar: 'SG',
    isActive: true,
    interviewerNumber: 2,
  },
];

export const MOCK_EVENT = {
  id: 'evt-2026-01',
  name: 'Mock Placement Drive 2026',
  academicYear: '2025-2026',
  date: '2026-10-24',
  status: 'active', // active, round1_completed, completed, published
  gdScoringConfig: {
    criteria: DEFAULT_GD_CRITERIA,
    totalMarks: 60,
    maxRecommendationsPerGroup: 3,
  },
  hrScoringConfig: {
    criteria: DEFAULT_HR_CRITERIA,
    totalMarks: 50,
    workflow: 'workflow_b', // workflow_a (single HR) or workflow_b (dual HR)
  },
  finalScoringConfig: {
    gdWeightPercentage: 40,
    hrWeightPercentage: 60,
    tieBreakingRules: ['finalScore', 'hrPercentage', 'gdPercentage'],
  },
  qualificationPublished: false,
  resultsPublished: false,
};

export const MOCK_PANELS = [
  {
    id: 'panel-1',
    eventId: 'evt-2026-01',
    name: 'Main GD Evaluation Panel',
    code: 'GD-PANEL',
    location: 'Central Placement Auditorium',
    assignedJudgeIds: ['user-judge-1', 'user-judge-2', 'user-judge-3', 'user-judge-4'],
    status: 'active',
  },
];

// Clean initial arrays with 0 dummy records (ready for live input)
export const MOCK_STUDENTS = [];
export const MOCK_GROUPS = [];
export const MOCK_GD_EVALUATIONS = [];
export const MOCK_GD_GROUP_EVALUATIONS = [];
export const MOCK_GD_RECOMMENDATIONS = [];
export const MOCK_QUALIFICATIONS = [];
export const MOCK_INTERVIEW_ASSIGNMENTS = [];
export const MOCK_INTERVIEW_EVALUATIONS = [];
export const MOCK_FINAL_RESULTS = [];
export const MOCK_AUDIT_LOGS = [];
