import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import ClubApprovalRow from '../../components/superAdmin/ClubApprovalRow';

export const ClubApprovalsPage = () => {
  const { clubs, approveClub, rejectClub } = useDataStore();
  const pendingClubs = clubs.filter(c => c.status === 'pending');

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          <span>Club Venue Approvals</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review new turf venue applications and grant official FIFA All Stars verification
        </p>
      </div>

      {pendingClubs.length > 0 ? (
        <div className="space-y-3">
          {pendingClubs.map(c => (
            <ClubApprovalRow key={c.id} club={c} onApprove={approveClub} onReject={rejectClub} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-3xl border text-slate-400 text-xs">
          No pending club venue approval applications right now. All venues are verified!
        </div>
      )}
    </div>
  );
};

export default ClubApprovalsPage;
