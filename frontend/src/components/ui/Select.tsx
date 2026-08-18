import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string | number; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full bg-slate-900/90 border rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors ${
          error ? 'border-rose-500/70 focus:ring-rose-500/50' : 'border-slate-800 focus:border-brand-500'
        } ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
