import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dummyUsers } from '../data/dummyUsers';
import { getTodayDate } from '../utils/dateUtils';
import { calculatePlayerOVR, normalizeFootballPosition } from '../utils/footballLogic.js';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null, // Default logged out state - role access via Login/Register page
      sessionMeta: null, // Stores active session timestamp and RBAC audit data
      usersList: dummyUsers,

      setCurrentUser: (user) => set({ 
        currentUser: user,
        sessionMeta: user ? {
          loginTime: new Date().toISOString(),
          sessionId: `SES-${Math.floor(100000 + Math.random() * 900000)}`,
          rbacVerified: true,
          dataPrivacyMode: "STRICT_ROLE_ISOLATED"
        } : null
      }),

      logout: () => {
        set({ currentUser: null, sessionMeta: null });
        toast.success('Logged out successfully.');
      },

      // --- PUBLIC PLAYER REGISTRATION (ALWAYS ROLE = PLAYER) ---
      registerPlayer: (playerData) => {
        const { email, name, phone, password, city, playingHand, bio, profileImageUrl } = playerData;
        
        // Email uniqueness check
        const existing = get().usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          return { success: false, error: 'An account with this email address already exists.' };
        }

        const initialElo = 1500;
        const rawPos = playerData.position || (playingHand ? playingHand.split('/')[1]?.trim() : 'Midfielder');
        const normPos = normalizeFootballPosition(rawPos);
        const preferredFoot = playerData.preferredFoot || (playingHand ? playingHand.split('/')[0]?.trim() : 'Right');

        const newPlayer = {
          id: `usr_player_${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : '+91 90000 00000',
          password: password,
          role: 'PLAYER', // AUTOMATICALLY ASSIGNED PLAYER ROLE ONLY
          profileImageUrl: profileImageUrl || '/assets/images/avatars/avatar-1.jpg',
          city: city || 'Raipur',
          position: normPos,
          preferredFoot: preferredFoot,
          playingHand: playingHand || `${preferredFoot} / ${normPos}`,
          skillLevel: 'Intermediate',
          eloRating: initialElo,
          stats: {
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            cleanSheets: 0,
            points: 0,
            winRate: 0,
            ovr: calculatePlayerOVR(initialElo),
            position: normPos,
            preferredFoot: preferredFoot
          },
          bio: bio || 'Passionate football player looking for 5v5 and 7v7 casual matches.',
          badges: ['NewRecruit'],
          joinedDate: getTodayDate(0),
          walletBalance: 1000.00, // Default welcome bonus
          status: 'ACTIVE',
          clubsJoined: [],
          gamesCreated: [],
          gamesJoined: [],
          paymentHistory: [
            {
              id: `tx_welcome_${Date.now()}`,
              type: 'WELCOME_BONUS',
              amount: 1000.00,
              date: getTodayDate(0),
              status: 'SUCCESS',
              description: 'Welcome bonus credit'
            }
          ],
          gameHistory: []
        };

        const updatedList = [...get().usersList, newPlayer];
        set({
          usersList: updatedList,
          currentUser: newPlayer,
          sessionMeta: {
            loginTime: new Date().toISOString(),
            sessionId: `SES-${Math.floor(100000 + Math.random() * 900000)}`,
            rbacVerified: true,
            dataPrivacyMode: "STRICT_ROLE_ISOLATED"
          }
        });

        toast.success(`Account created! Welcome to FIFA All Stars, ${newPlayer.name}.`);
        return { success: true, user: newPlayer };
      },

      // --- SUPER ADMIN CREATES CLUB MANAGER ---
      createClubManager: (managerData) => {
        const { name, email, phone, password, clubId, city, bio } = managerData;

        // Verify calling user is SUPER_ADMIN
        const admin = get().currentUser;
        if (!admin || admin.role !== 'SUPER_ADMIN') {
          toast.error('Unauthorized: Only Super Admins can create Club Managers.');
          return { success: false, error: 'Unauthorized operation' };
        }

        // Email uniqueness check
        const existing = get().usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          toast.error('Email already in use by another user.');
          return { success: false, error: 'Email already exists' };
        }

        const newManager = {
          id: `usr_mgr_${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : '+91 98765 00000',
          password: password || 'Manager@123',
          role: 'CLUB_MANAGER', // STRICTLY CREATED BY SUPER ADMIN ONLY
          clubId: clubId || null,
          city: city || 'Raipur',
          playingHand: 'Right / Manager',
          skillLevel: 'Advanced',
          eloRating: 1600,
          bio: bio || 'General Manager of assigned football venue.',
          profileImageUrl: '/assets/images/avatars/avatar-3.jpg',
          badges: ['VerifiedPartner'],
          joinedDate: getTodayDate(0),
          walletBalance: 5000.00,
          status: 'ACTIVE',
          clubsJoined: clubId ? [clubId] : [],
          gamesCreated: [],
          gamesJoined: [], // CANNOT JOIN GAMES AS A PLAYER
          paymentHistory: [],
          gameHistory: []
        };

        set({ usersList: [...get().usersList, newManager] });
        toast.success(`Club Manager "${newManager.name}" created successfully!`);
        return { success: true, user: newManager };
      },

      updateClubManager: (managerId, updatedFields) => {
        const admin = get().currentUser;
        if (!admin || admin.role !== 'SUPER_ADMIN') {
          toast.error('Unauthorized: Only Super Admins can update Club Managers.');
          return;
        }

        set({
          usersList: get().usersList.map(u => u.id === managerId ? { ...u, ...updatedFields } : u)
        });
        toast.success('Club Manager details updated!');
      },

      removeClubManager: (managerId) => {
        const admin = get().currentUser;
        if (!admin || admin.role !== 'SUPER_ADMIN') {
          toast.error('Unauthorized: Only Super Admins can remove Club Managers.');
          return;
        }

        const target = get().usersList.find(u => u.id === managerId);
        if (!target) return;

        if (target.isOwner) {
          toast.error('Cannot remove Platform Owner!');
          return;
        }

        set({
          usersList: get().usersList.filter(u => u.id !== managerId)
        });
        toast.success(`Club Manager ${target.name} removed.`);
      },

      switchRole: (roleKey) => {
        const targetRole = roleKey.toUpperCase();
        const found = get().usersList.find(u => u.role === targetRole);
        if (found) {
          if (found.status === 'SUSPENDED') {
            toast.error(`Cannot switch role: User account ${found.name} is SUSPENDED!`);
            return;
          }
          set({ 
            currentUser: found,
            sessionMeta: {
              loginTime: new Date().toISOString(),
              sessionId: `SES-${Math.floor(100000 + Math.random() * 900000)}`,
              rbacVerified: true,
              dataPrivacyMode: "STRICT_ROLE_ISOLATED"
            }
          });
        }
      },

      loginWithCredentials: (email, password) => {
        const user = get().usersList.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          if (user.status === 'SUSPENDED') {
            return { success: false, error: 'Your account has been SUSPENDED by Super Admin. Access restricted.' };
          }
          set({ 
            currentUser: user,
            sessionMeta: {
              loginTime: new Date().toISOString(),
              sessionId: `SES-${Math.floor(100000 + Math.random() * 900000)}`,
              rbacVerified: true,
              dataPrivacyMode: "STRICT_ROLE_ISOLATED"
            }
          });
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

      updateWallet: (amount, description = 'Wallet Transaction') => {
        const user = get().currentUser;
        if (!user) return;
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || !isFinite(numAmount)) {
          console.error('Invalid wallet amount:', amount);
          return;
        }
        const newTx = {
          id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: numAmount >= 0 ? 'WALLET_TOPUP' : 'PAYMENT',
          amount: Math.abs(numAmount),
          date: getTodayDate(0),
          status: 'SUCCESS',
          description
        };
        const updatedHistory = [...(user.paymentHistory || []), newTx];
        const updated = {
          ...user,
          walletBalance: Math.max(0, Math.round(((user.walletBalance || 0) + numAmount) * 100) / 100),
          paymentHistory: updatedHistory
        };
        set({
          currentUser: updated,
          usersList: get().usersList.map(u => u.id === user.id ? updated : u)
        });
      },

      updateProfile: (data) => {
        const user = get().currentUser;
        if (!user) return;
        
        let extraFootballData = {};
        if (data.playingHand && !data.position) {
          const parts = data.playingHand.split('/');
          if (parts.length > 1) {
            extraFootballData.preferredFoot = parts[0].trim();
            extraFootballData.position = normalizeFootballPosition(parts[1].trim());
          }
        }
        
        const updated = { ...user, ...data, ...extraFootballData };
        set({
          currentUser: updated,
          usersList: get().usersList.map(u => u.id === user.id ? updated : u)
        });
      },

      resetPasswordWithToken: (emailOrPhone, newPassword) => {
        const query = (emailOrPhone || '').trim().toLowerCase();
        const user = get().usersList.find(u => 
          u.email.toLowerCase() === query || 
          (u.phone && u.phone.replace(/[\s+-]/g, '') === query.replace(/[\s+-]/g, ''))
        );
        if (!user) {
          return { success: false, error: 'No account registered with that email or phone number.' };
        }
        if (user.status === 'SUSPENDED') {
          return { success: false, error: 'Account is suspended. Please contact support.' };
        }
        const updatedUser = { ...user, password: newPassword };
        set({
          usersList: get().usersList.map(u => u.id === user.id ? updatedUser : u),
          currentUser: get().currentUser?.id === user.id ? updatedUser : get().currentUser
        });
        return { success: true, message: 'Password updated successfully.' };
      }
    }),
    {
      name: 'fifa_all_stars_auth_storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.currentUser?.profileImageUrl?.includes('/src/assets/images/')) {
            state.currentUser.profileImageUrl = state.currentUser.profileImageUrl.replace('/src/assets/images/', '/assets/images/');
          }
          if (Array.isArray(state.usersList)) {
            state.usersList.forEach(u => {
              if (u.profileImageUrl?.includes('/src/assets/images/')) {
                u.profileImageUrl = u.profileImageUrl.replace('/src/assets/images/', '/assets/images/');
              }
            });
          }
        }
      }
    }
  )
);

// Cross-tab Synchronization Event Listener for Auth State
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'fifa_all_stars_auth_storage') {
      try {
        useAuthStore.persist.rehydrate();
      } catch (err) {
        console.error('Error rehydrating auth store across tabs:', err);
      }
    }
  });
}

