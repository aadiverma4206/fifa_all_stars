import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseStyles = 'inline-flex items-center font-extrabold rounded-full tracking-wide transition-colors uppercase';
  
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
    emerald: 'bg-sport-500/10 text-sport-600 dark:text-sport-400 border border-sport-500/30',
    gold: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30',
    waitlist: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

export default Badge;
