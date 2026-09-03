import React, { useState, useRef } from 'react';
import { Search, Shield, UserCheck, Lock, Unlock, Eye, HelpCircle, Plus, Building2, UserPlus, Phone, CreditCard, History } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { validateName, validateEmail, validatePassword, validatePhone, validateNonEmpty, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
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

  // Loading & Concurrency Locks
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);
  const [isCreatingManager, setIsCreatingManager] = useState(false);

  const isChangingRoleRef = useRef(false);
  const isTogglingBlockRef = useRef(false);
  const isCreatingManagerRef = useRef(false);

  // Add Club Manager Modal State
  const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState(false);
  const [mgrName, setMgrName] = useState('');
  const [mgrEmail, setMgrEmail] = useState('');
  const [mgrPhone, setMgrPhone] = useState('');
  const [mgrPassword, setMgrPassword] = useState('Manager@123');
  const [mgrClubId, setMgrClubId] = useState(clubs[0]?.id || '');
  const [mgrCity, setMgrCity] = useState(clubs[0]?.city || 'Raipur');

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

  const handleConfirmRoleChange = async () => {
    if (!roleConfirmTarget || isChangingRole || isChangingRoleRef.current) return;

    if (!checkNetworkOnline()) return;

    const { user, newRole } = roleConfirmTarget;

    isChangingRoleRef.current = true;
    setIsChangingRole(true);
    try {
      changeUserRole(user.id, newRole);
      toast.success(`Updated ${user.name}'s role to ${newRole}`);
      setRoleConfirmTarget(null);
    } catch (err) {
      logActionError('handleConfirmRoleChange', err);
      toast.error(getErrorMessage(err, 'changing user role'));
    } finally {
      setIsChangingRole(false);
      setTimeout(() => {
        isChangingRoleRef.current = false;
      }, 400);
    }
  };

  const handleOpenBlockConfirm = (user) => {
    setBlockConfirmTarget(user);
  };

  const handleConfirmToggleBlock = async () => {
    if (!blockConfirmTarget || isTogglingBlock || isTogglingBlockRef.current) return;

    if (!checkNetworkOnline()) return;

    const user = blockConfirmTarget;

    isTogglingBlockRef.current = true;
    setIsTogglingBlock(true);
    try {
      toggleUserStatus(user.id);
      toast.success(`${user.name} has been ${user.status === 'ACTIVE' ? 'blocked' : 'unblocked'}`);
      setBlockConfirmTarget(null);
    } catch (err) {
      logActionError('handleConfirmToggleBlock', err);
      toast.error(getErrorMessage(err, 'updating user account status'));
    } finally {
      setIsTogglingBlock(false);
      setTimeout(() => {
        isTogglingBlockRef.current = false;
      }, 400);
    }
  };

  const handleCreateManagerSubmit = async (e) => {
    e.preventDefault();
    if (isCreatingManager || isCreatingManagerRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateName(mgrName, 'Manager Name'), field: 'mgrName' },
      { check: () => validateEmail(mgrEmail), field: 'mgrEmail' },
      { check: () => validatePhone(mgrPhone), field: 'mgrPhone' },
      { check: () => validatePassword(mgrPassword, 6), field: 'mgrPassword' }
    ]);

    if (!isValid) return;

    isCreatingManagerRef.current = true;
    setIsCreatingManager(true);
    try {
      const res = createClubManager({
        name: mgrName.trim(),
        email: mgrEmail.trim(),
        phone: mgrPhone.trim(),
        password: mgrPassword,
        clubId: mgrClubId,
        city: mgrCity
      });

      if (res && res.success) {
        setIsAddManagerModalOpen(false);
        setMgrName('');
        setMgrEmail('');
        setMgrPhone('');
        setMgrPassword('Manager@123');
      } else if (res && !res.success) {
        toast.error(res.error || 'Failed to create manager account.');
      }
    } catch (err) {
      logActionError('handleCreateManagerSubmit', err);
      toast.error(getErrorMessage(err, 'creating manager account'));
    } finally {
      setIsCreatingManager(false);
      setTimeout(() => {
        isCreatingManagerRef.current = false;
      }, 400);
    }
  };

  const availableRoles = ['PLAYER', 'CLUB_MANAGER', 'SUPER_ADMIN'];

  return (
    <div className="space-y-6 py-6 max-w-[1750px] w-full mx-auto px-4 sm:px-8 lg:px-10 overflow-x-hidden">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-sport-500" />
            <span>User Management & Access Control</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage platform user accounts, role privileges, access restrictions, and wallet balance ledger.
          </p>
        </div>

        {/* Super Admin Action: Create Club Manager */}
        <Button
          variant="primary"
          size="md"
          icon={UserPlus}
          onClick={() => setIsAddManagerModalOpen(true)}
          className="rounded-md font-bold text-xs uppercase px-4 py-2.5 shadow-sm transition-all"
        >
          Add Club Manager
        </Button>
      </div>

      {/* WORKSPACE CONTROL TOOLBAR */}
      <div className="admin-card p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Search Field */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by name, email, phone or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
          />
        </div>

        {/* Segmented Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'PLAYER', label: 'Player' },
            { id: 'CLUB_MANAGER', label: 'Club Manager' },
            { id: 'SUPER_ADMIN', label: 'Super Admin' },
            { id: 'BLOCKED', label: '🔴 Blocked' }
          ].map((rl) => (
            <button
              key={rl.id}
              onClick={() => setRoleFilter(rl.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
                roleFilter === rl.id
                  ? rl.id === 'BLOCKED' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {rl.label}
            </button>
          ))}
        </div>
      </div>

      {/* USER DATA WORKSPACE TABLE */}
      <div className="admin-card rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 sm:px-5">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Wallet (INR)</th>
                <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSuspended = user.status === 'SUSPENDED';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150">
                      
                      {/* USER COLUMN */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center space-x-3">
                          <Avatar src={user.profileImageUrl || user.avatar} name={user.name} size="sm" className="rounded-md" />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{user.name}</span>
                              {user.isOwner && <Badge variant="gold" size="sm" className="rounded-md text-[9px]">Owner</Badge>}
                            </div>
                            <span className="text-[11px] font-medium text-slate-400 truncate block mt-0.5">
                              {user.email} • {user.phone || 'No phone'} • {user.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ROLE COLUMN */}
                      <td className="py-3.5 px-4">
                        {user.isOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 cursor-not-allowed" title="Platform Owner role cannot be changed">
                            <Shield className="w-3 h-3 text-amber-500" />
                            SUPER_ADMIN (Owner)
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleSelectChange(user, e.target.value)}
                            className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-sport-500 transition-all"
                          >
                            {availableRoles.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* WALLET COLUMN */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900 dark:text-white">
                        ₹{user.walletBalance?.toFixed(2)}
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="py-3.5 px-4 sm:px-5 text-right space-x-2">
                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => handleOpenProfile(user)} className="rounded-md text-xs font-semibold px-2.5 py-1 border border-slate-200 dark:border-slate-700">
                          View
                        </Button>

                        {/* Block / Unblock Button with Owner Protection */}
                        {user.isOwner ? (
                          <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => setBlockConfirmTarget(user)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {isSuspended ? '🔓 Unblock User' : '🚫 Block User'}
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                    No matching users found for your current filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ ROLE CHANGE CONFIRMATION MODAL ═══ */}
      <Modal isOpen={!!roleConfirmTarget} onClose={() => setRoleConfirmTarget(null)} title="⚠️ Confirm User Role Change" maxWidth="max-w-md">
        {roleConfirmTarget && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Security Access Level Alteration</span>
              </div>
              <p className="text-xs font-medium leading-relaxed">
                Are you sure you want to change the role of <strong>"{roleConfirmTarget.user.name}"</strong>?
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Role:</span>
                <Badge variant="blue" size="sm" className="rounded-md">{roleConfirmTarget.user.role}</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">New Target Role:</span>
                <Badge variant="gold" size="sm" className="rounded-md">➡️ {roleConfirmTarget.newRole}</Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isChangingRole}
                onClick={handleConfirmRoleChange}
                className="flex-1 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingRole ? (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span className="animate-spin text-xs">⏳</span> Updating Role...
                  </span>
                ) : (
                  '✅ Confirm Role Change'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ USER BLOCK / UNBLOCK CONFIRMATION MODAL ═══ */}
      <Modal isOpen={!!blockConfirmTarget} onClose={() => setBlockConfirmTarget(null)} title={blockConfirmTarget?.status === 'SUSPENDED' ? '🔓 Confirm User Unblock' : '⛔ Confirm User Suspension'} maxWidth="max-w-md">
        {blockConfirmTarget && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${blockConfirmTarget.status === 'SUSPENDED' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'} space-y-2`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>{blockConfirmTarget.status === 'SUSPENDED' ? 'Restore User Account Access' : 'Restrict Account Access'}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed">
                {blockConfirmTarget.status === 'SUSPENDED'
                  ? `Are you sure you want to UNBLOCK "${blockConfirmTarget.name}"? They will regain full platform access.`
                  : `Are you sure you want to BLOCK & SUSPEND "${blockConfirmTarget.name}"? Blocked users cannot log in or participate in games.`}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">User Email:</span>
                <span className="text-slate-900 dark:text-white">{blockConfirmTarget.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Status:</span>
                <Badge variant={blockConfirmTarget.status === 'SUSPENDED' ? 'danger' : 'emerald'} size="sm" className="rounded-md">
                  {blockConfirmTarget.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBlockConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTogglingBlock}
                onClick={handleConfirmToggleBlock}
                className={`flex-1 py-2.5 rounded-md text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  blockConfirmTarget.status === 'SUSPENDED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isTogglingBlock ? (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span className="animate-spin text-xs">⏳</span> Processing...
                  </span>
                ) : blockConfirmTarget.status === 'SUSPENDED' ? (
                  '🔓 Confirm Unblock'
                ) : (
                  '🚫 Confirm Block'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE CLUB MANAGER MODAL (SUPER ADMIN ONLY) */}
      <Modal isOpen={isAddManagerModalOpen} onClose={() => setIsAddManagerModalOpen(false)} title="Create & Assign Club Manager">
        <form onSubmit={handleCreateManagerSubmit} className="space-y-4 text-xs font-semibold">
          
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 space-y-1">
            <span className="font-bold block text-xs">🛡️ Super Admin Creation Policy</span>
            <p className="text-[11px] font-medium">
              Club Managers cannot self-register publicly. As a Super Admin, you are initializing a verified Club Manager account and assigning them to a pitch/club venue.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              name="mgrName"
              type="text"
              placeholder="e.g. Rajesh Sharma"
              value={mgrName}
              onChange={(e) => setMgrName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                name="mgrEmail"
                type="email"
                placeholder="manager@fifaallstars.com"
                value={mgrEmail}
                onChange={(e) => setMgrEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                name="mgrPhone"
                type="tel"
                placeholder="+91 98765 43210"
                value={mgrPhone}
                onChange={(e) => setMgrPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Password *</label>
              <input
                name="mgrPassword"
                type="text"
                value={mgrPassword}
                onChange={(e) => setMgrPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Assign to Club *</label>
              <select
                name="mgrClubId"
                value={mgrClubId}
                onChange={(e) => setMgrClubId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
              >
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddManagerModalOpen(false)} className="rounded-md font-semibold text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isCreatingManager}
              disabled={isCreatingManager}
              className="rounded-md font-bold text-xs uppercase"
            >
              Create & Assign Manager
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Profile View Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="User Profile & History Details">
        {selectedUser && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Avatar src={selectedUser.profileImageUrl || selectedUser.avatar} name={selectedUser.name} size="lg" className="rounded-md" />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <Badge variant={selectedUser.role === 'SUPER_ADMIN' ? 'gold' : selectedUser.role === 'CLUB_MANAGER' ? 'blue' : 'emerald'} size="sm" className="rounded-md">
                    {selectedUser.role}
                  </Badge>
                </div>
                <p className="text-slate-400 font-medium">{selectedUser.email} • {selectedUser.phone || 'No phone'}</p>
                <p className="text-slate-500 mt-1 font-medium">City: {selectedUser.city} • Joined: {selectedUser.joinedDate || '2024'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Elo Rating</span>
                <span className="text-lg font-bold text-amber-500">{selectedUser.eloRating || 1500} Elo</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Wallet Balance</span>
                <span className="text-lg font-bold text-sport-500">₹{selectedUser.walletBalance?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-2 pt-2">
              <span className="text-slate-400 block text-[10px] uppercase flex items-center space-x-1 font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment & Wallet Transaction History</span>
              </span>
              {selectedUser.paymentHistory && selectedUser.paymentHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedUser.paymentHistory.map((tx, idx) => (
                    <div key={idx} className="p-2 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{tx.description || tx.type}</span>
                        <span className="text-slate-400 block text-[10px]">{tx.date}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-500">₹{tx.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No transactions recorded yet.</p>
              )}
            </div>

            {/* Game History */}
            <div className="space-y-2 pt-2">
              <span className="text-slate-400 block text-[10px] uppercase flex items-center space-x-1 font-bold">
                <History className="w-3.5 h-3.5" />
                <span>Match Gameplay History</span>
              </span>
              {selectedUser.gameHistory && selectedUser.gameHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedUser.gameHistory.map((g, idx) => (
                    <div key={idx} className="p-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{g.title}</span>
                        <span className="text-slate-400 block text-[10px]">{g.date}</span>
                      </div>
                      <Badge variant="blue" size="sm" className="rounded-md">{g.score || 'Completed'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No matches played yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsProfileModalOpen(false)} className="rounded-md text-xs font-semibold">
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
