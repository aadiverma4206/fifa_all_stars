import React, { useState } from 'react';
import { Search, Shield, UserCheck, Lock, Unlock, Eye, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';

export const UserManagementPage = () => {
  const { usersList, toggleUserStatus, changeUserRole } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const filteredUsers = usersList.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = u.name?.toLowerCase()?.includes(searchLower);
    const emailMatch = u.email?.toLowerCase()?.includes(searchLower);
    const cityMatch = u.city?.toLowerCase()?.includes(searchLower);
    const matchesSearch = nameMatch || emailMatch || cityMatch;

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const availableRoles = ['PLAYER', 'CLUB_MANAGER', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'];

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          User Management & Role Access
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Search, view profile, manage roles (PLAYER, CLUB_MANAGER, OPS_ADMIN, FINANCE_ADMIN, SUPER_ADMIN), and suspend accounts
        </p>
      </div>

      {/* Filter Ribbon */}
      <div className="footy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'PLAYER', 'CLUB_MANAGER', 'SUPER_ADMIN'].map((rl) => (
            <button
              key={rl}
              onClick={() => setRoleFilter(rl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all uppercase whitespace-nowrap ${
                roleFilter === rl
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {rl === 'all' ? 'All Roles' : rl}
            </button>
          ))}
        </div>
      </div>

      {/* User Roster Table */}
      <div className="footy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Wallet (INR)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const isSuspended = user.status === 'SUSPENDED';

                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar src={user.profileImageUrl || user.avatar} name={user.name} size="sm" />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{user.name}</span>
                            {user.isOwner && <Badge variant="gold" size="sm">Owner</Badge>}
                          </div>
                          <span className="text-slate-400 text-[11px] block">{user.email} • {user.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="p-4">
                      {user.isOwner ? (
                        <span className="text-amber-500 font-black text-xs uppercase cursor-not-allowed" title="Platform Owner role cannot be changed">
                          SUPER_ADMIN (Owner)
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-xs text-slate-900 dark:text-white"
                        >
                          {availableRoles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <Badge variant={isSuspended ? 'danger' : 'emerald'} size="sm">
                        {user.status}
                      </Badge>
                    </td>

                    {/* Wallet Balance */}
                    <td className="p-4 font-black text-amber-500 text-sm">
                      ₹{user.walletBalance?.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => handleOpenProfile(user)}>
                        View
                      </Button>

                      {/* Suspend / Unsuspend Button with Owner Rule Protection */}
                      {user.isOwner ? (
                        <div className="inline-block relative group">
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-black cursor-not-allowed"
                          >
                            Protected
                          </button>
                          <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold shadow-xl z-50">
                            Platform Owner Super Admin account can NEVER be suspended.
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            isSuspended
                              ? 'bg-sport-500 hover:bg-sport-600 text-white'
                              : 'bg-rose-500 hover:bg-rose-600 text-white'
                          }`}
                        >
                          {isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profile View Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Full User Account Details">
        {selectedUser && (
          <div className="space-y-4 text-xs font-bold">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Avatar src={selectedUser.profileImageUrl || selectedUser.avatar} name={selectedUser.name} size="lg" />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  {selectedUser.isOwner && <Badge variant="gold" size="sm">Platform Owner</Badge>}
                </div>
                <p className="text-slate-400">{selectedUser.email}</p>
                <p className="text-slate-500 mt-1">City: {selectedUser.city} • Joined: {selectedUser.joinedDate || '2024'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Elo Rating & Tier</span>
                <span className="text-xl font-black text-amber-500">{selectedUser.eloRating || 1500} Elo</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Wallet Balance</span>
                <span className="text-xl font-black text-sport-500">₹{selectedUser.walletBalance?.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 block text-[10px] uppercase mb-1">Badges & Accomplishments</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.badges?.map(b => (
                  <Badge key={b} variant="emerald" size="sm">🏅 {b}</Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default UserManagementPage;
