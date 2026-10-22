# PlacePro Evaluate — Database Schema Documentation

MongoDB data models with indexes, references, and validation rules.

---

## 1. User (`users`)
Stores platform accounts and role permissions.
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (required, unique, indexed)
- `passwordHash`: String (required)
- `role`: Enum `['admin', 'judge', 'hr']` (required)
- `title`: String
- `avatar`: String
- `assignedPanels`: Array of String
- `interviewerNumber`: Number (1 or 2)
- `isActive`: Boolean (default: true)
- `createdAt`, `updatedAt`: Date

---

## 2. Student (`students`)
Stores candidate directory details.
- `_id`: ObjectId
- `registrationId`: String (required, unique, indexed)
- `name`: String (required)
- `email`: String (required, unique)
- `branch`: String (required, indexed)
- `year`: String
- `contactNumber`: String
- `isActive`: Boolean
- `createdAt`, `updatedAt`: Date

---

## 3. Event (`events`)
Main event configuration and scoring policies.
- `_id`: ObjectId
- `name`: String
- `status`: Enum `['draft', 'active', 'round1_completed', 'completed', 'published']`
- `gdScoringConfig`:
  - `criteria`: Array of `{ id, name, maxMarks, description }`
  - `totalMarks`: Number (60)
  - `maxRecommendationsPerGroup`: Number (3)
- `hrScoringConfig`:
  - `criteria`: Array of `{ id, name, maxMarks, description }`
  - `totalMarks`: Number (50)
  - `workflow`: Enum `['workflow_a', 'workflow_b']`
- `finalScoringConfig`:
  - `gdWeightPercentage`: Number (40)
  - `hrWeightPercentage`: Number (60)
  - `tieBreakingRules`: Array of String
- `publishedAt`: Date

---

## 4. Panel (`panels`)
Defines the 4 GD Panels (Panel A, B, C, D).
- `_id`: ObjectId
- `eventId`: String
- `name`: String
- `code`: String (unique)
- `location`: String
- `assignedJudgeIds`: Array of String
- `status`: String

---

## 5. Group (`groups`)
Cohorts of students allocated to panels.
- `_id`: ObjectId
- `eventId`: String
- `groupName`: String
- `groupCode`: String
- `studentIds`: Array of String (Validator: `4 <= length <= 6`)
- `panelId`: String (indexed)
- `judgeIds`: Array of String
- `evaluationStatus`: Enum `['pending', 'partially_evaluated', 'completed']`

---

## 6. GDEvaluation (`gdevaluations`)
Individual marks entered by judges during GD.
- `_id`: ObjectId
- `eventId`: String
- `groupId`: String (indexed)
- `studentId`: String (indexed)
- `judgeId`: String (indexed)
- `criterionScores`: Map of Number (0-10)
- `totalScore`: Number (calculated by backend, out of 60)
- `percentage`: Number
- `remarks`: String (required)
- `recommendation`: Boolean (default: false)
- `status`: Enum `['draft', 'submitted']`
- `submittedAt`: Date
- **Compound Unique Index**: `{ groupId: 1, studentId: 1, judgeId: 1 }`

---

## 7. GDRecommendation (`gdrecommendations`)
Advisory shortlist submitted by judges (enforces max 3).
- `_id`: ObjectId
- `groupId`: String (indexed)
- `judgeId`: String (indexed)
- `studentIds`: Array of String (Validator: `length <= 3`)
- `status`: String
- `submittedAt`: Date
- **Compound Unique Index**: `{ groupId: 1, judgeId: 1 }`

---

## 8. Qualification (`qualifications`)
Administrative decisions determining Round 2 HR eligibility.
- `_id`: ObjectId
- `studentId`: String (unique)
- `status`: Enum `['pending', 'recommended', 'qualified', 'not_qualified', 'under_review']`
- `gdScore`: Number
- `gdPercentage`: Number
- `recommendedByJudges`: Array of String
- `decisionBy`: String
- `decisionAt`: Date
- `remarks`: String

---

## 9. InterviewAssignment (`interviewassignments`)
Scheduling candidates to HR 1, HR 2, or both.
- `_id`: ObjectId
- `studentId`: String
- `hrId`: String
- `status`: Enum `['pending', 'completed']`
- `scheduledAt`: Date
- **Compound Unique Index**: `{ studentId: 1, hrId: 1 }`

---

## 10. InterviewEvaluation (`interviewevaluations`)
Interview scoring entered by HR interviewers.
- `_id`: ObjectId
- `studentId`: String
- `hrId`: String
- `criterionScores`: Map of Number (0-10)
- `totalScore`: Number (calculated by backend, out of 50)
- `percentage`: Number
- `remarks`: String (required)
- `strengths`: String
- `improvementAreas`: String
- `recommendation`: Enum `['Strongly Recommended', 'Recommended', 'On Hold', 'Not Recommended']`
- `status`: Enum `['draft', 'submitted']`
- **Compound Unique Index**: `{ studentId: 1, hrId: 1 }`

---

## 11. FinalResult (`finalresults`)
Final merit rankings and composite scores.
- `_id`: ObjectId
- `studentId`: String (unique)
- `gdScore`: Number
- `gdPercentage`: Number
- `hr1Score`: Number
- `hr2Score`: Number
- `hrScore`: Number
- `hrPercentage`: Number
- `finalScore`: Number
- `rank`: Number (indexed)
- `selectionStatus`: Enum `['selected', 'waitlisted', 'not_selected', 'pending']`
- `publishedAt`: Date

---

## 12. AuditLog (`auditlogs`)
Append-only tamper-evident verification ledger.
- `_id`: ObjectId
- `actorId`: String
- `actorName`: String
- `action`: String
- `targetType`: String
- `targetId`: String
- `details`: String
- `timestamp`: Date (indexed)
