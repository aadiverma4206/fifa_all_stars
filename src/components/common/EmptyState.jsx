import React from 'react';
import { Search, FolderOpen } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "There are currently no items matching your request.",
  actionLabel,
  onAction
}) => {
  return (
    <div className="footy-card p-12 text-center space-y-4 max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
        <Icon className="w-8 h-8" />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
