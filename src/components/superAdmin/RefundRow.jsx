import React from 'react';
import { DollarSign, Check, X, RotateCcw } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export const RefundRow = ({ refund, onProcess }) => {
  const handleApprove = () => {
    onProcess(refund.id, true);
    toast.success(`Refund of $${refund.amount} approved for ${refund.user}`);
  };

  const handleReject = () => {
    onProcess(refund.id, false);
    toast.error(`Refund request rejected`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl glass-card gap-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
          <RotateCcw className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{refund.user}</h4>
            <Badge variant={refund.status === 'pending' ? 'gold' : refund.status === 'approved' ? 'emerald' : 'danger'} size="sm">
              {refund.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">Reason: {refund.reason} ({refund.date})</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-base font-black text-rose-600 dark:text-rose-400">${refund.amount?.toFixed(2)}</span>
        {refund.status === 'pending' && (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" icon={X} onClick={handleReject}>Reject</Button>
            <Button variant="primary" size="sm" icon={Check} onClick={handleApprove}>Approve</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundRow;
