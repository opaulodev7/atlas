import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold shadow-lg shadow-brand-500/20 focus:ring-brand-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 focus:ring-slate-500',
    outline: 'bg-transparent hover:bg-slate-800/80 text-slate-200 border border-slate-700 hover:border-slate-600 focus:ring-slate-500',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-slate-100 focus:ring-slate-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
