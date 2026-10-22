import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function UnauthorizedPage() {
  const { role, loginAs } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        Your current role does not have permission to view this module.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" onClick={() => window.history.back()} icon={ArrowLeft}>
          Go Back
        </Button>
        <Button variant="primary" onClick={() => loginAs('admin')}>
          Switch to Admin Role
        </Button>
      </div>
    </div>
  );
}
