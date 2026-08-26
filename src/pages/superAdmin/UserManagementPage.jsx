import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import UserRow from '../../components/superAdmin/UserRow';

export const UserManagementPage = () => {
  const { usersList, updateProfile } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = (userId, newRole) => {
    const user = usersList.find(u => u.id === userId);
    if (user) {
      updateProfile({ role: newRole });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <Users className="w-8 h-8 text-purple-500" />
          <span>User Accounts & Roles</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage user permissions, promote players to club managers, and inspect profiles
        </p>
      </div>

      <div className="glass-card p-4 rounded-2xl border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(u => (
          <UserRow key={u.id} user={u} onRoleChange={handleRoleChange} />
        ))}
      </div>
    </div>
  );
};

export default UserManagementPage;
