import React from 'react';
import { FileText, Shield, Clock } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';

export const AuditLogsPage = () => {
  const { auditLogs } = useDataStore();

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          Super Admin Live Audit Logs
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          Read-only, reverse-chronological session history recording role modifications, refund approvals, venue approvals, and dispute overrides
        </p>
      </div>

      <div className="admin-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Admin Name</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target Component</th>
                <th className="p-3.5">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3.5 font-bold text-amber-500 whitespace-nowrap">
                    {log.adminName}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="blue" size="sm" className="rounded-md">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {log.target}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
