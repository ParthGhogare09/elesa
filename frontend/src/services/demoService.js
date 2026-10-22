// PlacePro Evaluate - Stateful Demo Service
// Enables 100% full application interactivity in the browser without requiring a live MongoDB database.
// All edits, evaluations, group creations, qualifications, and publications persist in localStorage.

import {
  MOCK_USERS,
  MOCK_EVENT,
  MOCK_PANELS,
  MOCK_STUDENTS,
  MOCK_GROUPS,
  MOCK_GD_EVALUATIONS,
  MOCK_GD_GROUP_EVALUATIONS,
  MOCK_GD_RECOMMENDATIONS,
  MOCK_QUALIFICATIONS,
  MOCK_INTERVIEW_ASSIGNMENTS,
  MOCK_INTERVIEW_EVALUATIONS,
  MOCK_FINAL_RESULTS,
  MOCK_AUDIT_LOGS,
  DEFAULT_GD_CRITERIA,
  DEFAULT_GROUP_GD_CRITERIA,
  DEFAULT_HR_CRITERIA,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'pp_eval_users',
  EVENT: 'pp_eval_event',
  PANELS: 'pp_eval_panels',
  STUDENTS: 'pp_eval_students',
  GROUPS: 'pp_eval_groups',
  GD_EVALS: 'pp_eval_gd_evaluations',
  GD_GROUP_EVALS: 'pp_eval_gd_group_evaluations',
  GD_RECS: 'pp_eval_gd_recommendations',
  QUALIFICATIONS: 'pp_eval_qualifications',
  HR_ASSIGNMENTS: 'pp_eval_hr_assignments',
  HR_EVALS: 'pp_eval_hr_evaluations',
  FINAL_RESULTS: 'pp_eval_final_results',
  AUDIT_LOGS: 'pp_eval_audit_logs',
};

function getStored(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultData;
  }
}

function setStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

class DemoService {
  constructor() {
    this.init();
  }

  init() {
    const version = localStorage.getItem('pp_data_version');
    if (version !== 'v4_clean_production') {
      this.resetToDefaults();
      localStorage.setItem('pp_data_version', 'v4_clean_production');
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify(MOCK_EVENT));
    localStorage.setItem(STORAGE_KEYS.PANELS, JSON.stringify(MOCK_PANELS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(MOCK_GROUPS));
    localStorage.setItem(STORAGE_KEYS.GD_EVALS, JSON.stringify(MOCK_GD_EVALUATIONS));
    localStorage.setItem(STORAGE_KEYS.GD_GROUP_EVALS, JSON.stringify(MOCK_GD_GROUP_EVALUATIONS));
    localStorage.setItem(STORAGE_KEYS.GD_RECS, JSON.stringify(MOCK_GD_RECOMMENDATIONS));
    localStorage.setItem(STORAGE_KEYS.QUALIFICATIONS, JSON.stringify(MOCK_QUALIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.HR_ASSIGNMENTS, JSON.stringify(MOCK_INTERVIEW_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.HR_EVALS, JSON.stringify(MOCK_INTERVIEW_EVALUATIONS));
    localStorage.setItem(STORAGE_KEYS.FINAL_RESULTS, JSON.stringify(MOCK_FINAL_RESULTS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(MOCK_AUDIT_LOGS));
  }

  // --- USERS & AUTH ---
  getUsers() {
    return getStored(STORAGE_KEYS.USERS, MOCK_USERS);
  }

  login(email, role) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (role && user.role !== role) {
        throw new Error(`User ${email} does not have the role ${role}.`);
      }
      return user;
    }
    throw new Error('Invalid credentials');
  }

  addHRUser(hrData) {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === hrData.email.toLowerCase())) {
      throw new Error(`Email ${hrData.email} already exists.`);
    }
    const currentHrCount = users.filter(u => u.role === 'hr').length;
    const newHR = {
      id: `user-hr-${Date.now()}`,
      name: hrData.name,
      email: hrData.email,
      role: 'hr',
      title: hrData.title || 'HR Talent Specialist',
      avatar: (hrData.name || 'HR').slice(0, 2).toUpperCase(),
      isActive: true,
      interviewerNumber: hrData.interviewerNumber || (currentHrCount + 1),
    };
    users.push(newHR);
    setStored(STORAGE_KEYS.USERS, users);
    this.logAction('HR_USER_ADDED', 'User', newHR.id, `Added HR Interviewer ${newHR.name} (${newHR.email})`);
    return newHR;
  }

