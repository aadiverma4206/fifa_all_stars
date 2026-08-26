import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm tracking-wide';

  const variants = {
    primary: 'bg-sport-500 hover:bg-sport-600 text-white focus:ring-sport-500 shadow-sport-glow dark:bg-sport-500 dark:hover:bg-sport-600',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-500 border border-slate-700',
    gold: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black focus:ring-amber-400 shadow-amber-500/20',
    outline: 'border-2 border-sport-500 text-sport-600 dark:text-sport-400 hover:bg-sport-500/10 focus:ring-sport-500',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400 shadow-none',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-rose-500/20'
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 font-bold',
    md: 'px-5 py-2.5 text-sm gap-2 font-bold',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-extrabold'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
