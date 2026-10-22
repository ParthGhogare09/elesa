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

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB at', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Event.deleteMany({}),
      Panel.deleteMany({}),
      Group.deleteMany({}),
      GDEvaluation.deleteMany({}),
      GDGroupEvaluation.deleteMany({}),
      GDRecommendation.deleteMany({}),
      Qualification.deleteMany({}),
      InterviewAssignment.deleteMany({}),
      InterviewEvaluation.deleteMany({}),
      FinalResult.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Users with Multiple Judges & HRs...');
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

    const adminUser = users[0];
    const judge1 = users[1];
    const judge2 = users[2];
    const judge3 = users[3];
    const judge4 = users[4];
    const hr1 = users[5];
    const hr2 = users[6];

    const allJudgeIds = [judge1._id.toString(), judge2._id.toString(), judge3._id.toString(), judge4._id.toString()];

    console.log('[Seed] Seeding Event Configuration...');
    const event = await Event.create({
      name: 'Annual Placement Drive 2026 — Mock Evaluation',
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

    console.log('[Seed] Seeding 1 Single Unified GD Panel with all Judges assigned...');
    const panels = await Panel.create([
      {
        name: 'Main GD Evaluation Panel',
        code: 'GD-PANEL',
        location: 'Central Placement Auditorium',
        assignedJudgeIds: allJudgeIds,
      },
    ]);
    const mainPanel = panels[0];

    console.log('[Seed] Seeding 100 Students...');
    const FIRST_NAMES = ['Aarav', 'Ananya', 'Rohan', 'Tanvi', 'Siddharth', 'Meera', 'Arjun', 'Ishita', 'Aditya', 'Pooja', 'Varun', 'Kavya', 'Dhruv', 'Rhea', 'Karan', 'Neha', 'Nikhil', 'Shreya', 'Kabir', 'Simran'];
    const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Mehta', 'Kulkarni', 'Joshi', 'Chopra'];
    const BRANCHES = ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Electrical & Electronics'];

    const studentDocs = [];
    for (let i = 1; i <= 100; i++) {
      const fn = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
      const ln = LAST_NAMES[(i - 1) % LAST_NAMES.length];
      studentDocs.push({
        registrationId: `PP-2026-${String(i).padStart(3, '0')}`,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@campus.edu`,
        branch: BRANCHES[(i - 1) % BRANCHES.length],
        year: '4th Year (Batch of 2026)',
        contactNumber: `+91 98${String(10000000 + i * 739).slice(0, 8)}`,
      });
    }
    const createdStudents = await Student.insertMany(studentDocs);

    console.log('[Seed] Seeding 20 Groups in Single Unified Panel for all Judges...');
    const groupDocs = [];
    for (let g = 0; g < 20; g++) {
      const gNum = g + 1;
      const startIdx = g * 5;
      const gStudents = createdStudents.slice(startIdx, startIdx + 5).map((s) => s._id.toString());

      groupDocs.push({
        groupName: `Group ${gNum}`,
        groupCode: `GD-GRP-${String(gNum).padStart(2, '0')}`,
        panelId: mainPanel._id.toString(),
        judgeIds: allJudgeIds, // All judges can select and evaluate any group
        studentIds: gStudents,
        evaluationStatus: gNum <= 16 ? 'completed' : (gNum <= 18 ? 'partially_evaluated' : 'pending'),
      });
    }
    const createdGroups = await Group.insertMany(groupDocs);

    console.log('[Seed] Seeding GD Student & Group Evaluations & Recommendations (Strict Max 3 per group)...');
    const gdEvalDocs = [];
    const gdGroupEvalDocs = [];
    const gdRecDocs = [];
    const qualDocs = [];
    const hrAsgnDocs = [];
    const hrEvalDocs = [];
    const finalResultDocs = [];

    let rankCounter = 1;

    for (let g = 0; g < createdGroups.length; g++) {
      const grp = createdGroups[g];
      const isCompleted = grp.evaluationStatus === 'completed';
      const isPartial = grp.evaluationStatus === 'partially_evaluated';
      const judgeId = grp.judgeIds[0];

      if (isCompleted || isPartial) {
        const studentScoresInGroup = [];

        for (let s = 0; s < grp.studentIds.length; s++) {
          if (isCompleted || (isPartial && s < 2)) {
            const studentId = grp.studentIds[s];
            const base = 7 + ((g * 3 + s * 5) % 4);
            const scores = {
              comm: Math.min(10, Math.max(6, base + ((s + 1) % 3) - 1)),
              clarity: Math.min(10, Math.max(6, base + ((s + 2) % 3) - 1)),
              confidence: Math.min(10, Math.max(6, base + ((g + s) % 3) - 1)),
              reasoning: Math.min(10, Math.max(6, base + ((g + 1) % 3) - 1)),
              teamwork: Math.min(10, Math.max(6, base + ((s * 2) % 3) - 1)),
              initiative: Math.min(10, Math.max(6, base + ((g + s * 3) % 3) - 1)),
            };
            const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

            studentScoresInGroup.push({
              studentId,
              scores,
              totalScore,
              remarks: 'Articulate contribution, balanced listening, maintained high composure during rebuttal.',
            });
          }
        }

        // Recommend top 3 candidates per group (Strict Max 3 Limit)
        studentScoresInGroup.sort((a, b) => b.totalScore - a.totalScore);
        const top3Students = studentScoresInGroup.slice(0, 3).map((item) => item.studentId);

        // Seed Group Evaluation for each assigned judge
        for (const jId of grp.judgeIds) {
          const depth = 8 + ((g + 1) % 3);
          const flow = 8 + ((g + 2) % 3);
          const synergy = 7 + (g % 4);
          const decorum = 9;
          const grpTotal = depth + flow + synergy + decorum;
          gdGroupEvalDocs.push({
            groupId: grp._id.toString(),
            judgeId: jId,
            criterionScores: {
              topic_depth: depth,
              discussion_flow: flow,
              team_synergy: synergy,
              decorum_time: decorum,
            },
            totalScore: grpTotal,
            percentage: Math.round((grpTotal / 40) * 100 * 10) / 10,
            remarks: 'Group demonstrated commendable topical grasp, respectful turn-taking, and well-moderated counter arguments.',
            status: 'submitted',
          });
        }

        if (isCompleted) {
          gdRecDocs.push({
            groupId: grp._id.toString(),
            judgeId,
            studentIds: top3Students,
            status: 'submitted',
          });
        }

        for (const item of studentScoresInGroup) {
          const isRec = top3Students.includes(item.studentId);
          gdEvalDocs.push({
            groupId: grp._id.toString(),
            studentId: item.studentId,
            judgeId,
            criterionScores: item.scores,
            totalScore: item.totalScore,
            percentage: Math.round((item.totalScore / 60) * 100 * 10) / 10,
            remarks: item.remarks,
            recommendation: isRec,
            status: 'submitted',
          });

          if (isCompleted) {
            const isQualified = isRec;
            qualDocs.push({
              studentId: item.studentId,
              groupId: grp._id.toString(),
              panelId: grp.panelId,
              status: isQualified ? 'qualified' : 'not_qualified',
              gdScore: item.totalScore,
              gdPercentage: Math.round((item.totalScore / 60) * 100 * 10) / 10,
              recommendedByJudges: isRec ? [judgeId] : [],
              decisionBy: adminUser._id.toString(),
              remarks: isQualified ? 'Approved for Round 2 HR Interviews.' : 'Did not qualify for Round 2.',
            });

            // If qualified and in first 10 groups, seed dual HR evaluations and final results
            if (isQualified && g <= 10) {
              hrAsgnDocs.push(
                { studentId: item.studentId, hrId: hr1._id.toString(), status: 'completed' },
                { studentId: item.studentId, hrId: hr2._id.toString(), status: 'completed' }
              );

              const hr1Total = 42 + (rankCounter % 6);
              const hr2Total = 41 + ((rankCounter + 1) % 7);

              hrEvalDocs.push(
                {
                  studentId: item.studentId,
                  hrId: hr1._id.toString(),
                  criterionScores: { comm: 8, confidence: 9, problem_solving: 8, technical: 9, attitude: 9 },
                  totalScore: hr1Total,
                  percentage: (hr1Total / 50) * 100,
                  strengths: 'Solid system fundamentals, quick on behavioral scenarios.',
                  improvementAreas: 'Project estimation realism.',
                  remarks: 'Strong communicative presence and clear cultural alignment.',
                  recommendation: 'Strongly Recommended',
                },
                {
                  studentId: item.studentId,
                  hrId: hr2._id.toString(),
                  criterionScores: { comm: 9, confidence: 8, problem_solving: 8, technical: 8, attitude: 9 },
                  totalScore: hr2Total,
                  percentage: (hr2Total / 50) * 100,
                  strengths: 'Calm under stress queries, genuine eagerness to learn.',
                  improvementAreas: 'Deepen architecture exposure.',
                  remarks: 'Pleasant demeanor, structured answers, handled situational prompts with maturity.',
                  recommendation: 'Recommended',
                }
              );

              const gdPct = (item.totalScore / 60) * 100;
              const hrPct = ((hr1Total / 50 * 100) + (hr2Total / 50 * 100)) / 2;
              const finalScore = Math.round(((gdPct * 0.40) + (hrPct * 0.60)) * 10) / 10;

              finalResultDocs.push({
                studentId: item.studentId,
                groupId: grp._id.toString(),
                panelId: grp.panelId,
                gdScore: item.totalScore,
                gdPercentage: Math.round(gdPct * 10) / 10,
                hr1Score: hr1Total,
                hr2Score: hr2Total,
                hrScore: Math.round(((hr1Total + hr2Total) / 2) * 10) / 10,
                hrPercentage: Math.round(hrPct * 10) / 10,
                finalScore,
                rank: rankCounter,
                selectionStatus: rankCounter <= 12 ? 'selected' : (rankCounter <= 20 ? 'waitlisted' : 'not_selected'),
                scoringConfigSnapshot: { gdWeight: 40, hrWeight: 60 },
              });

              rankCounter++;
            }
          }
        }
      }
    }

    await GDEvaluation.insertMany(gdEvalDocs);
    await GDGroupEvaluation.insertMany(gdGroupEvalDocs);
    await GDRecommendation.insertMany(gdRecDocs);
    await Qualification.insertMany(qualDocs);
    await InterviewAssignment.insertMany(hrAsgnDocs);
    await InterviewEvaluation.insertMany(hrEvalDocs);
    await FinalResult.insertMany(finalResultDocs);

    console.log('[Seed] Seeding Audit Logs...');
    await AuditLog.create([
      {
        actorName: 'Dr. Rajesh Iyer (Admin)',
        action: 'EVENT_INITIALIZED',
        targetType: 'Event',
        targetId: event._id.toString(),
        details: 'Initialized placement drive with 4 default GD panels and 100 students.',
      },
      {
        actorName: 'Prof. Alex Sharma (Judge)',
        action: 'GD_EVALUATION_COMPLETED',
        targetType: 'Group',
        targetId: 'grp-batch',
        details: 'Completed GD individual evaluations and submitted 3 recommendations per group.',
      },
      {
        actorName: 'Dr. Rajesh Iyer (Admin)',
        action: 'ROUND1_QUALIFICATION_APPROVED',
        targetType: 'Qualification',
        targetId: 'batch',
        details: 'Approved qualified candidates for Round 2 HR Interviews.',
      },
      {
        actorName: 'Vikram Patel (HR)',
        action: 'HR_EVALUATION_SUBMITTED',
        targetType: 'InterviewEvaluation',
        targetId: 'candidate-batch',
        details: 'Submitted interview rubrics for assigned candidates.',
      },
    ]);

    console.log('========================================================');
    console.log(' PlacePro Evaluate Seed Completed Successfully!');
    console.log(' Users: admin@placepro.demo, judge@placepro.demo, hr@placepro.demo');
    console.log(' 100 Students, 4 Panels, 20 Groups (5 students each)');
    console.log('========================================================');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
}

seed();
