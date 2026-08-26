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
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Super Admin Live Audit Logs
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Read-only, reverse-chronological session history recording role modifications, refund approvals, venue approvals, and dispute overrides
        </p>
      </div>

      <div className="footy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Name</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Component</th>
                <th className="p-4">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-4 font-black text-amber-500 whitespace-nowrap">
                    {log.adminName}
                  </td>
                  <td className="p-4">
                    <Badge variant="blue" size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                    {log.target}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
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
