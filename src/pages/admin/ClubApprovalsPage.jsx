import React, { useState } from 'react';
import { Building2, CheckCircle2, XCircle, UserPlus, MapPin } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export const ClubApprovalsPage = () => {
  const { clubs, approveClub, rejectClub } = useDataStore();
  const { usersList } = useAuthStore();

  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const managerUsers = usersList.filter(u => u.role === 'CLUB_MANAGER' || u.role === 'SUPER_ADMIN');

  const handleOpenApproveModal = (club) => {
    setSelectedClub(club);
    setSelectedManagerId(club.managerIds?.[0] || managerUsers[0]?.id || '');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproval = (e) => {
    e.preventDefault();
    if (!selectedClub) return;

    approveClub(selectedClub.id, selectedManagerId);
    setIsApproveModalOpen(false);
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          Venue & Club Approvals
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          Review new venue registration requests, approve/reject pitches, and assign general managers
        </p>
      </div>

      {/* Clubs List */}
      <div className="space-y-3.5">
        {clubs.map((club) => {
          const isPending = club.status === 'PENDING';
          const managerNames = usersList
            .filter(u => club.managerIds?.includes(u.id))
            .map(u => u.name)
            .join(', ') || 'Unassigned';

          return (
            <div key={club.id} className="admin-card p-5 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800">
                  <img src={club.clubImageUrl || '/src/assets/images/courts/court-1.jpg'} alt={club.name} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{club.name}</h3>
                    <Badge variant={isPending ? 'gold' : 'emerald'} size="sm" className="rounded-md">
                      {club.status || 'ACTIVE'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-sport-500" />
                    <span>{club.address} ({club.city})</span>
                  </p>

                  <p className="text-[11px] text-slate-400 font-medium">
                    Assigned Manager: <span className="text-sport-500 font-semibold">{managerNames}</span>
                  </p>
                </div>
              </div>

              {/* Approval Actions */}
              <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => handleOpenApproveModal(club)}
                  className="rounded-md text-xs font-semibold"
                >
                  Approve & Assign Manager
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={XCircle}
                  onClick={() => rejectClub(club.id, 'Venue fails minimum 3G synthetic standards')}
                  className="rounded-md text-xs font-semibold"
                >
                  Reject
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Approve & Assign Manager Modal */}
      <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve Venue & Assign Manager">
        {selectedClub && (
          <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Venue Name</label>
              <input
                type="text"
                value={selectedClub.name}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Assign Club Manager Account</label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {managerUsers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm Approval
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default ClubApprovalsPage;
