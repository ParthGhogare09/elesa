import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, UserCheck, ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function LoginPage() {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  // Distinct Portal Tabs
  const [activePortal, setActivePortal] = useState('admin'); // 'admin' | 'judge' | 'hr'

  const [email, setEmail] = useState('admin@placepro.demo');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePortalChange = (portal) => {
    setActivePortal(portal);
    setError('');
    if (portal === 'admin') setEmail('admin@placepro.demo');
    else if (portal === 'judge') setEmail('judge@placepro.demo');
    else if (portal === 'hr') setEmail('hr@placepro.demo');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, activePortal);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'judge') navigate('/judge/dashboard');
      else if (user.role === 'hr') navigate('/hr/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (targetId) => {
    const user = loginAs(targetId);
    if (user.role === 'admin') navigate('/admin/dashboard');
    else if (user.role === 'judge') navigate('/judge/dashboard');
    else if (user.role === 'hr') navigate('/hr/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-4">
          <span className="text-2xl font-black">P</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Place<span className="text-blue-600">Pro</span> Evaluate
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
          Group Discussion &amp; Interview Evaluation System
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Separate Role Sign-in • Evaluate Fairly. Recognize Potential.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Separate Portal Selection Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1.5 rounded-2xl mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => handlePortalChange('admin')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
              activePortal === 'admin'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalChange('judge')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
              activePortal === 'judge'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>GD Judge</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalChange('hr')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition ${
              activePortal === 'hr'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>HR Round</span>
          </button>
        </div>

        {/* Portal Login Card */}
        <div className="bg-white py-7 px-6 sm:px-8 border border-slate-200/90 rounded-2xl shadow-sm space-y-5">
          {/* Header of Active Portal */}
          <div className="border-b border-slate-100 pb-4">
            {activePortal === 'admin' && (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Administrator Sign In</h2>
                  <p className="text-xs text-slate-500">Manage panels, students, qualifications &amp; final merit list</p>
                </div>
              </div>
            )}

            {activePortal === 'judge' && (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">GD Evaluator Sign In</h2>
                  <p className="text-xs text-slate-500">Select any group and evaluate individual candidates (60 Marks Total)</p>
                </div>
              </div>
            )}

            {activePortal === 'hr' && (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">HR Interviewer Sign In</h2>
                  <p className="text-xs text-slate-500">Evaluate qualified candidates across 5 behavioral rubrics (50M)</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Select Buttons specific to this portal */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click Fast Access ({activePortal.toUpperCase()} Accounts):
            </span>

            {activePortal === 'admin' && (
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition text-left flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-blue-900">Dr. Rajesh Iyer (Dean &amp; Administrator)</p>
                  <p className="text-[11px] text-blue-600">admin@placepro.demo</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            )}

            {activePortal === 'judge' && (
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'user-judge-1', name: 'Judge 1: Prof. Alex Sharma', email: 'judge@placepro.demo' },
                  { id: 'user-judge-2', name: 'Judge 2: Prof. Priya Nair', email: 'judge2@placepro.demo' },
                  { id: 'user-judge-3', name: 'Judge 3: Dr. Rajesh Menon', email: 'judge3@placepro.demo' },
                  { id: 'user-judge-4', name: 'Judge 4: Prof. Ananya Roy', email: 'judge4@placepro.demo' },
                ].map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => handleQuickLogin(j.id)}
                    className="p-2 rounded-lg border border-purple-200 bg-purple-50/40 hover:bg-purple-100/60 transition text-left"
                  >
                    <p className="text-xs font-bold text-purple-900 truncate">{j.name}</p>
                    <p className="text-[10px] text-purple-600 truncate">{j.email}</p>
                  </button>
                ))}
              </div>
            )}

            {activePortal === 'hr' && (
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'user-hr-1', name: 'HR 1: Vikram Patel', email: 'hr@placepro.demo' },
                  { id: 'user-hr-2', name: 'HR 2: Sneha Gupta', email: 'hr2@placepro.demo' },
                ].map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleQuickLogin(h.id)}
                    className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 transition text-left"
                  >
                    <p className="text-xs font-bold text-emerald-900 truncate">{h.name}</p>
                    <p className="text-[10px] text-emerald-600 truncate">{h.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">
              Or Sign In with Email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Registered Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@placepro.demo"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              helperText="Any password accepted for demo portal accounts."
              required
            />

            <Button
              type="submit"
              variant="primary"
              className={`w-full mt-2 ${
                activePortal === 'judge'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : activePortal === 'hr'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : `Enter ${activePortal.toUpperCase()} Portal →`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
