import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative rounded-lg">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
