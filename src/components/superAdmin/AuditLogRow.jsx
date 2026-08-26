import React from 'react';
import { Shield, Clock, FileText } from 'lucide-react';
import Badge from '../common/Badge';

export const AuditLogRow = ({ log }) => {
  return (
    <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs">
      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 flex-shrink-0 mt-0.5">
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <Badge variant="purple" size="sm">{log.action}</Badge>
          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{log.timestamp}</span>
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-200 font-medium">{log.details}</p>
        <p className="text-[10px] text-slate-400">Triggered by: <span className="font-semibold">{log.user}</span></p>
      </div>
    </div>
  );
};

export default AuditLogRow;
