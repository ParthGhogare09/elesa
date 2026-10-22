import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  Layers,
  Award,
  ClipboardCheck,
  CheckCircle2,
  UserCheck,
  UserPlus,
  FileText,
  Trophy,
  Send,
  BarChart3,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, role, logout } = useAuth();
  const location = useLocation();

  const adminNav = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Student Directory', to: '/admin/students', icon: Users, badge: '100' },
    { label: 'GD Panels', to: '/admin/panels', icon: Grid3X3, badge: '4 Panels' },
    { label: 'Group Allocation', to: '/admin/groups', icon: Layers, badge: '4-6' },
    { label: 'Judge Management', to: '/admin/judges', icon: Award },
    { label: 'HR Interviewers', to: '/admin/hr', icon: UserPlus },
    { label: 'GD Marks & Review', to: '/admin/gd-evaluations', icon: ClipboardCheck },
    { label: 'Round 1 Qualification', to: '/admin/qualification', icon: CheckCircle2, highlight: true },
    { label: 'HR Interviews', to: '/admin/interviews', icon: UserCheck },
    { label: 'Interview Results', to: '/admin/interview-results', icon: FileText },
    { label: 'Final Leaderboard', to: '/admin/leaderboard', icon: Trophy, highlight: true },
    { label: 'Publish Results', to: '/admin/results', icon: Send },
    { label: 'Reports & Exports', to: '/admin/reports', icon: BarChart3 },
  ];

  const judgeNav = [
    { label: 'Judge Dashboard', to: '/judge/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Groups', to: '/judge/groups', icon: Layers },
  ];

  const hrNav = [
    { label: 'HR Dashboard', to: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'Recommended Candidates', to: '/hr/candidates', icon: UserCheck },
    { label: 'Evaluation History', to: '/hr/history', icon: FileText },
  ];

  let currentNav = adminNav;
  if (role === 'judge') currentNav = judgeNav;
  else if (role === 'hr') currentNav = hrNav;

  const roleLabels = {
    admin: { label: 'Administrator', variant: 'blue' },
    judge: { label: 'GD Judge', variant: 'purple' },
    hr: { label: 'HR Interviewer', variant: 'success' },
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight">Place<span className="text-blue-600">Pro</span></span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">EVALUATE</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium tracking-tight">EVALUATE FAIRLY. RECOGNIZE POTENTIAL.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 lg:hidden rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Current Role</span>
          <Badge variant={roleLabels[role]?.variant || 'blue'} size="sm">
            {roleLabels[role]?.label || role}
          </Badge>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {role === 'admin' ? 'Placement Admin Hub' : role === 'judge' ? 'GD Evaluation Portal' : 'HR Interview Portal'}
          </div>

          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && item.to !== '/judge/dashboard' && item.to !== '/hr/dashboard' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser?.avatar || currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser?.name || 'Evaluator'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentUser?.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
