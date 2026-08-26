import React from 'react';
import clsx from 'clsx';

export const RoleSelectButton = ({ role, title, subtitle, icon: Icon, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full flex items-start p-4 rounded-2xl border text-left transition-all duration-200 focus:outline-none',
        active
          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40 text-slate-900 dark:text-white'
          : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
      )}
    >
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0',
        active ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
};

export default RoleSelectButton;
