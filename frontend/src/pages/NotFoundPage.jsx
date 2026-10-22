import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl mb-4 border border-blue-200">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The requested PlacePro Evaluate page could not be located.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" icon={Home}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
