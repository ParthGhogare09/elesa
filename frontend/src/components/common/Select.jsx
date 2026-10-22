import React from 'react';

export default function Select({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
