import { create } from 'zustand';
import { dummyUsers } from '../data/dummyUsers';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  currentUser: dummyUsers.find(u => u.role === 'PLAYER') || dummyUsers[5],
  usersList: dummyUsers,

  setCurrentUser: (user) => set({ currentUser: user }),
  
  switchRole: (roleKey) => {
    const targetRole = roleKey.toUpperCase();
    const found = get().usersList.find(u => u.role === targetRole || u.role.replace('_', '') === targetRole.replace('_', ''));
    if (found) {
      if (found.status === 'SUSPENDED') {
        toast.error(`Cannot switch role: User account ${found.name} is SUSPENDED!`);
        return;
      }
      set({ currentUser: found });
    }
  },

  loginWithCredentials: (email, password) => {
    const user = get().usersList.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      if (user.status === 'SUSPENDED') {
        return { success: false, error: 'Your account has been SUSPENDED by Super Admin. Access restricted.' };
      }
      set({ currentUser: user });
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  toggleUserStatus: (userId) => {
    const target = get().usersList.find(u => u.id === userId);
    if (!target) return;

    if (target.isOwner) {
      toast.error('Security Restriction: Platform Owner Super Admin can NEVER be suspended!');
      return;
    }

    const nextStatus = target.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    set({
      usersList: get().usersList.map(u => u.id === userId ? { ...u, status: nextStatus } : u)
    });
    toast.success(`User ${target.name} status set to ${nextStatus}`);
  },

  changeUserRole: (userId, newRole) => {
    const target = get().usersList.find(u => u.id === userId);
    if (!target) return;

    if (target.isOwner) {
      toast.error('Security Restriction: Platform Owner Super Admin can NEVER be demoted!');
      return;
    }

    set({
      usersList: get().usersList.map(u => u.id === userId ? { ...u, role: newRole } : u)
    });
    toast.success(`User ${target.name} role changed to ${newRole}`);
  },

  updateWallet: (amount) => {
    const user = get().currentUser;
    if (!user) return;
    const updated = { ...user, walletBalance: user.walletBalance + amount };
    set({
      currentUser: updated,
      usersList: get().usersList.map(u => u.id === user.id ? updated : u)
    });
  },

  updateProfile: (data) => {
    const user = get().currentUser;
    if (!user) return;
    const updated = { ...user, ...data };
    set({
      currentUser: updated,
      usersList: get().usersList.map(u => u.id === user.id ? updated : u)
    });
  }
}));