  deleteHRUser(id) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('HR Interviewer not found');
    const removed = users.splice(index, 1)[0];
    setStored(STORAGE_KEYS.USERS, users);
    this.logAction('HR_USER_DELETED', 'User', id, `Deleted HR Interviewer ${removed.name} (${removed.email})`);
    return removed;
  }

  // --- EVENT ---
  getEvent() {
    return getStored(STORAGE_KEYS.EVENT, MOCK_EVENT);
  }

  updateEvent(updates) {
    const event = { ...this.getEvent(), ...updates };
    setStored(STORAGE_KEYS.EVENT, event);
    this.logAction('EVENT_UPDATED', 'Event', event.id, 'Updated event configuration');
    return event;
  }

  // --- AUDIT LOG ---
  getAuditLogs() {
    return getStored(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT_LOGS);
  }

  logAction(action, targetType, targetId, details, actorName = 'System / Admin') {
    const logs = this.getAuditLogs();
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventId: 'evt-2026-01',
      actorName,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // Keep latest 100
  }

  // --- STUDENTS ---
  getStudents() {
    return getStored(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
  }

  getStudentById(id) {
    return this.getStudents().find(s => s.id === id || s.registrationId === id);
  }

  addStudent(studentData) {
    const students = this.getStudents();
    // Validate uniqueness of registrationId and email
    if (students.some(s => s.registrationId.toLowerCase() === studentData.registrationId.toLowerCase())) {
      throw new Error(`Registration ID ${studentData.registrationId} already exists.`);
    }
    if (students.some(s => s.email.toLowerCase() === studentData.email.toLowerCase())) {
      throw new Error(`Email ${studentData.email} already exists.`);
    }

    const newStudent = {
      ...studentData,
      id: `std-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    students.unshift(newStudent);
    setStored(STORAGE_KEYS.STUDENTS, students);
    this.logAction('STUDENT_ADDED', 'Student', newStudent.id, `Added student ${newStudent.name} (${newStudent.registrationId})`);
    return newStudent;
  }

  updateStudent(id, updates) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    students[index] = { ...students[index], ...updates };
    setStored(STORAGE_KEYS.STUDENTS, students);
    this.logAction('STUDENT_UPDATED', 'Student', id, `Updated student details for ${students[index].name}`);
    return students[index];
  }

  importStudents(newStudentsList) {
    const existing = this.getStudents();
    const added = [];
    newStudentsList.forEach(item => {
      if (!existing.some(s => s.registrationId === item.registrationId || s.email === item.email)) {
        const student = {
          ...item,
          id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        existing.push(student);
        added.push(student);
      }
    });
    setStored(STORAGE_KEYS.STUDENTS, existing);
    this.logAction('STUDENTS_IMPORTED', 'Student', 'batch', `Imported ${added.length} students via CSV.`);
    return added;
  }

  deleteStudent(id) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id || s._id === id);
    if (index === -1) throw new Error('Student not found');
    const removed = students.splice(index, 1)[0];
    setStored(STORAGE_KEYS.STUDENTS, students);

    // Remove from any groups
    const groups = this.getGroups();
    groups.forEach(g => {
      g.studentIds = g.studentIds.filter(sId => sId !== id);
    });
    setStored(STORAGE_KEYS.GROUPS, groups);

    this.logAction('STUDENT_DELETED', 'Student', id, `Deleted student ${removed.name} (${removed.registrationId})`);
    return removed;
  }

  // --- PANELS ---
  getPanels() {
    return getStored(STORAGE_KEYS.PANELS, MOCK_PANELS);
  }

  addPanel(panelData) {
    const panels = this.getPanels();
    const newPanel = {
      ...panelData,
      id: `panel-${Date.now()}`,
      eventId: 'evt-2026-01',
      status: 'in_progress',
      assignedJudgeIds: panelData.assignedJudgeIds || ['user-judge-1'],
    };
    panels.push(newPanel);
    setStored(STORAGE_KEYS.PANELS, panels);
    this.logAction('PANEL_CREATED', 'Panel', newPanel.id, `Created panel ${newPanel.name}`);
    return newPanel;
  }

  deletePanel(id) {
    const panels = this.getPanels();
    const index = panels.findIndex(p => p.id === id || p._id === id);
    if (index === -1) throw new Error('Panel not found');
    const removed = panels.splice(index, 1)[0];
    setStored(STORAGE_KEYS.PANELS, panels);
    this.logAction('PANEL_DELETED', 'Panel', id, `Deleted panel ${removed.name}`);
    return removed;
  }

  updatePanel(id, updates) {
    const panels = this.getPanels();
    const index = panels.findIndex(p => p.id === id || p._id === id);
    if (index === -1) throw new Error('Panel not found');
    panels[index] = { ...panels[index], ...updates };
    setStored(STORAGE_KEYS.PANELS, panels);
    this.logAction('PANEL_UPDATED', 'Panel', id, `Updated panel ${panels[index].name}`);
    return panels[index];
  }

  // --- GROUPS ---
  getGroups() {
    return getStored(STORAGE_KEYS.GROUPS, MOCK_GROUPS);
  }

  getGroupById(id) {
    return this.getGroups().find(g => g.id === id || g._id === id);
  }

  deleteGroup(id) {
    const groups = this.getGroups();
    const index = groups.findIndex(g => g.id === id || g._id === id);
    if (index === -1) throw new Error('Group not found');
    const removed = groups.splice(index, 1)[0];
    setStored(STORAGE_KEYS.GROUPS, groups);

    // Clean up related evaluations
    const gdEvals = this.getGDEvaluations().filter(e => e.groupId !== id);
    setStored(STORAGE_KEYS.GD_EVALS, gdEvals);
    const grpEvals = this.getGDGroupEvaluations().filter(e => e.groupId !== id);
    setStored(STORAGE_KEYS.GD_GROUP_EVALS, grpEvals);

    this.logAction('GROUP_DELETED', 'Group', id, `Deleted group ${removed.groupName}`);
    return removed;
  }

  createGroup({ groupName, studentIds, panelId, judgeIds }) {
    // Business rule: 4 to 6 students per group
    if (!studentIds || studentIds.length < 4 || studentIds.length > 6) {
      throw new Error(`Group must contain between 4 and 6 students. You selected ${studentIds ? studentIds.length : 0}.`);
    }

    // Business rule: Student cannot belong to two active groups in same event
    const allGroups = this.getGroups();
    const alreadyAssignedStudentIds = new Set();
    allGroups.forEach(g => {
      g.studentIds.forEach(sId => alreadyAssignedStudentIds.add(sId));
    });

    const duplicates = studentIds.filter(sId => alreadyAssignedStudentIds.has(sId));
    if (duplicates.length > 0) {
      const students = this.getStudents();
      const dupNames = duplicates.map(id => students.find(s => s.id === id)?.name || id).join(', ');
      throw new Error(`Students already assigned to another active group: ${dupNames}`);
    }

    const groupNumber = allGroups.length + 1;
    const newGroup = {
      id: `grp-${Date.now()}`,
      eventId: 'evt-2026-01',
      groupName: groupName || `Group ${groupNumber}`,
      groupCode: `GD-GRP-${String(groupNumber).padStart(2, '0')}`,
      panelId: panelId || 'panel-a',
      judgeIds: judgeIds || ['user-judge-1'],
      studentIds,
      evaluationStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    allGroups.push(newGroup);
    setStored(STORAGE_KEYS.GROUPS, allGroups);
    this.logAction('GROUP_CREATED', 'Group', newGroup.id, `Created ${newGroup.groupName} with ${studentIds.length} students on ${panelId}`);
    return newGroup;
  }

  bulkCreateGroups({ selectedStudentIds, targetPanelIds, judgeAssignments }) {
    const count = selectedStudentIds.length;
    if (count < 4) {
      throw new Error('At least 4 students required to form groups.');
    }

    const groups = this.getGroups();
    const studentsPerGroup = 5; // Default 5 (valid 4-6)
    const newGroups = [];
    
    let currentIdx = 0;
    let groupNum = groups.length + 1;

    while (currentIdx < count) {
      const remaining = count - currentIdx;
      let take = studentsPerGroup;
      
      // If remaining after taking 5 is less than 4, distribute evenly
      if (remaining === 6 || remaining === 7) {
        // e.g. if 6, take 6 (allowed 4-6)
        take = remaining === 6 ? 6 : 4;
      } else if (remaining < 4) {
        // distribute into previous group if permitted
        if (newGroups.length > 0 && newGroups[newGroups.length - 1].studentIds.length < 6) {
          const leftOver = selectedStudentIds.slice(currentIdx);
          newGroups[newGroups.length - 1].studentIds.push(...leftOver);
          break;
        }
      }

      const chunk = selectedStudentIds.slice(currentIdx, currentIdx + take);
      if (chunk.length >= 4 && chunk.length <= 6) {
        const panelId = targetPanelIds[(groupNum - 1) % targetPanelIds.length] || 'panel-a';
        const judgeId = judgeAssignments[panelId] || (panelId === 'panel-b' || panelId === 'panel-d' ? 'user-judge-2' : 'user-judge-1');

        newGroups.push({
          id: `grp-${Date.now()}-${groupNum}`,
          eventId: 'evt-2026-01',
          groupName: `Group ${groupNum} (Batch)`,
          groupCode: `GD-GRP-${String(groupNum).padStart(2, '0')}`,
          panelId,
          judgeIds: [judgeId],
          studentIds: chunk,
          evaluationStatus: 'pending',
          createdAt: new Date().toISOString(),
        });
        groupNum++;
      }
      currentIdx += take;
    }

    groups.push(...newGroups);
    setStored(STORAGE_KEYS.GROUPS, groups);
    this.logAction('BULK_GROUPS_CREATED', 'Group', 'batch', `Bulk created ${newGroups.length} groups for ${selectedStudentIds.length} students.`);
    return newGroups;
  }

  // --- GD EVALUATIONS ---
  getGDEvaluations() {
    return getStored(STORAGE_KEYS.GD_EVALS, MOCK_GD_EVALUATIONS);
  }

  getGDGroupEvaluations() {
    return getStored(STORAGE_KEYS.GD_GROUP_EVALS, MOCK_GD_GROUP_EVALUATIONS);
  }

  saveGDGroupEvaluation({ groupId, judgeId, criterionScores, remarks, status = 'submitted' }) {
    const groupEvals = this.getGDGroupEvaluations();
    let total = 0;
    const validatedScores = {};
    const criteria = DEFAULT_GROUP_GD_CRITERIA;

    criteria.forEach(crit => {
      const score = Number(criterionScores[crit.id]) || 0;
      if (score < 0 || score > crit.maxMarks) {
        throw new Error(`Score for ${crit.name} must be between 0 and ${crit.maxMarks}`);
      }
      validatedScores[crit.id] = score;
      total += score;
    });

    if (status === 'submitted' && (!remarks || !remarks.trim())) {
      throw new Error("Group overall remarks are required before submitting evaluation.");
    }

    const existingIdx = groupEvals.findIndex(e => e.groupId === groupId && e.judgeId === judgeId);
    const evalRecord = {
      id: existingIdx >= 0 ? groupEvals[existingIdx].id : `group-eval-${groupId}-${judgeId}`,
      eventId: 'evt-2026-01',
      groupId,
      judgeId,
      criterionScores: validatedScores,
      totalScore: total,
      percentage: Math.round((total / 40) * 100 * 10) / 10,
      remarks: remarks ? remarks.trim() : '',
      status,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      groupEvals[existingIdx] = evalRecord;
    } else {
      groupEvals.push(evalRecord);
    }
    setStored(STORAGE_KEYS.GD_GROUP_EVALS, groupEvals);
    this.logAction('GD_GROUP_EVALUATION_SAVED', 'GDGroupEvaluation', evalRecord.id, `Group evaluation recorded for group ${groupId}: Score ${total}/40`);
    return evalRecord;
  }

  getGDRecommendations() {
    return getStored(STORAGE_KEYS.GD_RECS, MOCK_GD_RECOMMENDATIONS);
  }

  saveGDEvaluation(evalData) {
    const evals = this.getGDEvaluations();
    const { groupId, studentId, judgeId, criterionScores, remarks, status = 'submitted' } = evalData;

    // Validate criterion scores (0-10) and calculate authoritative total
    let total = 0;
    const validatedScores = {};
    const criteria = DEFAULT_GD_CRITERIA;

    criteria.forEach(crit => {
      const score = Number(criterionScores[crit.id]) || 0;
      if (score < 0 || score > crit.maxMarks) {
        throw new Error(`Score for ${crit.name} must be between 0 and ${crit.maxMarks}`);
      }
      validatedScores[crit.id] = score;
      total += score;
    });

    if (status === 'submitted' && (!remarks || remarks.trim().length === 0)) {
      throw new Error("Judge's remarks are required before submitting evaluation.");
    }

    const existingIdx = evals.findIndex(e => e.groupId === groupId && e.studentId === studentId && e.judgeId === judgeId);
    const existingRecs = this.getGDRecommendations().find(r => r.groupId === groupId && r.judgeId === judgeId);
    const isRecommended = existingRecs ? existingRecs.studentIds.includes(studentId) : false;

    const evalRecord = {
      id: existingIdx >= 0 ? evals[existingIdx].id : `gdeval-${groupId}-${studentId}-${judgeId}`,
      eventId: 'evt-2026-01',
      groupId,
      studentId,
      judgeId,
      criterionScores: validatedScores,
      totalScore: total,
      percentage: Math.round((total / 60) * 100 * 10) / 10,
      remarks: remarks ? remarks.trim() : '',
      recommendation: isRecommended,
      status,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      evals[existingIdx] = evalRecord;
    } else {
      evals.push(evalRecord);
    }
    setStored(STORAGE_KEYS.GD_EVALS, evals);

    // Update group evaluation status
    const group = this.getGroupById(groupId);
    if (group) {
      const groupEvals = evals.filter(e => e.groupId === groupId && e.judgeId === judgeId && e.status === 'submitted');
      if (groupEvals.length === group.studentIds.length) {
        this.updateGroupStatus(groupId, 'completed');
      } else if (groupEvals.length > 0) {
        this.updateGroupStatus(groupId, 'partially_evaluated');
      }
    }

    this.logAction('GD_EVALUATION_SAVED', 'GDEvaluation', evalRecord.id, `Recorded GD evaluation for student ${studentId}: Score ${total}/60`);
    return evalRecord;
  }

  deleteGDEvaluation(id) {
    const evals = this.getGDEvaluations();
    const index = evals.findIndex(e => e.id === id || e._id === id);
    if (index === -1) throw new Error('Evaluation not found');
    const removed = evals.splice(index, 1)[0];
    setStored(STORAGE_KEYS.GD_EVALS, evals);
    this.logAction('GD_EVALUATION_DELETED', 'GDEvaluation', id, `Deleted individual GD evaluation for student ${removed.studentId}`);
    return removed;
  }

  deleteGDGroupEvaluation(id) {
    const grpEvals = this.getGDGroupEvaluations();
    const index = grpEvals.findIndex(e => e.id === id || e._id === id);
    if (index === -1) throw new Error('Group evaluation not found');
    const removed = grpEvals.splice(index, 1)[0];
    setStored(STORAGE_KEYS.GD_GROUP_EVALS, grpEvals);
    this.logAction('GD_GROUP_EVALUATION_DELETED', 'GDGroupEvaluation', id, `Deleted group dynamics score for group ${removed.groupId}`);
    return removed;
  }

  updateGroupStatus(groupId, status) {
    const groups = this.getGroups();
    const g = groups.find(x => x.id === groupId);
    if (g) {
      g.evaluationStatus = status;
      setStored(STORAGE_KEYS.GROUPS, groups);
    }
  }

  // --- GD RECOMMENDATIONS (CRITICAL BUSINESS RULE: MAX 3 STUDENTS PER GROUP PER JUDGE) ---
  saveGDRecommendations(groupId, judgeId, studentIds) {
    // STRICT BUSINESS RULE CHECK: Maximum 3 students per group per judge!
    if (!studentIds || !Array.isArray(studentIds)) {
      throw new Error('Invalid student IDs list for recommendation.');
    }
    if (studentIds.length > 3) {
      throw new Error('Strict limit exceeded: A judge cannot recommend more than 3 students from any single group.');
    }

    // Verify all recommended students belong to this group
    const group = this.getGroupById(groupId);
    if (!group) throw new Error('Group not found');
    const invalidIds = studentIds.filter(id => !group.studentIds.includes(id));
    if (invalidIds.length > 0) {
      throw new Error('Recommended students must belong to this assigned group.');
    }

    const recs = this.getGDRecommendations();
    const existingIdx = recs.findIndex(r => r.groupId === groupId && r.judgeId === judgeId);

    const recRecord = {
      id: existingIdx >= 0 ? recs[existingIdx].id : `rec-${groupId}-${judgeId}`,
      eventId: 'evt-2026-01',
      groupId,
      judgeId,
      studentIds,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      recs[existingIdx] = recRecord;
    } else {
      recs.push(recRecord);
    }
    setStored(STORAGE_KEYS.GD_RECS, recs);

    // Update recommendation flag on student evaluations
    const evals = this.getGDEvaluations();
    evals.forEach(e => {
      if (e.groupId === groupId && e.judgeId === judgeId) {
        e.recommendation = studentIds.includes(e.studentId);
      }
    });
    setStored(STORAGE_KEYS.GD_EVALS, evals);

    // Auto-update qualification records so recommended candidates are immediately accessible to HR
    const quals = getStored(STORAGE_KEYS.QUALIFICATIONS, MOCK_QUALIFICATIONS);
    const students = this.getStudents();
    studentIds.forEach(id => {
      let q = quals.find(x => x.studentId === id);
      const student = students.find(s => s.id === id);
      const studentEvals = this.getGDEvaluations().filter(e => e.studentId === id);
      const avgScore = studentEvals.length > 0
        ? Math.round((studentEvals.reduce((acc, c) => acc + (c.totalScore || 0), 0) / studentEvals.length) * 10) / 10
        : 0;

      if (!q) {
        quals.push({
          id: `qual-${id}`,
          eventId: 'evt-2026-01',
          studentId: id,
          groupId,
          panelId: group ? group.panelId : 'panel-1',
          status: 'qualified',
          gdScore: avgScore,
          gdPercentage: Math.round((avgScore / 60) * 100 * 10) / 10,
          recommendedByJudges: [judgeId],
          decisionBy: judgeId,
          decisionAt: new Date().toISOString(),
          remarks: `Recommended for Round 2 HR by GD Judge.`,
        });
      } else {
        q.status = 'qualified';
        if (!q.recommendedByJudges) q.recommendedByJudges = [];
        if (!q.recommendedByJudges.includes(judgeId)) q.recommendedByJudges.push(judgeId);
        if (q.gdScore === 0 && avgScore > 0) {
          q.gdScore = avgScore;
          q.gdPercentage = Math.round((avgScore / 60) * 100 * 10) / 10;
        }
      }
    });
    setStored(STORAGE_KEYS.QUALIFICATIONS, quals);

    // Auto-assign recommended students to all active HR interviewers
    const hrUsers = this.getUsers().filter(u => u.role === 'hr');
    const assignments = this.getInterviewAssignments();
    studentIds.forEach(id => {
      hrUsers.forEach(hr => {
        const exists = assignments.some(a => a.studentId === id && a.hrId === hr.id);
        if (!exists) {
          assignments.push({
            id: `asgn-${id}-${hr.id}`,
            eventId: 'evt-2026-01',
            studentId: id,
            hrId: hr.id,
            status: 'pending',
            scheduledAt: new Date().toISOString(),
          });
        }
      });
    });
    setStored(STORAGE_KEYS.HR_ASSIGNMENTS, assignments);

    this.logAction('GD_RECOMMENDATIONS_SUBMITTED', 'GDRecommendation', recRecord.id, `Judge submitted ${studentIds.length} recommendation(s) (Max 3) for ${group.groupName}`);
    return recRecord;
  }

  // --- GET ALL RECOMMENDED CANDIDATES FOR HR ROUND ---
  // Every HR interviewer sees ALL candidates who have been recommended by judges in GD or marked qualified
  getRecommendedCandidatesForHR() {
    const students = this.getStudents();
    const groups = this.getGroups();
    const recs = this.getGDRecommendations();
    const gdEvals = this.getGDEvaluations();
    const quals = this.getQualifications();
    const hrEvals = this.getInterviewEvaluations();
    const users = this.getUsers();

    const recStudentMap = new Map();

    // From GD recommendations submitted by judges
    recs.forEach(r => {
      if (Array.isArray(r.studentIds)) {
        r.studentIds.forEach(id => {
          if (!recStudentMap.has(id)) {
            recStudentMap.set(id, new Set());
          }
          recStudentMap.get(id).add(r.judgeId);
        });
      }
    });

    // From Qualifications
    quals.forEach(q => {
      if (q.status === 'qualified') {
        if (!recStudentMap.has(q.studentId)) {
          recStudentMap.set(q.studentId, new Set(q.recommendedByJudges || []));
        } else if (q.recommendedByJudges) {
          q.recommendedByJudges.forEach(jId => recStudentMap.get(q.studentId).add(jId));
        }
      }
    });

    // From GD individual evaluations with recommendation flag
    gdEvals.forEach(e => {
      if (e.recommendation) {
        if (!recStudentMap.has(e.studentId)) {
          recStudentMap.set(e.studentId, new Set([e.judgeId]));
        } else {
          recStudentMap.get(e.studentId).add(e.judgeId);
        }
      }
    });

    const result = [];
    recStudentMap.forEach((judgeIdsSet, studentId) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const group = groups.find(g => g.studentIds && g.studentIds.includes(studentId));
      const studentGdEvals = gdEvals.filter(e => e.studentId === studentId);
      const studentHrEvals = hrEvals.filter(e => e.studentId === studentId);

      const avgGdScore = studentGdEvals.length > 0
        ? Math.round((studentGdEvals.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / studentGdEvals.length) * 10) / 10
        : 0;

      const judgeNames = Array.from(judgeIdsSet).map(jId => {
        const u = users.find(user => user.id === jId);
        return u ? u.name : (jId || 'Judge');
      });

      result.push({
        id: student.id,
        studentId: student.id,
        student,
        group,
        groupName: group?.groupName || 'Unassigned',
        gdEvals: studentGdEvals,
        avgGdScore,
        recommendingJudgeIds: Array.from(judgeIdsSet),
        recommendingJudgeNames: judgeNames,
        hrEvals: studentHrEvals,
      });
    });

    return result;
  }

  // --- QUALIFICATION MANAGEMENT (ROUND 1 TO ROUND 2) ---
  getQualifications() {
    const quals = getStored(STORAGE_KEYS.QUALIFICATIONS, MOCK_QUALIFICATIONS);
    const recs = this.getGDRecommendations();
    const gdEvals = this.getGDEvaluations();
    const groups = this.getGroups();
    let updated = false;

    // Collect all unique student IDs recommended by ANY judge
    const recStudentMap = new Map();
    recs.forEach(r => {
      if (Array.isArray(r.studentIds)) {
        r.studentIds.forEach(id => {
          if (!recStudentMap.has(id)) recStudentMap.set(id, new Set());
          recStudentMap.get(id).add(r.judgeId);
        });
      }
    });
    gdEvals.forEach(e => {
      if (e.recommendation) {
        if (!recStudentMap.has(e.studentId)) recStudentMap.set(e.studentId, new Set([e.judgeId]));
        else recStudentMap.get(e.studentId).add(e.judgeId);
      }
    });

    recStudentMap.forEach((judgeSet, studentId) => {
      let q = quals.find(x => x.studentId === studentId);
      const studentEvals = gdEvals.filter(e => e.studentId === studentId);
      const avgScore = studentEvals.length > 0
        ? Math.round((studentEvals.reduce((acc, c) => acc + (c.totalScore || 0), 0) / studentEvals.length) * 10) / 10
        : 0;
      const group = groups.find(g => g.studentIds && g.studentIds.includes(studentId));

      if (!q) {
        quals.push({
          id: `qual-${studentId}`,
          eventId: 'evt-2026-01',
          studentId,
          groupId: group ? group.id : '',
          panelId: group ? group.panelId : 'panel-1',
          status: 'qualified',
          gdScore: avgScore,
          gdPercentage: Math.round((avgScore / 60) * 100 * 10) / 10,
          recommendedByJudges: Array.from(judgeSet),
          decisionBy: 'system',
          decisionAt: new Date().toISOString(),
          remarks: 'Qualified for Round 2 HR based on GD judge recommendation.',
        });
        updated = true;
      } else {
        if (q.status !== 'qualified') {
          q.status = 'qualified';
          updated = true;
        }
        if (!q.recommendedByJudges) q.recommendedByJudges = [];
        judgeSet.forEach(jId => {
          if (!q.recommendedByJudges.includes(jId)) {
            q.recommendedByJudges.push(jId);
            updated = true;
          }
        });
        if (q.gdScore === 0 && avgScore > 0) {
          q.gdScore = avgScore;
          q.gdPercentage = Math.round((avgScore / 60) * 100 * 10) / 10;
          updated = true;
        }
      }
    });

    if (updated) {
      setStored(STORAGE_KEYS.QUALIFICATIONS, quals);
    }
    return quals;
  }

  updateQualificationStatus(studentId, status, remarks = '') {
    const quals = this.getQualifications();
    let qual = quals.find(q => q.studentId === studentId);
    const student = this.getStudentById(studentId);
    const groups = this.getGroups();
    const group = groups.find(g => g.studentIds.includes(studentId));

    if (!qual) {
      qual = {
        id: `qual-${studentId}`,
        eventId: 'evt-2026-01',
        studentId,
        groupId: group ? group.id : '',
        panelId: group ? group.panelId : '',
        status,
        gdScore: 0,
        gdPercentage: 0,
        recommendedByJudges: [],
        decisionBy: 'user-admin-1',
        decisionAt: new Date().toISOString(),
        remarks,
      };
      quals.push(qual);
    } else {
      qual.status = status;
      qual.decisionBy = 'user-admin-1';
      qual.decisionAt = new Date().toISOString();
      if (remarks) qual.remarks = remarks;
    }

    setStored(STORAGE_KEYS.QUALIFICATIONS, quals);
    this.logAction('QUALIFICATION_DECISION', 'Qualification', qual.id, `Admin marked student ${student?.name} as ${status}`);
    return qual;
  }

  batchApproveAllRecommended() {
    const quals = this.getQualifications();
    const recs = this.getGDRecommendations();
    const allRecommendedStudentIds = new Set();
    recs.forEach(r => r.studentIds.forEach(id => allRecommendedStudentIds.add(id)));

    let updatedCount = 0;
    quals.forEach(q => {
      if (allRecommendedStudentIds.has(q.studentId) && q.status !== 'qualified') {
        q.status = 'qualified';
        q.decisionBy = 'user-admin-1';
        q.decisionAt = new Date().toISOString();
        q.remarks = 'Batch approved by Administrator based on judge recommendation.';
        updatedCount++;
      }
    });

    setStored(STORAGE_KEYS.QUALIFICATIONS, quals);
    this.logAction('BATCH_QUALIFICATION_APPROVED', 'Qualification', 'batch', `Batch approved ${updatedCount} recommended candidates for Round 2 HR.`);
    return updatedCount;
  }

  addQualification(qualData) {
    const quals = this.getQualifications();
    const existingIdx = quals.findIndex(q => q.studentId === qualData.studentId);
    const qualRecord = {
      id: qualData.id || `qual-${Date.now()}`,
      eventId: 'evt-2026-01',
      studentId: qualData.studentId,
      groupId: qualData.groupId || 'grp-1',
      panelId: qualData.panelId || 'panel-1',
      status: qualData.status || 'qualified',
      gdScore: qualData.gdScore || 45,
      gdPercentage: qualData.gdPercentage || 75,
      recommendedByJudges: qualData.recommendedByJudges || ['user-judge-1'],
      decisionBy: 'user-admin-1',
      decisionAt: new Date().toISOString(),
      remarks: qualData.remarks || 'Manually added by administrator.',
    };
    if (existingIdx >= 0) {
      quals[existingIdx] = qualRecord;
    } else {
      quals.unshift(qualRecord);
    }
    setStored(STORAGE_KEYS.QUALIFICATIONS, quals);
    this.logAction('QUALIFICATION_ADDED', 'Qualification', qualRecord.id, `Admin added qualification record for student ${qualRecord.studentId}`);
    return qualRecord;
  }

  deleteQualification(id) {
    const quals = this.getQualifications();
    const index = quals.findIndex(q => q.id === id || q.studentId === id);
    if (index === -1) throw new Error('Qualification record not found');
    const removed = quals.splice(index, 1)[0];
    setStored(STORAGE_KEYS.QUALIFICATIONS, quals);
    this.logAction('QUALIFICATION_DELETED', 'Qualification', id, `Removed qualification record for student ${removed.studentId}`);
    return removed;
  }

  // --- HR INTERVIEW ASSIGNMENTS & EVALUATIONS ---
  getInterviewAssignments() {
    return getStored(STORAGE_KEYS.HR_ASSIGNMENTS, MOCK_INTERVIEW_ASSIGNMENTS);
  }

  getInterviewEvaluations() {
    return getStored(STORAGE_KEYS.HR_EVALS, MOCK_INTERVIEW_EVALUATIONS);
  }

  assignCandidateToHR({ studentId, hrIds }) {
    // Check if student is qualified for Round 2!
    const quals = this.getQualifications();
    const qual = quals.find(q => q.studentId === studentId);
    if (!qual || qual.status !== 'qualified') {
      throw new Error('Strict eligibility check: Only candidates qualified in Round 1 can be assigned to HR interviews.');
    }

    const assignments = this.getInterviewAssignments();
    hrIds.forEach(hrId => {
      const exists = assignments.some(a => a.studentId === studentId && a.hrId === hrId);
      if (!exists) {
        assignments.push({
          id: `asgn-${studentId}-${hrId}`,
          eventId: 'evt-2026-01',
          studentId,
          hrId,
          status: 'pending',
          scheduledAt: new Date().toISOString(),
        });
      }
    });

    setStored(STORAGE_KEYS.HR_ASSIGNMENTS, assignments);
    this.logAction('HR_INTERVIEW_ASSIGNED', 'InterviewAssignment', studentId, `Assigned candidate ${studentId} to ${hrIds.length} HR interviewer(s)`);
    return assignments;
  }

  autoAssignAllRecommendedToAllHRs() {
    const quals = this.getQualifications().filter(q => q.status === 'qualified');
    const hrUsers = this.getUsers().filter(u => u.role === 'hr');
    const assignments = this.getInterviewAssignments();
    let count = 0;

    quals.forEach(q => {
      hrUsers.forEach(hr => {
        const exists = assignments.some(a => a.studentId === q.studentId && a.hrId === hr.id);
        if (!exists) {
          assignments.push({
            id: `asgn-${q.studentId}-${hr.id}`,
            eventId: 'evt-2026-01',
            studentId: q.studentId,
            hrId: hr.id,
            status: 'pending',
            scheduledAt: new Date().toISOString(),
          });
          count++;
        }
      });
    });

    setStored(STORAGE_KEYS.HR_ASSIGNMENTS, assignments);
    this.logAction('HR_AUTO_ASSIGNED', 'InterviewAssignment', 'all', `Auto-assigned ${quals.length} qualified candidate(s) to ${hrUsers.length} HR interviewer(s)`);
    return count;
  }

  saveInterviewEvaluation(evalData) {
    const { studentId, hrId, criterionScores, remarks, strengths, improvementAreas, recommendation, status = 'submitted' } = evalData;

    // Verify student is qualified / recommended for Round 2
    const quals = this.getQualifications();
    let qual = quals.find(q => q.studentId === studentId);
    const recs = this.getGDRecommendations();
    const isRecommended = recs.some(r => r.studentIds && r.studentIds.includes(studentId));

    if (!qual && !isRecommended) {
      throw new Error('Strict rule: Cannot evaluate a candidate who is not recommended or qualified for Round 2.');
    }
    if (!qual) {
      qual = this.addQualification({
        studentId,
        status: 'qualified',
        remarks: 'Auto-qualified based on judge recommendation.',
      });
    } else if (qual.status !== 'qualified') {
      qual.status = 'qualified';
      setStored(STORAGE_KEYS.QUALIFICATIONS, quals);
    }

    // Validate 5 criteria (0-10) and calculate authoritative total out of 50
    let total = 0;
    const validatedScores = {};
    DEFAULT_HR_CRITERIA.forEach(crit => {
      const score = Number(criterionScores[crit.id]) || 0;
      if (score < 0 || score > crit.maxMarks) {
        throw new Error(`Score for ${crit.name} must be between 0 and ${crit.maxMarks}`);
      }
      validatedScores[crit.id] = score;
      total += score;
    });

    if (status === 'submitted' && (!remarks || remarks.trim().length === 0)) {
      throw new Error('Interview remarks are mandatory before submitting evaluation.');
    }

    const evals = this.getInterviewEvaluations();
    const existingIdx = evals.findIndex(e => e.studentId === studentId && e.hrId === hrId);

    const evalRecord = {
      id: existingIdx >= 0 ? evals[existingIdx].id : `hreval-${studentId}-${hrId}`,
      eventId: 'evt-2026-01',
      studentId,
      hrId,
      criterionScores: validatedScores,
      totalScore: total,
      percentage: (total / 50) * 100,
      strengths: strengths || '',
      improvementAreas: improvementAreas || '',
      remarks: remarks ? remarks.trim() : '',
      recommendation: recommendation || 'Recommended',
      status,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      evals[existingIdx] = evalRecord;
    } else {
      evals.push(evalRecord);
    }
    setStored(STORAGE_KEYS.HR_EVALS, evals);

    // Update assignment status
    const assignments = this.getInterviewAssignments();
    const asgn = assignments.find(a => a.studentId === studentId && a.hrId === hrId);
    if (asgn) {
      asgn.status = 'completed';
      setStored(STORAGE_KEYS.HR_ASSIGNMENTS, assignments);
    }

    this.logAction('HR_EVALUATION_SAVED', 'InterviewEvaluation', evalRecord.id, `HR evaluation recorded for student ${studentId}: Score ${total}/50`);
    return evalRecord;
  }

  // --- FINAL SCORING & LEADERBOARD (40% GD + 60% HR) ---
  getFinalResults() {
    return getStored(STORAGE_KEYS.FINAL_RESULTS, MOCK_FINAL_RESULTS);
  }

  recalculateFinalScores({ gdWeight = 40, hrWeight = 60, workflow = 'workflow_b' }) {
    if (gdWeight + hrWeight !== 100) {
      throw new Error(`Weights must sum to 100%. Provided: GD ${gdWeight}% + HR ${hrWeight}% = ${gdWeight + hrWeight}%`);
    }

    const quals = this.getQualifications().filter(q => q.status === 'qualified');
    const gdEvals = this.getGDEvaluations();
    const hrEvals = this.getInterviewEvaluations();
    const groups = this.getGroups();

    const results = [];

    quals.forEach(qual => {
      const studentId = qual.studentId;
      const group = groups.find(g => g.studentIds.includes(studentId));
      const sGDEvals = gdEvals.filter(e => e.studentId === studentId && e.status === 'submitted');
      const sHREvals = hrEvals.filter(e => e.studentId === studentId && e.status === 'submitted');

      if (sGDEvals.length === 0 || sHREvals.length === 0) return;

      const gdScore = sGDEvals[0].totalScore;
      const gdPercentage = (gdScore / 60) * 100;

      let hrScore = 0;
      let hrPercentage = 0;
      let hr1Score = null;
      let hr2Score = null;

      const hr1Eval = sHREvals.find(e => e.hrId === 'user-hr-1');
      const hr2Eval = sHREvals.find(e => e.hrId === 'user-hr-2');

      if (hr1Eval) hr1Score = hr1Eval.totalScore;
      if (hr2Eval) hr2Score = hr2Eval.totalScore;

      if (workflow === 'workflow_b' && hr1Eval && hr2Eval) {
        // Average of both normalized percentages
        const p1 = (hr1Eval.totalScore / 50) * 100;
        const p2 = (hr2Eval.totalScore / 50) * 100;
        hrPercentage = (p1 + p2) / 2;
        hrScore = (hr1Eval.totalScore + hr2Eval.totalScore) / 2;
      } else {
        // Use available evaluation
        const singleEval = sHREvals[0];
        hrScore = singleEval.totalScore;
        hrPercentage = (singleEval.totalScore / 50) * 100;
      }

      const finalScore = Math.round(((gdPercentage * (gdWeight / 100)) + (hrPercentage * (hrWeight / 100))) * 10) / 10;

      results.push({
        id: `res-${studentId}`,
        eventId: 'evt-2026-01',
        studentId,
        groupId: group ? group.id : '',
        panelId: group ? group.panelId : '',
        gdScore,
        gdPercentage: Math.round(gdPercentage * 10) / 10,
        hr1Score,
        hr2Score,
        hrScore: Math.round(hrScore * 10) / 10,
        hrPercentage: Math.round(hrPercentage * 10) / 10,
        finalScore,
        selectionStatus: 'pending',
        scoringConfigSnapshot: { gdWeight, hrWeight },
        publishedAt: null,
      });
    });

    // Rank with tie-breakers: Final Score -> HR % -> GD %
    results.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.hrPercentage !== a.hrPercentage) return b.hrPercentage - a.hrPercentage;
      return b.gdPercentage - a.gdPercentage;
    });

    results.forEach((res, idx) => {
      res.rank = idx + 1;
      res.selectionStatus = idx < 12 ? 'selected' : (idx < 20 ? 'waitlisted' : 'not_selected');
    });

    setStored(STORAGE_KEYS.FINAL_RESULTS, results);
    this.logAction('FINAL_SCORES_RECALCULATED', 'FinalResult', 'all', `Recalculated rankings with weights: GD ${gdWeight}%, HR ${hrWeight}%`);
    return results;
  }

  publishFinalResults() {
    const results = this.getFinalResults();
    const publishedAt = new Date().toISOString();
    results.forEach(r => {
      r.publishedAt = publishedAt;
    });
    setStored(STORAGE_KEYS.FINAL_RESULTS, results);

    const event = this.getEvent();
    event.resultsPublished = true;
    event.status = 'published';
    setStored(STORAGE_KEYS.EVENT, event);

    this.logAction('RESULTS_PUBLISHED', 'Event', event.id, `Administrator published the official Final Placement Drive Leaderboard.`);
    return results;
  }

  deleteInterviewEvaluation(id) {
    const evals = this.getInterviewEvaluations();
    const index = evals.findIndex(e => e.id === id || e._id === id);
    if (index === -1) throw new Error('Interview evaluation not found');
    const removed = evals.splice(index, 1)[0];
    setStored(STORAGE_KEYS.HR_EVALS, evals);
    this.logAction('INTERVIEW_EVALUATION_DELETED', 'InterviewEvaluation', id, `Deleted interview evaluation for student ${removed.studentId}`);
    return removed;
  }

  saveFinalResult(resultData) {
    const results = this.getFinalResults();
    const existingIdx = results.findIndex(r => r.studentId === resultData.studentId);
    const record = {
      ...resultData,
      id: resultData.id || `res-${Date.now()}`,
      eventId: 'evt-2026-01',
      updatedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) results[existingIdx] = record;
    else results.unshift(record);
    setStored(STORAGE_KEYS.FINAL_RESULTS, results);
    this.logAction('FINAL_RESULT_SAVED', 'FinalResult', record.id, `Saved final result entry for student ${record.studentId}`);
    return record;
  }

  deleteFinalResult(id) {
    const results = this.getFinalResults();
    const index = results.findIndex(r => r.id === id || r.studentId === id);
    if (index === -1) throw new Error('Final result record not found');
    const removed = results.splice(index, 1)[0];
    setStored(STORAGE_KEYS.FINAL_RESULTS, results);
    this.logAction('FINAL_RESULT_DELETED', 'FinalResult', id, `Deleted final result entry for student ${removed.studentId}`);
    return removed;
  }
}

export const demoService = new DemoService();
export default demoService;
