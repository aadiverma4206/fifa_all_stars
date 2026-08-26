import React from 'react';
import { MapPin, Check, X, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export const ClubApprovalRow = ({ club, onApprove, onReject }) => {
  const handleApprove = () => {
    onApprove(club.id);
    toast.success(`Approved venue "${club.name}"!`);
  };

  const handleReject = () => {
    onReject(club.id);
    toast.error(`Rejected venue "${club.name}"`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl glass-card gap-4">
      <div className="flex items-center space-x-4">
        <img
          src={club.image}
          alt={club.name}
          className="w-16 h-16 rounded-xl object-cover ring-2 ring-amber-500/30"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{club.name}</h4>
            <Badge variant="gold" size="sm">PENDING REVIEW</Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span>{club.location} • Manager: {club.managerName}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="danger" size="sm" icon={X} onClick={handleReject}>
          Reject
        </Button>
        <Button variant="primary" size="sm" icon={Check} onClick={handleApprove}>
          Approve Venue
        </Button>
      </div>
    </div>
  );
};

export default ClubApprovalRow;
