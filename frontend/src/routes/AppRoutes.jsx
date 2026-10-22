import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Public Pages
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Admin Features
import AdminDashboard from '../features/admin/dashboard/AdminDashboard';
import StudentManagement from '../features/admin/students/StudentManagement';
import PanelManagement from '../features/admin/panels/PanelManagement';
import GroupManagement from '../features/admin/groups/GroupManagement';
import JudgeManagement from '../features/admin/judges/JudgeManagement';
import GDEvaluationReview from '../features/admin/gd-evaluations/GDEvaluationReview';
import QualificationManagement from '../features/admin/qualification/QualificationManagement';
import InterviewManagement from '../features/admin/interviews/InterviewManagement';
import InterviewResults from '../features/admin/interviews/InterviewResults';
import HRManagement from '../features/admin/hr/HRManagement';
import Leaderboard from '../features/admin/leaderboard/Leaderboard';
import ResultsPublication from '../features/admin/dashboard/ResultsPublication';
import ReportsManagement from '../features/admin/reports/ReportsManagement';

// Judge Features
import JudgeDashboard from '../features/judge/dashboard/JudgeDashboard';
import GroupEvaluationWorkspace from '../features/judge/group-evaluation/GroupEvaluationWorkspace';

// HR Features
import HRDashboard from '../features/hr/dashboard/HRDashboard';
import HREvaluationWorkspace from '../features/hr/interview-evaluation/HREvaluationWorkspace';
import HREvaluationHistory from '../features/hr/evaluation-history/HREvaluationHistory';

// Protected Route Component
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { role, isAuthenticated } = useAuth();

  // Root redirect based on role
  const getHomeRedirect = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'judge') return '/judge/dashboard';
    if (role === 'hr') return '/hr/dashboard';
    return '/login';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      {/* Protected App Shell */}
      <Route element={<AppLayout />}>
        {/* Administrator Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/panels"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PanelManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GroupManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/judges"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <JudgeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gd-evaluations"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GDEvaluationReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/qualification"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <QualificationManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hr"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <HRManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/interviews"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <InterviewManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/interview-results"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <InterviewResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leaderboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'judge', 'hr']}>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ResultsPublication />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsManagement />
            </ProtectedRoute>
          }
        />

        {/* GD Judge Routes */}
        <Route
          path="/judge/dashboard"
          element={
            <ProtectedRoute allowedRoles={['judge', 'admin']}>
              <JudgeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/judge/groups"
          element={
            <ProtectedRoute allowedRoles={['judge', 'admin']}>
              <JudgeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/judge/groups/:groupId"
          element={
            <ProtectedRoute allowedRoles={['judge', 'admin']}>
              <GroupEvaluationWorkspace />
            </ProtectedRoute>
          }
        />

        {/* HR Interviewer Routes */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/candidates"
          element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview/:candidateId"
          element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <HREvaluationWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/history"
          element={
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <HREvaluationHistory />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
