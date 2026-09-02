import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dummyClubs } from '../data/dummyClubs';
import { dummyCourts } from '../data/dummyCourts';
import { dummyGames } from '../data/dummyGames';
import { dummyTournaments } from '../data/dummyTournaments';
import { dummyCommunityPosts, dummyPolls, dummyChallenges } from '../data/dummyCommunity';
import { calculateNewElo } from '../utils/eloCalculator';
import { getTodayDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

export const MATCH_FORMAT_SLOTS = {
  '1v1': 2,
  '2v2': 4,
  '3v3': 6,
  '4v4': 8,
  '5v5': 10,
  '6v6': 12,
  '7v7': 14,
  '8v8': 16,
  '11v11': 22
};

export const useDataStore = create(
  persist(
    (set, get) => ({
  clubs: dummyClubs,
  courts: dummyCourts,
  games: dummyGames,
  tournaments: dummyTournaments,
  communityPosts: dummyCommunityPosts,
  polls: dummyPolls,
  challenges: dummyChallenges,

  // --- IN-APP NOTIFICATION ENGINE ---
  notifications: [
    {
      id: "notif_1",
      userId: "usr_player_demo",
      title: "⚽ New 5v5 Game Available",
      message: "A new 5v5 game is available at Bernabeu Arena Turf. Entry fee: ₹150. Join now before all slots are filled.",
      date: "Just now",
      read: false,
      linkUrl: "/games/gam_101",
      clubId: "clb_raipur_1",
      gameId: "gam_101"
    },
    {
      id: "notif_2",
      userId: "usr_player_demo",
      title: "💳 Payment Successful & Slot Secured",
      message: "Your payment of ₹150 for Raipur Friday Night 5v5 Super Match was successful. Slot confirmed!",
      date: "2 hours ago",
      read: true,
      linkUrl: "/games/gam_101",
      clubId: "clb_raipur_1",
      gameId: "gam_101"
    },
    {
      id: "notif_3",
      userId: "usr_p2",
      title: "🔥 Match Started! (ONGOING)",
      message: "Bangalore Techie Fastbreak 5v5 is now ONGOING at Silicon Turf Hub.",
      date: "1 hour ago",
      read: false,
      linkUrl: "/games/gam_103",
      clubId: "clb_blr_1",
      gameId: "gam_103"
    }
  ],

  // --- GAME VIDEOS REFERENCE STORAGE ---
  gameVideos: [
    {
      id: "vid_104",
      gameId: "gam_104",
      clubId: "clb_pune_1",
      courtId: "crt_pune_301",
      title: "Pune Indoor Futsal Showcase - Official Match Highlights",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      videoStatus: "AVAILABLE",
      uploadedBy: "Rajesh Sharma (Club Manager)",
      uploadDate: getTodayDate(-2),
      description: "Full match highlights and thrilling final goals from Deccan Pitch Red."
    }
  ],
  
  // Audit Logs Array
  auditLogs: [
    {
      id: "log_1",
      timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
      adminName: "Aaditya Verma",
      action: "PLATFORM_INIT",
      target: "System Core",
      details: "Initialised FIFA All Stars Super Admin Session."
    }
  ],

  // Support Tickets
  tickets: [
    {
      id: "tk-101",
      subject: "Refund query for cancelled pitch booking",
      user: "Siddharth Rao",
      status: "OPEN",
      assignedStaff: "Unassigned",
      priority: "HIGH",
      createdAt: getTodayDate(-3)
    },
    {
      id: "tk-102",
      subject: "Score dispute in Raipur 5v5 league match",
      user: "Arjun Mehta",
      status: "ASSIGNED",
      assignedStaff: "Vikram Sethi (Ops)",
      priority: "MEDIUM",
      createdAt: getTodayDate(-4)
    },
    {
      id: "tk-103",
      subject: "Floodlight outage feedback at Silicon Turf Hub",
      user: "Ananya Iyer",
      status: "RESOLVED",
      assignedStaff: "Kavita Rao (Finance)",
      priority: "LOW",
      createdAt: getTodayDate(-6)
    }
  ],

  // Match Disputes
  disputes: [
    {
      id: "dsp_1",
      gameId: "gam_101",
      gameTitle: "Raipur 5v5 Showdown at Bernabeu Arena",
      reportedBy: "Arjun Mehta",
      disputedScore: "Team A 4 - 3 Team B",
      reason: "Team B claimed time was over before 4th goal",
      status: "OPEN",
      createdAt: getTodayDate(-1)
    }
  ],

  bookings: [
    {
      id: "bkg_101",
      courtId: "crt_rp_101",
      courtName: "Raipur Pitch Alpha (5v5)",
      clubId: "clb_raipur_1",
      clubName: "Bernabeu Arena Turf",
      city: "Raipur",
      userId: "usr_player_demo",
      userName: "Arjun Mehta",
      date: getTodayDate(1),
      startTime: "19:00",
      endTime: "20:30",
      amountPaid: 750,
      status: "REFUND_PENDING",
      refundTier: "100%",
      cancellationReason: "User cancelled > 24h prior",
      createdAt: getTodayDate(-2)
    },
    {
      id: "bkg_102",
      courtId: "crt_blr_201",
      courtName: "Silicon Pitch 1 (5v5)",
      clubId: "clb_blr_1",
      clubName: "Silicon Turf Hub",
      city: "Bangalore",
      userId: "usr_p2",
      userName: "Siddharth Rao",
      date: getTodayDate(0),
      startTime: "20:00",
      endTime: "21:30",
      amountPaid: 1050,
      status: "CONFIRMED",
      createdAt: getTodayDate(-3)
    }
  ],

  // --- NOTIFICATION ACTIONS ---
  addNotification: (notifData) => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      date: "Just now",
      read: false,
      ...notifData
    };
    set({ notifications: [newNotif, ...get().notifications] });
  },

  markNotificationRead: (notifId) => {
    set({
      notifications: get().notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
    });
  },

  markAllNotificationsRead: (userId) => {
    set({
      notifications: get().notifications.map(n => (!userId || n.userId === userId) ? { ...n, read: true } : n)
    });
  },

  // --- GAME VIDEO ACTIONS ---
  addGameVideo: (videoData) => {
    const newVid = {
      id: `vid_${Date.now()}`,
      videoStatus: 'AVAILABLE',
      uploadDate: new Date().toISOString().split('T')[0],
      ...videoData
    };

    set({ gameVideos: [newVid, ...get().gameVideos] });

    // Trigger Notification for Video Release
    get().addNotification({
      userId: null,
      title: `🎥 Match Video Highlights Released`,
      message: `Official match video for "${videoData.title || 'Game'}" is now available to view!`,
      linkUrl: `/games/${videoData.gameId}`,
      clubId: videoData.clubId,
      gameId: videoData.gameId
    });

    toast.success('Match video recorded & linked successfully!');
    return newVid;
  },

  // --- AUDIT LOG HELPER ---
  addAuditLog: (action, target, details, adminName = "Aaditya Verma") => {
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      adminName,
      action,
      target,
      details
    };
    set({ auditLogs: [newLog, ...get().auditLogs] });
  },

  // --- SUPER ADMIN ACTIONS ---
  approveClub: (clubId, managerId) => {
    const clubs = get().clubs;
    const target = clubs.find(c => c.id === clubId);
    if (!target) return;

    set({
      clubs: clubs.map(c => c.id === clubId ? {
        ...c,
        status: 'ACTIVE',
        managerIds: managerId ? [...(c.managerIds || []), managerId] : c.managerIds
      } : c)
    });

    get().addAuditLog('CLUB_APPROVED', target.name, `Approved venue & assigned manager ID: ${managerId || 'Default'}`);
    toast.success(`Club "${target.name}" approved & activated!`);
  },

  rejectClub: (clubId, reason) => {
    const clubs = get().clubs;
    const target = clubs.find(c => c.id === clubId);
    if (!target) return;

    set({
      clubs: clubs.filter(c => c.id !== clubId)
    });

    get().addAuditLog('CLUB_REJECTED', target.name, `Rejected club approval: ${reason}`);
    toast.success(`Club "${target.name}" rejected.`);
  },

  approveRefund: (bookingId, usersList, updateUsersListFn) => {
    const bookings = get().bookings;
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;

    if (updateUsersListFn && usersList) {
      const updated = usersList.map(u => u.id === target.userId ? { ...u, walletBalance: (u.walletBalance || 0) + target.amountPaid } : u);
      updateUsersListFn(updated);
    }

    set({
      bookings: bookings.map(b => b.id === bookingId ? { ...b, status: 'REFUNDED' } : b)
    });

    get().addAuditLog('REFUND_APPROVED', target.id, `Approved ₹${target.amountPaid} refund to ${target.userName}`);
    toast.success(`Refund of ₹${target.amountPaid} approved and credited to ${target.userName}`);
  },

  rejectRefund: (bookingId, reason) => {
    const bookings = get().bookings;
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;

    set({
      bookings: bookings.map(b => b.id === bookingId ? { ...b, status: 'REFUND_REJECTED' } : b)
    });

    get().addAuditLog('REFUND_REJECTED', target.id, `Rejected refund request: ${reason}`);
    toast.success(`Refund request rejected.`);
  },

  resolveDispute: (disputeId, winnerTeam, scoreStr) => {
    const disputes = get().disputes;
    const target = disputes.find(d => d.id === disputeId);
    if (!target) return;

    set({
      disputes: disputes.map(d => d.id === disputeId ? { ...d, status: 'RESOLVED', winnerOverride: winnerTeam } : d)
    });

    get().addAuditLog('DISPUTE_RESOLVED', target.gameTitle, `Overrode match result: ${winnerTeam} declared winner (${scoreStr}). Elo adjusted.`);
    toast.success(`Dispute resolved! ${winnerTeam} declared winner.`);
  },

  assignTicketStaff: (ticketId, staffName) => {
    set({
      tickets: get().tickets.map(t => t.id === ticketId ? { ...t, assignedStaff: staffName, status: 'ASSIGNED' } : t)
    });
    get().addAuditLog('TICKET_ASSIGNED', ticketId, `Assigned support ticket to ${staffName}`);
    toast.success(`Ticket ${ticketId} assigned to ${staffName}`);
  },

  resolveTicket: (ticketId) => {
    set({
      tickets: get().tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' } : t)
    });
    get().addAuditLog('TICKET_RESOLVED', ticketId, `Closed & resolved support ticket`);
    toast.success(`Ticket ${ticketId} resolved!`);
  },

  // --- CLUB MANAGER ACTIONS ---
  updateClub: (clubId, updatedFields) => {
    set({
      clubs: get().clubs.map(c => c.id === clubId ? { ...c, ...updatedFields } : c)
    });
    get().addAuditLog('CLUB_UPDATED', clubId, `Updated club details.`);
    toast.success('Club details updated successfully!');
  },

  addCourt: (clubId, courtData) => {
    const newCourt = {
      courtId: `crt_${Date.now()}`,
      clubId,
      basePrice: 500,
      peakMultiplier: 1.5,
      weekendMultiplier: 1.75,
      peakWindow: "17:00-21:00",
      status: "AVAILABLE",
      image: "/src/assets/images/courts/court-1.jpg",
      ...courtData
    };
    set({ courts: [...get().courts, newCourt] });
    get().addAuditLog('COURT_ADDED', newCourt.name, `Created court for club ${clubId}`);
    toast.success(`New court "${newCourt.name}" created!`);
    return newCourt;
  },

  updateCourt: (courtId, updatedFields) => {
    set({
      courts: get().courts.map(c => (c.courtId === courtId || c.id === courtId) ? { ...c, ...updatedFields } : c)
    });
    toast.success('Court settings saved!');
  },

  toggleCourtStatus: (courtId, newStatus) => {
    set({
      courts: get().courts.map(c => (c.courtId === courtId || c.id === courtId) ? { ...c, status: newStatus } : c)
    });
    get().addAuditLog('COURT_STATUS_CHANGED', courtId, `Status set to ${newStatus}`);
    toast.success(`Court status updated to ${newStatus}`);
  },

  removeCourt: (courtId) => {
    set({
      courts: get().courts.filter(c => c.courtId !== courtId && c.id !== courtId)
    });
    get().addAuditLog('COURT_REMOVED', courtId, `Pitch deleted by manager.`);
    toast.success('Pitch removed successfully.');
  },

  updatePricingSettings: (courtId, pricingData) => {
    set({
      courts: get().courts.map(c => (c.courtId === courtId || c.id === courtId) ? { ...c, ...pricingData } : c)
    });
    toast.success('Peak pricing multipliers updated!');
  },

  // --- MATCH LIFECYCLE MANAGEMENT ---
  updateGameLifecycle: (gameId, newStatus) => {
    const games = get().games;
    const target = games.find(g => g.id === gameId);
    if (!target) return;

    set({
      games: games.map(g => g.id === gameId ? { ...g, status: newStatus } : g)
    });

    get().addNotification({
      userId: null,
      title: `⚡ Match Status: ${newStatus}`,
      message: `Match "${target.title}" is now ${newStatus}.`,
      linkUrl: `/games/${gameId}`,
      clubId: target.venueReference?.clubId,
      gameId
    });

    toast.success(`Match status updated to ${newStatus}`);
  },

  updateGameDetails: (gameId, updatedFields) => {
    const games = get().games;
    const target = games.find(g => g.id === gameId);
    if (!target) return;

    set({
      games: games.map(g => g.id === gameId ? { ...g, ...updatedFields } : g)
    });

    get().addNotification({
      userId: null,
      title: `✏️ Match Details Updated`,
      message: `Host updated match details for "${updatedFields.title || target.title}".`,
      linkUrl: `/games/${gameId}`,
      clubId: target.venueReference?.clubId,
      gameId
    });

    toast.success('Game details updated successfully!');
  },

  removeGame: (gameId, reason = 'Cancelled by venue manager') => {
    const games = get().games;
    const target = games.find(g => g.id === gameId);
    if (!target) return false;

    set({
      games: games.filter(g => g.id !== gameId)
    });

    if (target.confirmedPlayers?.length > 0) {
      target.confirmedPlayers.forEach(player => {
        get().addNotification({
          userId: player.id,
          title: `❌ Match Session Cancelled`,
          message: `Match "${target.title}" scheduled for ${target.dateTime?.date} at ${target.venueReference?.clubName || 'Venue'} was cancelled by the venue manager.`,
          linkUrl: `/games`,
          clubId: target.venueReference?.clubId
        });
      });
    }

    get().addAuditLog('GAME_CANCELLED_BY_MANAGER', target.title, `Manager removed game ID ${gameId}. Reason: ${reason}`);
    toast.success(`Game session "${target.title}" removed!`);
    return true;
  },

  // --- GAME ACTIONS, CONCURRENCY, TEAM SELECTION & WAITLIST ---
  joinGame: (gameId, player, targetTeam) => {
    if (!player) return { success: false, message: 'Must be logged in to join games' };
    
    // STRICT AUTHORIZATION RULE: CLUB_MANAGER CANNOT JOIN GAMES AS A PLAYER
    if (player.role === 'CLUB_MANAGER') {
      return { success: false, message: 'Club Managers are not allowed to join games as players or occupy player slots.' };
    }

    const games = get().games;
    const targetGame = games.find(g => g.id === gameId);
    if (!targetGame) return { success: false, message: 'Game not found' };

    if (targetGame.status === 'COMPLETED' || (targetGame.score && targetGame.score.teamA !== null)) {
      return { success: false, message: 'This match is completed! Player entry and roster joins are permanently locked.' };
    }

    const isAlreadyConfirmed = targetGame.confirmedPlayers?.some(p => p.id === player.id);
    const isAlreadyWaitlisted = targetGame.waitlist?.some(p => p.id === player.id);

    if (isAlreadyConfirmed || isAlreadyWaitlisted) {
      return { success: false, message: 'You are already registered for this game!' };
    }

    const currentCount = targetGame.confirmedPlayers?.length || 0;
    const maxSlots = targetGame.maxPlayers || MATCH_FORMAT_SLOTS[targetGame.format] || 10;
    const teamCap = Math.ceil(maxSlots / 2);
    const isFull = currentCount >= maxSlots;

    if (!isFull) {
      const teamACount = (targetGame.confirmedPlayers || []).filter((p, i) => (p.team === 'TEAM_A' || (!p.team && i < teamCap))).length;
      const teamBCount = (targetGame.confirmedPlayers || []).filter((p, i) => (p.team === 'TEAM_B' || (!p.team && i >= teamCap))).length;

      let assignedTeam = targetTeam;
      if (assignedTeam === 'TEAM_A' && teamACount >= teamCap) {
        return { success: false, message: `Team A is already full (${teamACount}/${teamCap}). Please select Team B!` };
      }
      if (assignedTeam === 'TEAM_B' && teamBCount >= teamCap) {
        return { success: false, message: `Team B is already full (${teamBCount}/${teamCap}). Please select Team A!` };
      }

      if (!assignedTeam) {
        assignedTeam = teamACount <= teamBCount ? 'TEAM_A' : 'TEAM_B';
      }

      const newConfirmed = [...(targetGame.confirmedPlayers || []), {
        id: player.id,
        name: player.name,
        avatar: player.profileImageUrl || player.avatar,
        position: player.playingHand?.split('/')[1]?.trim() || 'MID',
        team: assignedTeam
      }];

      const newStatus = newConfirmed.length >= maxSlots ? 'FULL' : 'OPEN_FOR_JOINING';

      set({
        games: games.map(g => g.id === gameId ? {
          ...g,
          confirmedPlayers: newConfirmed,
          status: newStatus
        } : g)
      });

      // Notification Event 2 & 3 & 6
      get().addNotification({
        userId: player.id,
        title: `💳 Payment Successful & Slot Secured`,
        message: `Your payment of ₹${targetGame.entryFee} for "${targetGame.title}" was processed. Slot confirmed in ${assignedTeam === 'TEAM_A' ? 'Team A' : 'Team B'}!`,
        linkUrl: `/games/${gameId}`,
        clubId: targetGame.venueReference?.clubId,
        gameId
      });

      if (newStatus === 'FULL') {
        get().addNotification({
          userId: null,
          title: `🔥 Game Roster Full`,
          message: `Match "${targetGame.title}" has reached full capacity (${maxSlots}/${maxSlots} slots occupied).`,
          linkUrl: `/games/${gameId}`,
          clubId: targetGame.venueReference?.clubId,
          gameId
        });
      }

      return { success: true, promoted: false, message: `Successfully joined ${assignedTeam === 'TEAM_A' ? 'Team A' : 'Team B'} roster!` };
    } else {
      const waitlistPos = (targetGame.waitlist?.length || 0) + 1;
      const newWaitlist = [...(targetGame.waitlist || []), {
        id: player.id,
        name: player.name,
        avatar: player.profileImageUrl || player.avatar,
        position: player.playingHand?.split('/')[1]?.trim() || 'MID'
      }];

      set({
        games: games.map(g => g.id === gameId ? {
          ...g,
          waitlist: newWaitlist
        } : g)
      });
      return { success: true, promoted: false, message: `Match full! Added to waitlist at position #${waitlistPos}` };
    }
  },

  switchPlayerTeam: (gameId, playerId, targetTeam) => {
    const games = get().games;
    const targetGame = games.find(g => g.id === gameId);
    if (!targetGame) return { success: false, message: 'Game not found' };

    if (targetGame.status === 'COMPLETED' || (targetGame.score && targetGame.score.teamA !== null)) {
      return { success: false, message: 'This match is completed! Team lineups are permanently locked.' };
    }

    const maxSlots = targetGame.maxPlayers || 10;
    const teamCap = Math.ceil(maxSlots / 2);
    const targetTeamCount = (targetGame.confirmedPlayers || []).filter(p => p.team === targetTeam).length;

    if (targetTeamCount >= teamCap) {
      return { success: false, message: `${targetTeam === 'TEAM_A' ? 'Team A' : 'Team B'} lineup is full (${teamCap}/${teamCap})!` };
    }

    const updatedConfirmed = (targetGame.confirmedPlayers || []).map(p => 
      p.id === playerId ? { ...p, team: targetTeam } : p
    );

    set({
      games: games.map(g => g.id === gameId ? { ...g, confirmedPlayers: updatedConfirmed } : g)
    });

    toast.success(`Switched to ${targetTeam === 'TEAM_A' ? 'Team A' : 'Team B'} lineup!`);
    return { success: true, message: `Switched to ${targetTeam}` };
  },

  leaveGame: (gameId, userId) => {
    const games = get().games;
    const targetGame = games.find(g => g.id === gameId);
    if (!targetGame) return;

    if (targetGame.status === 'COMPLETED' || (targetGame.score && targetGame.score.teamA !== null)) {
      toast.error('This match is completed! Roster is permanently locked.');
      return;
    }

    const wasConfirmed = targetGame.confirmedPlayers?.some(p => p.id === userId);
    let newConfirmed = targetGame.confirmedPlayers?.filter(p => p.id !== userId) || [];
    let newWaitlist = [...(targetGame.waitlist || [])];
    let promotedPlayer = null;

    if (wasConfirmed && newWaitlist.length > 0) {
      promotedPlayer = newWaitlist.shift();
      newConfirmed.push(promotedPlayer);
    }

    const maxSlots = targetGame.maxPlayers || MATCH_FORMAT_SLOTS[targetGame.format] || 10;
    const newStatus = newConfirmed.length >= maxSlots ? 'FULL' : 'OPEN_FOR_JOINING';

    set({
      games: games.map(g => g.id === gameId ? {
        ...g,
        confirmedPlayers: newConfirmed,
        waitlist: newWaitlist,
        status: newStatus
      } : g)
    });

    if (promotedPlayer) {
      toast.success(`🎉 Automated Waitlist Promotion: ${promotedPlayer.name} was promoted to confirmed roster!`);
      get().addNotification({
        userId: promotedPlayer.id,
        title: `🎉 Waitlist Promotion Confirmed!`,
        message: `You were promoted to the confirmed match roster for "${targetGame.title}"!`,
        linkUrl: `/games/${gameId}`,
        clubId: targetGame.venueReference?.clubId,
        gameId
      });
    }
  },

  createGame: (newGameData, creatorUser) => {
    const format = newGameData.format || '5v5';
    const computedMaxPlayers = newGameData.maxPlayers || MATCH_FORMAT_SLOTS[format] || 10;
    const isPlayerCreator = creatorUser?.role === 'PLAYER';
    const isManagerCreator = creatorUser?.role === 'CLUB_MANAGER' || creatorUser?.role === 'SUPER_ADMIN';

    let confirmedPlayers = [];
    if (isPlayerCreator && creatorUser) {
      confirmedPlayers = [{
        id: creatorUser.id,
        name: creatorUser.name,
        avatar: creatorUser.profileImageUrl || creatorUser.avatar,
        position: creatorUser.playingHand?.split('/')[1]?.trim() || 'ST'
      }];
    }
    // Note: If Manager/Admin creates, confirmedPlayers is [] (0 slots taken by manager, 100% slots available for players)

    const newGame = {
      id: `gam_${Date.now()}`,
      status: 'OPEN_FOR_JOINING',
      format,
      maxPlayers: computedMaxPlayers,
      confirmedPlayers,
      waitlist: [],
      score: null,
      privacy: newGameData.privacy || 'PUBLIC',
      organizer: {
        id: creatorUser?.id || 'usr_club_mgr_101',
        name: creatorUser?.name || 'Club Manager',
        avatar: creatorUser?.profileImageUrl || creatorUser?.avatar
      },
      ...newGameData
    };

    set({ games: [newGame, ...get().games] });

    // Broadcast Notification to all eligible community players
    get().addNotification({
      userId: null,
      title: isManagerCreator 
        ? `📢 New Match Session at ${newGame.venueReference?.clubName || 'Club Turf'}`
        : `⚽ New ${format} Game Hosted by ${creatorUser?.name || 'Player'}`,
      message: `A new ${format} pick-up session "${newGame.title}" has been published for ${newGame.dateTime?.date} at ${newGame.dateTime?.startTime}. Entry Fee: ₹${newGame.entryFee}. All ${computedMaxPlayers} slots open — Join now!`,
      linkUrl: `/games/${newGame.id}`,
      clubId: newGame.venueReference?.clubId,
      gameId: newGame.id
    });

    if (isManagerCreator) {
      toast.success(`Official Game "${newGame.title}" published! All ${computedMaxPlayers} slots open for players.`);
    } else {
      toast.success(`Match "${newGame.title}" published! You are confirmed in Slot #1.`);
    }

    return newGame;
  },

  updateLiveScore: (gameId, scoreData, updaterName = 'Host/Manager') => {
    const games = get().games;
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    let teamAScore = 0;
    let teamBScore = 0;

    if (typeof scoreData === 'object' && scoreData !== null) {
      teamAScore = parseInt(scoreData.teamAScore ?? scoreData.teamA ?? 0, 10);
      teamBScore = parseInt(scoreData.teamBScore ?? scoreData.teamB ?? 0, 10);
    }

    const historyEntry = {
      id: `lsh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      score: { teamA: teamAScore, teamB: teamBScore },
      updatedBy: updaterName,
      isFinal: false
    };

    const newHistory = [historyEntry, ...(game.liveScoreHistory || [])];

    set({
      games: games.map(g => g.id === gameId ? {
        ...g,
        status: g.status === 'COMPLETED' ? 'COMPLETED' : 'ONGOING',
        liveScore: { teamA: teamAScore, teamB: teamBScore },
        liveScoreHistory: newHistory
      } : g)
    });

    get().addNotification({
      userId: null,
      title: `🔴 Live Match Score Updated (${teamAScore} - ${teamBScore})`,
      message: `Current live score for "${game.title}": Team A ${teamAScore} - ${teamBScore} Team B (Updated at ${historyEntry.time}).`,
      linkUrl: `/games/${gameId}`,
      clubId: game.venueReference?.clubId,
      gameId
    });

    toast.success(`Live score updated: Team A ${teamAScore} - ${teamBScore} Team B (Log saved at ${historyEntry.time})`);
  },

  submitGameScore: (gameId, scoreData, usersList, updateUsersListFn, updaterName = 'Host/Manager') => {
    const games = get().games;
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    let teamAScore = 0;
    let teamBScore = 0;

    if (typeof scoreData === 'object' && scoreData !== null) {
      teamAScore = parseInt(scoreData.teamAScore ?? scoreData.teamA ?? 0, 10);
      teamBScore = parseInt(scoreData.teamBScore ?? scoreData.teamB ?? 0, 10);
    } else {
      teamAScore = parseInt(scoreData, 10) || 0;
      teamBScore = parseInt(usersList, 10) || 0;
    }

    const isTeamAWin = teamAScore > teamBScore;
    const isDraw = teamAScore === teamBScore;

    const confirmed = game.confirmedPlayers || [];
    const teamA = confirmed.slice(0, Math.ceil(confirmed.length / 2));
    const teamB = confirmed.slice(Math.ceil(confirmed.length / 2));

    const avgEloA = teamA.reduce((sum, p) => sum + (p.elo || 1500), 0) / (teamA.length || 1);
    const avgEloB = teamB.reduce((sum, p) => sum + (p.elo || 1500), 0) / (teamB.length || 1);

    if (updateUsersListFn && typeof updateUsersListFn === 'function' && Array.isArray(usersList)) {
      const updatedUsers = usersList.map(u => {
        const inA = teamA.some(p => p.id === u.id);
        const inB = teamB.some(p => p.id === u.id);
        const isOrganizer = game.organizer?.id === u.id;

        if (inA || inB || isOrganizer) {
          const outcome = isDraw ? 0.5 : (inA ? (isTeamAWin ? 1 : 0) : (isTeamAWin ? 0 : 1));
          const oppElo = inA ? avgEloB : avgEloA;
          const currentElo = u.eloRating || u.elo || 1500;
          const newElo = (inA || inB) ? calculateNewElo(currentElo, oppElo, outcome, 32) : currentElo;
          
          const historyEntry = {
            gameId: game.id,
            title: game.title,
            date: game.dateTime?.date || new Date().toISOString().split('T')[0],
            score: `${teamAScore} - ${teamBScore}`,
            format: game.format,
            venue: game.venueReference?.clubName || 'Turf Hub',
            role: isOrganizer ? 'Host' : (inA ? 'Team A' : 'Team B')
          };

          const existingHistory = u.gameHistory || [];
          const updatedHistory = [historyEntry, ...existingHistory.filter(h => h.gameId !== game.id)];

          return {
            ...u,
            eloRating: newElo,
            elo: newElo,
            gameHistory: updatedHistory
          };
        }
        return u;
      });

      updateUsersListFn(updatedUsers);
    }

    const finalHistoryEntry = {
      id: `lsh_final_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      score: { teamA: teamAScore, teamB: teamBScore },
      updatedBy: updaterName || 'Final Result Published',
      isFinal: true
    };

    set({
      games: games.map(g => g.id === gameId ? {
        ...g,
        status: 'COMPLETED',
        score: { teamA: teamAScore, teamB: teamBScore },
        liveScore: { teamA: teamAScore, teamB: teamBScore },
        liveScoreHistory: [finalHistoryEntry, ...(g.liveScoreHistory || [])]
      } : g)
    });

    // Broadcast Notification Events 10 & 11: Game Completed & Result Published
    get().addNotification({
      userId: null,
      title: `🏆 Official Match Score Published`,
      message: `Final Score for "${game.title}": Team A ${teamAScore} - ${teamBScore} Team B. Winner: ${isDraw ? 'Draw' : (isTeamAWin ? 'Team A' : 'Team B')}.`,
      linkUrl: `/games/${gameId}`,
      clubId: game.venueReference?.clubId,
      gameId
    });

    toast.success('Match score recorded & Elo ratings updated!');
  },

  // --- BOOKING ACTIONS ---
  createBooking: (bookingData) => {
    const newBooking = {
      id: `bkg_${Date.now()}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString().split('T')[0],
      ...bookingData
    };
    set({ bookings: [newBooking, ...get().bookings] });
    return newBooking;
  },

  cancelBooking: (bookingId, reason) => {
    set({
      bookings: get().bookings.map(b => b.id === bookingId ? { ...b, status: 'REFUND_PENDING', refundTier: '100%', cancellationReason: reason } : b)
    });
  },

  // --- TOURNAMENT BRACKET ADVANCEMENT ---
  registerTeamForTournament: (tournamentId, teamData) => {
    set({
      tournaments: get().tournaments.map(t => {
        if (t.id === tournamentId) {
          const updatedTeams = [...(t.teams || []), { ...teamData, status: 'CONFIRMED' }];
          return {
            ...t,
            teams: updatedTeams,
            registeredTeamsCount: updatedTeams.length
          };
        }
        return t;
      })
    });
  },

  advanceTournamentMatch: (tournamentId, matchId, winnerTeamName, scoreStr) => {
    set({
      tournaments: get().tournaments.map(t => {
        if (t.id === tournamentId && t.brackets) {
          const qf = t.brackets.quarterFinals?.map(m => m.matchId === matchId ? { ...m, score: scoreStr, winner: winnerTeamName } : m);
          const sf = t.brackets.semiFinals?.map(m => m.matchId === matchId ? { ...m, score: scoreStr, winner: winnerTeamName } : m);
          const fn = t.brackets.finals?.map(m => m.matchId === matchId ? { ...m, score: scoreStr, winner: winnerTeamName } : m);

          let champion = t.champion;
          if (fn && fn.some(m => m.matchId === matchId && winnerTeamName)) {
            champion = winnerTeamName;
          }

          return {
            ...t,
            champion,
            brackets: { ...t.brackets, quarterFinals: qf, semiFinals: sf, finals: fn }
          };
        }
        return t;
      })
    });
    toast.success(`Winner "${winnerTeamName}" advanced in bracket!`);
  },

  // --- COMMUNITY ACTIONS ---
  addCommunityPost: (postData) => {
    const newPost = {
      id: `post_${Date.now()}`,
      likes: 0,
      comments: [],
      timestamp: 'Just now',
      ...postData
    };
    set({ communityPosts: [newPost, ...get().communityPosts] });
  },

  likePost: (postId) => {
    set({
      communityPosts: get().communityPosts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p)
    });
  },

  addComment: (postId, comment) => {
    set({
      communityPosts: get().communityPosts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)
    });
  },

  votePoll: (pollId, optionId, userId) => {
    set({
      polls: get().polls.map(p => {
        if (p.id === pollId && !p.votedUserIds?.includes(userId)) {
          return {
            ...p,
            votedUserIds: [...(p.votedUserIds || []), userId],
            options: p.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)
          };
        }
        return p;
      })
    });
  }
}),
    {
      name: 'fifa_all_stars_data_storage'
    }
  )
);

// Cross-tab Synchronization Event Listener for Real-time Data Sharing
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'fifa_all_stars_data_storage') {
      try {
        useDataStore.persist.rehydrate();
      } catch (err) {
        console.error('Error rehydrating data store across tabs:', err);
      }
    }
  });
}
