import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
