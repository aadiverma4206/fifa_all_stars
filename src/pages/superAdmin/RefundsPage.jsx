import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import RefundRow from '../../components/superAdmin/RefundRow';

export const RefundsPage = () => {
  const { refunds, processRefund } = useDataStore();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <RotateCcw className="w-8 h-8 text-rose-500" />
          <span>Refund Requests</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inspect user reservation refund claims and issue wallet credits
        </p>
      </div>

      {refunds.length > 0 ? (
        <div className="space-y-3">
          {refunds.map(r => (
            <RefundRow key={r.id} refund={r} onProcess={processRefund} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-3xl border text-slate-400 text-xs">
          No refund requests logged.
        </div>
      )}
    </div>
  );
};

export default RefundsPage;
