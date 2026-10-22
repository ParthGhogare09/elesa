import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import User from './models/User.js';
import Student from './models/Student.js';
import Event from './models/Event.js';
import Panel from './models/Panel.js';
import Group from './models/Group.js';
import GDEvaluation from './models/GDEvaluation.js';
import GDGroupEvaluation from './models/GDGroupEvaluation.js';
import GDRecommendation from './models/GDRecommendation.js';
import Qualification from './models/Qualification.js';
import InterviewAssignment from './models/InterviewAssignment.js';
import InterviewEvaluation from './models/InterviewEvaluation.js';
import FinalResult from './models/FinalResult.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placepro_evaluate';

async function clearData() {
  try {
    console.log('[ClearData] Connecting to MongoDB at', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[ClearData] Connected. Wiping all dummy students, groups, evaluations, results, and logs...');

    await Promise.all([
      Student.deleteMany({}),
      Group.deleteMany({}),
      GDEvaluation.deleteMany({}),
      GDGroupEvaluation.deleteMany({}),
      GDRecommendation.deleteMany({}),
      Qualification.deleteMany({}),
      InterviewAssignment.deleteMany({}),
      InterviewEvaluation.deleteMany({}),
      FinalResult.deleteMany({}),
      AuditLog.deleteMany({}),
      User.deleteMany({}),
      Panel.deleteMany({}),
      Event.deleteMany({}),
    ]);

    console.log('[ClearData] All dummy data wiped clean (0 students, 0 groups, 0 evaluations).');

    // Create pristine system users
    const hashedPwd = await bcrypt.hash('password123', 10);
    const users = await User.create([
      {
        name: 'Dr. Rajesh Iyer',
        email: 'admin@placepro.demo',
        passwordHash: hashedPwd,
        role: 'admin',
        title: 'Dean of Training & Placement',
        avatar: 'RI',
      },
      {
        name: 'Prof. Alex Sharma',
        email: 'judge@placepro.demo',
        passwordHash: hashedPwd,
        role: 'judge',
        title: 'Senior GD Evaluator & Corporate Trainer',
        avatar: 'AS',
        assignedPanels: ['GD-PANEL'],
      },
      {
        name: 'Prof. Priya Nair',
        email: 'judge2@placepro.demo',
        passwordHash: hashedPwd,
        role: 'judge',
        title: 'Head of Business Communications',
        avatar: 'PN',
        assignedPanels: ['GD-PANEL'],
      },
      {
        name: 'Dr. Rajesh Menon',
        email: 'judge3@placepro.demo',
        passwordHash: hashedPwd,
        role: 'judge',
        title: 'Industry Specialist & Senior Evaluator',
        avatar: 'RM',
        assignedPanels: ['GD-PANEL'],
      },
      {
        name: 'Prof. Ananya Roy',
        email: 'judge4@placepro.demo',
        passwordHash: hashedPwd,
        role: 'judge',
        title: 'Leadership & Behavioral Science Coach',
        avatar: 'AR',
        assignedPanels: ['GD-PANEL'],
      },
      {
        name: 'Vikram Patel',
        email: 'hr@placepro.demo',
        passwordHash: hashedPwd,
        role: 'hr',
        title: 'Head of Talent Acquisition (Tech Division)',
        avatar: 'VP',
        interviewerNumber: 1,
      },
      {
        name: 'Sneha Gupta',
        email: 'hr2@placepro.demo',
        passwordHash: hashedPwd,
        role: 'hr',
        title: 'Senior HR Business Partner & Lead Recruiter',
        avatar: 'SG',
        interviewerNumber: 2,
      },
    ]);

    const judgeIds = [users[1]._id.toString(), users[2]._id.toString(), users[3]._id.toString(), users[4]._id.toString()];

    // Create event configuration
    await Event.create({
      name: 'Mock Placement Drive 2026',
      academicYear: '2025-2026',
      status: 'active',
      gdScoringConfig: {
        criteria: [
          { id: 'comm', name: 'Communication Skills', maxMarks: 10 },
          { id: 'clarity', name: 'Clarity of Thought', maxMarks: 10 },
          { id: 'confidence', name: 'Confidence', maxMarks: 10 },
          { id: 'reasoning', name: 'Logical Reasoning', maxMarks: 10 },
          { id: 'teamwork', name: 'Teamwork & Listening', maxMarks: 10 },
          { id: 'initiative', name: 'Initiative & Leadership', maxMarks: 10 },
        ],
        totalMarks: 60,
        maxRecommendationsPerGroup: 3,
      },
      hrScoringConfig: {
        criteria: [
          { id: 'comm', name: 'Communication Skills', maxMarks: 10 },
          { id: 'confidence', name: 'Confidence and Professionalism', maxMarks: 10 },
          { id: 'problem_solving', name: 'Problem-Solving Ability', maxMarks: 10 },
          { id: 'technical', name: 'Technical Awareness', maxMarks: 10 },
          { id: 'attitude', name: 'Attitude and Career Motivation', maxMarks: 10 },
        ],
        totalMarks: 50,
        workflow: 'workflow_b',
      },
      finalScoringConfig: {
        gdWeightPercentage: 40,
        hrWeightPercentage: 60,
        tieBreakingRules: ['finalScore', 'hrPercentage', 'gdPercentage'],
      },
    });

    // Create clean default Panel
    await Panel.create([
      {
        name: 'Main GD Evaluation Panel',
        code: 'GD-PANEL',
        location: 'Central Placement Auditorium',
        assignedJudgeIds: judgeIds,
      },
    ]);

    console.log('[ClearData] Successfully reset to clean state with 0 dummy records.');
    process.exit(0);
  } catch (err) {
    console.error('[ClearData] Error:', err);
    process.exit(1);
  }
}

clearData();
