import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const DisputesPage = () => {
  const { disputes, resolveDispute } = useDataStore();

  const handleResolve = (id) => {
    resolveDispute(id);
    toast.success(`Dispute ${id} marked as resolved!`);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <AlertTriangle className="w-8 h-8 text-cyan-500" />
          <span>Match Disputes & Complaints</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review player match complaints, score disputes, and code-of-conduct violations
        </p>
      </div>

      <div className="space-y-3">
        {disputes.map(d => (
          <div key={d.id} className="glass-card p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant={d.status === 'open' ? 'danger' : 'emerald'} size="sm">
                  {d.status.toUpperCase()}
                </Badge>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Reported by: {d.reportedBy}</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Against: <span className="font-semibold text-slate-900 dark:text-white">{d.against}</span></p>
              <p className="text-xs text-slate-400 italic">"{d.reason}"</p>
            </div>

            {d.status === 'open' && (
              <Button variant="primary" size="sm" icon={CheckCircle} onClick={() => handleResolve(d.id)}>
                Resolve Dispute
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisputesPage;
