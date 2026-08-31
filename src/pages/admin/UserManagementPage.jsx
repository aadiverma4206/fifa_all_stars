import React, { useState } from 'react';
import { Search, Shield, UserCheck, Lock, Unlock, Eye, HelpCircle, Plus, Building2, UserPlus, Phone, CreditCard, History } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { validateName, validateEmail, validatePassword, validatePhone, validateNonEmpty } from '../../utils/validationUtils';
import toast from 'react-hot-toast';

export const UserManagementPage = () => {
  const { usersList, toggleUserStatus, changeUserRole, createClubManager } = useAuthStore();
  const { clubs } = useDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Confirmation Modal States
  const [roleConfirmTarget, setRoleConfirmTarget] = useState(null); // { user, newRole }
  const [blockConfirmTarget, setBlockConfirmTarget] = useState(null); // user

  // Add Club Manager Modal State
  const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState(false);
  const [mgrName, setMgrName] = useState('');
  const [mgrEmail, setMgrEmail] = useState('');
  const [mgrPhone, setMgrPhone] = useState('');
  const [mgrPassword, setMgrPassword] = useState('Manager@123');
  const [mgrClubId, setMgrClubId] = useState(clubs[0]?.id || '');
  const [mgrCity, setMgrCity] = useState('Raipur');

  const filteredUsers = usersList.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = u.name?.toLowerCase()?.includes(searchLower);
    const emailMatch = u.email?.toLowerCase()?.includes(searchLower);
    const cityMatch = u.city?.toLowerCase()?.includes(searchLower);
    const matchesSearch = nameMatch || emailMatch || cityMatch;

    if (roleFilter === 'BLOCKED') return matchesSearch && u.status === 'SUSPENDED';
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleRoleSelectChange = (user, newRole) => {
    if (user.role === newRole) return;
    setRoleConfirmTarget({ user, newRole });
  };

  const handleConfirmRoleChange = () => {
    if (!roleConfirmTarget) return;
    const { user, newRole } = roleConfirmTarget;
    changeUserRole(user.id, newRole);
    toast.success(`Role for ${user.name} changed to ${newRole}`);
    setRoleConfirmTarget(null);
  };

  const handleConfirmBlockToggle = () => {
    if (!blockConfirmTarget) return;
    const isBlocking = blockConfirmTarget.status !== 'SUSPENDED';
    toggleUserStatus(blockConfirmTarget.id);
    toast.success(`User ${blockConfirmTarget.name} ${isBlocking ? 'BLOCKED & SUSPENDED' : 'UNBLOCKED'}`);
    setBlockConfirmTarget(null);
  };

  const handleCreateManagerSubmit = (e) => {
    e.preventDefault();
    const nameCheck = validateName(mgrName, 'Manager Name');
    if (!nameCheck.isValid) {
      toast.error(nameCheck.message);
      return;
    }

    const emailCheck = validateEmail(mgrEmail);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.message);
      return;
    }

    const phoneCheck = validatePhone(mgrPhone);
    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.message);
      return;
    }

    const passCheck = validatePassword(mgrPassword, 6);
    if (!passCheck.isValid) {
      toast.error(passCheck.message);
      return;
    }

    const res = createClubManager({
      name: mgrName.trim(),
      email: mgrEmail.trim(),
      phone: mgrPhone.trim(),
      password: mgrPassword,
      clubId: mgrClubId,
      city: mgrCity
    });

    if (res.success) {
      setIsAddManagerModalOpen(false);
      setMgrName('');
      setMgrEmail('');
      setMgrPhone('');
      setMgrPassword('Manager@123');
    }
  };

  const availableRoles = ['PLAYER', 'CLUB_MANAGER', 'SUPER_ADMIN'];

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            User Management & Access Control
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Manage system users, block/unblock accounts, assign Club Manager credentials, and adjust permissions with confirmation
          </p>
        </div>

        {/* Super Admin Action: Create Club Manager */}
        <Button
          variant="primary"
          size="md"
          icon={UserPlus}
          onClick={() => setIsAddManagerModalOpen(true)}
        >
          Add Club Manager
        </Button>
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
          {['all', 'PLAYER', 'CLUB_MANAGER', 'SUPER_ADMIN', 'BLOCKED'].map((rl) => (
            <button
              key={rl}
              onClick={() => setRoleFilter(rl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all uppercase whitespace-nowrap ${
                roleFilter === rl
                  ? rl === 'BLOCKED' ? 'bg-rose-500 text-white font-black' : 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {rl === 'all' ? 'All Users' : rl === 'BLOCKED' ? '🔴 Blocked Users' : rl}
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
                          <span className="text-slate-400 text-[11px] block">{user.email} • {user.phone || 'No phone'} • {user.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown with Confirmation Trigger */}
                    <td className="p-4">
                      {user.isOwner ? (
                        <span className="text-amber-500 font-black text-xs uppercase cursor-not-allowed" title="Platform Owner role cannot be changed">
                          SUPER_ADMIN (Owner)
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleSelectChange(user, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-xs text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-amber-500"
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
                        {isSuspended ? '🔴 BLOCKED' : '🟢 ACTIVE'}
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

                      {/* Block / Unblock Button with Owner Protection */}
                      {user.isOwner ? (
                        <div className="inline-block relative group">
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-black cursor-not-allowed"
                          >
                            Protected
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setBlockConfirmTarget(user)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            isSuspended
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                          }`}
                        >
                          {isSuspended ? '🔓 Unblock User' : '🚫 Block User'}
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

      {/* ═══ ROLE CHANGE CONFIRMATION MODAL ═══ */}
      <Modal isOpen={!!roleConfirmTarget} onClose={() => setRoleConfirmTarget(null)} title="⚠️ Confirm User Role Change" maxWidth="max-w-md">
        {roleConfirmTarget && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-2">
              <div className="flex items-center space-x-2 font-black text-sm">
                <Shield className="w-5 h-5 text-amber-500" />
                <span>Security Access Level Alteration</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Are you sure you want to change the role of <strong>"{roleConfirmTarget.user.name}"</strong>?
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-bold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Role:</span>
                <Badge variant="blue" size="sm">{roleConfirmTarget.user.role}</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">New Target Role:</span>
                <Badge variant="gold" size="sm">➡️ {roleConfirmTarget.newRole}</Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleConfirmTarget(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-all"
              >
                ✅ Confirm Role Change
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ USER BLOCK / UNBLOCK CONFIRMATION MODAL ═══ */}
      <Modal isOpen={!!blockConfirmTarget} onClose={() => setBlockConfirmTarget(null)} title={blockConfirmTarget?.status === 'SUSPENDED' ? '🔓 Confirm User Unblock' : '⛔ Confirm User Suspension'} maxWidth="max-w-md">
        {blockConfirmTarget && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl ${blockConfirmTarget.status === 'SUSPENDED' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'} space-y-2`}>
              <div className="flex items-center space-x-2 font-black text-sm">
                <Lock className="w-5 h-5" />
                <span>{blockConfirmTarget.status === 'SUSPENDED' ? 'Restore User Account Access' : 'Restrict Account Access'}</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {blockConfirmTarget.status === 'SUSPENDED'
                  ? `Are you sure you want to UNBLOCK "${blockConfirmTarget.name}"? They will regain full platform access.`
                  : `Are you sure you want to BLOCK & SUSPEND "${blockConfirmTarget.name}"? Blocked users cannot log in or participate in games.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-bold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">User Email:</span>
                <span className="text-slate-900 dark:text-white">{blockConfirmTarget.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Status:</span>
                <Badge variant={blockConfirmTarget.status === 'SUSPENDED' ? 'danger' : 'emerald'} size="sm">
                  {blockConfirmTarget.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBlockConfirmTarget(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlockToggle}
                className={`flex-1 py-3 rounded-xl text-white text-xs font-black shadow-md transition-all ${
                  blockConfirmTarget.status === 'SUSPENDED'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {blockConfirmTarget.status === 'SUSPENDED' ? '🔓 Confirm Unblock' : '🚫 Confirm Block'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE CLUB MANAGER MODAL (SUPER ADMIN ONLY) */}
      <Modal isOpen={isAddManagerModalOpen} onClose={() => setIsAddManagerModalOpen(false)} title="Create & Assign Club Manager">
        <form onSubmit={handleCreateManagerSubmit} className="space-y-4 text-xs font-bold">
          
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 space-y-1">
            <span className="font-black block text-xs">🛡️ Super Admin Creation Policy</span>
            <p className="text-[11px] font-semibold">
              Club Managers cannot self-register publicly. As a Super Admin, you are initializing a verified Club Manager account and assigning them to a pitch/club venue.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Rajesh Sharma"
              value={mgrName}
              onChange={(e) => setMgrName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="manager@fifaallstars.com"
                value={mgrEmail}
                onChange={(e) => setMgrEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={mgrPhone}
                onChange={(e) => setMgrPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Password *</label>
              <input
                type="text"
                value={mgrPassword}
                onChange={(e) => setMgrPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Assign to Club *</label>
              <select
                value={mgrClubId}
                onChange={(e) => setMgrClubId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddManagerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create & Assign Manager
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Profile View Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="User Profile & History Details">
        {selectedUser && (
          <div className="space-y-4 text-xs font-bold">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Avatar src={selectedUser.profileImageUrl || selectedUser.avatar} name={selectedUser.name} size="lg" />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <Badge variant={selectedUser.role === 'SUPER_ADMIN' ? 'gold' : selectedUser.role === 'CLUB_MANAGER' ? 'blue' : 'emerald'} size="sm">
                    {selectedUser.role}
                  </Badge>
                </div>
                <p className="text-slate-400">{selectedUser.email} • {selectedUser.phone || 'No phone'}</p>
                <p className="text-slate-500 mt-1">City: {selectedUser.city} • Joined: {selectedUser.joinedDate || '2024'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Elo Rating</span>
                <span className="text-xl font-black text-amber-500">{selectedUser.eloRating || 1500} Elo</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Wallet Balance</span>
                <span className="text-xl font-black text-sport-500">₹{selectedUser.walletBalance?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-2 pt-2">
              <span className="text-slate-400 block text-[10px] uppercase flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment & Wallet Transaction History</span>
              </span>
              {selectedUser.paymentHistory && selectedUser.paymentHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedUser.paymentHistory.map((tx, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">{tx.description || tx.type}</span>
                        <span className="text-slate-400 block text-[10px]">{tx.date}</span>
                      </div>
                      <span className="font-black text-emerald-500">₹{tx.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No transactions recorded yet.</p>
              )}
            </div>

            {/* Game History */}
            <div className="space-y-2 pt-2">
              <span className="text-slate-400 block text-[10px] uppercase flex items-center space-x-1">
                <History className="w-3.5 h-3.5" />
                <span>Match Gameplay History</span>
              </span>
              {selectedUser.gameHistory && selectedUser.gameHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedUser.gameHistory.map((g, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white">{g.title}</span>
                        <span className="text-slate-400 block text-[10px]">{g.date}</span>
                      </div>
                      <Badge variant="blue" size="sm">{g.score || 'Completed'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No matches played yet.</p>
              )}
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
