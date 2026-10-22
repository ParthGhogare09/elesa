import { Menu, ShieldCheck, User, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import demoService from '../../services/demoService';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function Header({ onMenuClick }) {
  const { currentUser, role, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to the default 100 students, main panel, and sample evaluations?')) {
      demoService.resetToDefaults();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = {
    admin: 'Administrator',
    judge: 'GD Judge',
    hr: 'HR Interviewer',
  };

  const roleColors = {
    admin: 'bg-blue-50 text-blue-700 border-blue-200',
    judge: 'bg-purple-50 text-purple-700 border-purple-200',
    hr: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger + Active Event */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-700">Annual Placement Drive 2026</span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">Round 1 (GD) &amp; Round 2 (HR)</span>
        </div>
      </div>

      {/* Right side: Session Profile & Explicit Logout (No in-header role switcher) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Demo Data */}
        {isDemoMode && (
          <button
            onClick={handleResetData}
            title="Reset mock data to pristine state"
            className="text-[11px] text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>
        )}

        {/* Current User Session Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {currentUser?.avatar || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              {currentUser?.name || 'User'}
            </span>
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleColors[role] || 'bg-slate-50 text-slate-600'}`}>
              {roleLabels[role] || role}
            </span>
          </div>
        </div>

        {/* Explicit Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out of current account"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/80 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
