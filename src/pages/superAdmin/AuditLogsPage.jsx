import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import AuditLogRow from '../../components/superAdmin/AuditLogRow';

export const AuditLogsPage = () => {
  const { auditLogs } = useDataStore();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <FileSpreadsheet className="w-8 h-8 text-purple-500" />
          <span>System Audit Logs</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Immutable timeline of administrative events, venue updates, and user modifications
        </p>
      </div>

      <div className="space-y-2.5">
        {auditLogs.map(log => (
          <AuditLogRow key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};

export default AuditLogsPage;
