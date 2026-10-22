# PlacePro Evaluate — API Contracts Documentation

RESTful API specifications for the PlacePro Evaluate Backend API. All protected endpoints require a `Bearer <token>` HTTP header.

---

## 1. Authentication
- `POST /api/auth/login`
  - Body: `{ email, password, role }`
  - Response: `{ success: true, token, user }`
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, user }`

---

## 2. Students
- `GET /api/students`
  - Query: `?branch=...&search=...`
  - Response: `{ success: true, count, data: [Student] }`
- `GET /api/students/:id`
  - Response: `{ success: true, data: Student }`
- `POST /api/students` (Admin only)
  - Body: `{ registrationId, name, email, branch, year, contactNumber }`
  - Response: `{ success: true, data: Student }`
- `PATCH /api/students/:id` (Admin only)
  - Body: `{ name, branch, contactNumber, isActive }`
- `POST /api/students/import` (Admin only)
  - Body: `{ students: [StudentObject] }`

---

## 3. Panels
- `GET /api/panels`
  - Response: `{ success: true, data: [Panel] }`
- `PATCH /api/panels/:id` (Admin only)
  - Body: `{ name, location, assignedJudgeIds }`

---

## 4. Groups
- `GET /api/groups`
  - Query: `?panelId=...`
  - Response: `{ success: true, count, data: [Group] }`
- `GET /api/groups/:id`
  - Response: `{ success: true, data: Group }`
- `POST /api/groups` (Admin only)
  - Body: `{ groupName, studentIds, panelId, judgeIds }`
  - Validations: Enforces `4 <= studentIds.length <= 6` and no duplicate active group memberships.
- `PATCH /api/groups/:id` (Admin only)
  - Body: `{ groupName, panelId, judgeIds }`

---

## 5. GD Evaluations & Shortlists
- `GET /api/gd/judge/groups` (Judge / Admin)
  - Response: `{ success: true, count, data: [Group] }`
- `GET /api/gd/evaluations`
  - Query: `?groupId=...&judgeId=...&studentId=...`
  - Response: `{ success: true, data: [GDEvaluation] }`
- `POST /api/gd/evaluations` (Judge / Admin)
  - Body: `{ groupId, studentId, criterionScores, remarks, status }`
  - Authoritative calculation: Backend calculates `totalScore` (/60) from validated criteria (0-10).
- `POST /api/gd/groups/:groupId/recommendations` (Judge / Admin)
  - Body: `{ studentIds: [id1, id2, id3] }`
  - Strict Rule: Enforces `studentIds.length <= 3`.

---

## 6. Round 1 Qualification
- `GET /api/qualification`
  - Query: `?status=...&panelId=...`
  - Response: `{ success: true, data: [Qualification] }`
- `PATCH /api/qualification/update` (Admin only)
  - Body: `{ studentId, status, remarks }`
- `POST /api/qualification/batch-approve` (Admin only)
  - Approves all judge-recommended candidates for Round 2 HR interviews.

---

## 7. HR Interviews
- `GET /api/interviews/candidates` (HR / Admin)
  - Returns qualified candidates assigned to current interviewer.
- `POST /api/interviews/assign` (Admin only)
  - Body: `{ studentId, hrIds }`
  - Strict Rule: Validates candidate is Qualified in Round 1.
- `GET /api/interviews/evaluations`
  - Query: `?studentId=...&hrId=...`
- `POST /api/interviews/evaluations` (HR / Admin)
  - Body: `{ studentId, criterionScores, remarks, strengths, improvementAreas, recommendation, status }`
  - Authoritative calculation: Backend calculates `totalScore` (/50) from validated criteria (0-10).

---

## 8. Final Results & Leaderboard
- `GET /api/results/leaderboard`
  - Returns final ranked candidates sorted by rank.
- `POST /api/results/recalculate` (Admin only)
  - Body: `{ gdWeight, hrWeight, workflow }`
  - Equation: `Final = (GD% × gdWeight) + (HR% × hrWeight)`
- `POST /api/results/publish` (Admin only)
  - Freezes rankings and stamps publication timestamp.
