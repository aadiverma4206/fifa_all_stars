import { create } from 'zustand';
import { dummyClubs } from '../data/dummyClubs';
import { dummyCourts } from '../data/dummyCourts';
import { dummyGames } from '../data/dummyGames';
import { dummyTournaments } from '../data/dummyTournaments';
import { dummyCommunityPosts, dummyPolls, dummyChallenges } from '../data/dummyCommunity';
import { calculateNewElo } from '../utils/eloCalculator';
import toast from 'react-hot-toast';

export const useDataStore = create((set, get) => ({
  clubs: dummyClubs,
  courts: dummyCourts,
  games: dummyGames,
  tournaments: dummyTournaments,
  communityPosts: dummyCommunityPosts,
  polls: dummyPolls,
  challenges: dummyChallenges,
  
  // Audit Logs Array (Read-only timestamped admin activity log)
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
      createdAt: "2026-08-25"
    },
    {
      id: "tk-102",
      subject: "Score dispute in Raipur 5v5 league match",
      user: "Arjun Mehta",
      status: "ASSIGNED",
      assignedStaff: "Vikram Sethi (Ops)",
      priority: "MEDIUM",
      createdAt: "2026-08-24"
    },
    {
      id: "tk-103",
      subject: "Floodlight outage feedback at Silicon Turf Hub",
      user: "Ananya Iyer",
      status: "RESOLVED",
      assignedStaff: "Kavita Rao (Finance)",
      priority: "LOW",
      createdAt: "2026-08-22"
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
      createdAt: "2026-08-26"
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
      date: "2026-08-29",
      startTime: "19:00",
      endTime: "20:30",
      amountPaid: 750,
      status: "REFUND_PENDING",
      refundTier: "100%",
      cancellationReason: "User cancelled > 24h prior",
      createdAt: "2026-08-25"
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
      date: "2026-08-26",
      startTime: "20:00",
      endTime: "21:30",
      amountPaid: 1050,
      status: "CONFIRMED",
      createdAt: "2026-08-24"
    }
  ],

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

    // Refund reversal into user's wallet
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

  updatePricingSettings: (courtId, pricingData) => {
    set({
      courts: get().courts.map(c => (c.courtId === courtId || c.id === courtId) ? { ...c, ...pricingData } : c)
    });
    toast.success('Peak pricing multipliers updated!');
  },

  // --- GAME ACTIONS & WAITLIST PROMOTION ---
  joinGame: (gameId, player) => {
    const games = get().games;
    const targetGame = games.find(g => g.id === gameId);
    if (!targetGame) return { success: false, message: 'Game not found' };

    const isAlreadyConfirmed = targetGame.confirmedPlayers?.some(p => p.id === player.id);
    const isAlreadyWaitlisted = targetGame.waitlist?.some(p => p.id === player.id);

    if (isAlreadyConfirmed || isAlreadyWaitlisted) {
      return { success: false, message: 'You are already registered for this game!' };
    }

    const currentCount = targetGame.confirmedPlayers?.length || 0;
    const isFull = currentCount >= targetGame.maxPlayers;

    if (!isFull) {
      const newConfirmed = [...(targetGame.confirmedPlayers || []), {
        id: player.id,
        name: player.name,
        avatar: player.profileImageUrl || player.avatar,
        position: player.playingHand?.split('/')[1]?.trim() || 'MID'
      }];

      const newStatus = newConfirmed.length >= targetGame.maxPlayers ? 'FULL' : 'OPEN_FOR_JOINING';

      set({
        games: games.map(g => g.id === gameId ? {
          ...g,
          confirmedPlayers: newConfirmed,
          status: newStatus
        } : g)
      });
      return { success: true, promoted: false, message: 'Successfully joined match roster!' };
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

  leaveGame: (gameId, userId) => {
    const games = get().games;
    const targetGame = games.find(g => g.id === gameId);
    if (!targetGame) return;

    const wasConfirmed = targetGame.confirmedPlayers?.some(p => p.id === userId);
    let newConfirmed = targetGame.confirmedPlayers?.filter(p => p.id !== userId) || [];
    let newWaitlist = [...(targetGame.waitlist || [])];
    let promotedPlayer = null;

    if (wasConfirmed && newWaitlist.length > 0) {
      promotedPlayer = newWaitlist.shift();
      newConfirmed.push(promotedPlayer);
    }

    const newStatus = newConfirmed.length >= targetGame.maxPlayers ? 'FULL' : 'OPEN_FOR_JOINING';

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
    }
  },

  createGame: (newGameData) => {
    const newGame = {
      id: `gam_${Date.now()}`,
      status: 'OPEN_FOR_JOINING',
      confirmedPlayers: [newGameData.organizer],
      waitlist: [],
      score: null,
      ...newGameData
    };
    set({ games: [newGame, ...get().games] });
    return newGame;
  },

  submitGameScore: (gameId, scoreData, usersList, updateUsersListFn) => {
    const games = get().games;
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const { teamAScore, teamBScore } = scoreData;
    const isTeamAWin = teamAScore > teamBScore;
    const isDraw = teamAScore === teamBScore;

    const confirmed = game.confirmedPlayers || [];
    const teamA = confirmed.slice(0, Math.ceil(confirmed.length / 2));
    const teamB = confirmed.slice(Math.ceil(confirmed.length / 2));

    const avgEloA = teamA.reduce((sum, p) => sum + (p.elo || 1500), 0) / (teamA.length || 1);
    const avgEloB = teamB.reduce((sum, p) => sum + (p.elo || 1500), 0) / (teamB.length || 1);

    if (updateUsersListFn && usersList) {
      const updatedUsers = usersList.map(u => {
        const inA = teamA.some(p => p.id === u.id);
        const inB = teamB.some(p => p.id === u.id);

        if (inA || inB) {
          const outcome = isDraw ? 0.5 : (inA ? (isTeamAWin ? 1 : 0) : (isTeamAWin ? 0 : 1));
          const oppElo = inA ? avgEloB : avgEloA;
          const currentElo = u.eloRating || u.elo || 1500;
          const newElo = calculateNewElo(currentElo, oppElo, outcome, 32);
          
          return {
            ...u,
            eloRating: newElo,
            elo: newElo
          };
        }
        return u;
      });

      updateUsersListFn(updatedUsers);
    }

    set({
      games: games.map(g => g.id === gameId ? {
        ...g,
        status: 'COMPLETED',
        score: { teamA: teamAScore, teamB: teamBScore }
      } : g)
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
}));
