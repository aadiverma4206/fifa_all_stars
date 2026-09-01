import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Shield, ArrowLeft, Send, CheckCircle, Trophy, UserCheck, AlertTriangle, CreditCard, Lock, Play, Film, Plus, Edit2, Trash2 } from 'lucide-react';
import { useDataStore, MATCH_FORMAT_SLOTS } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const GameDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { games, gameVideos, joinGame, leaveGame, submitGameScore, updateGameLifecycle, addGameVideo, switchPlayerTeam, updateGameDetails, removeGame } = useDataStore();
  const { currentUser, updateWallet, usersList, setCurrentUser } = useAuthStore();

  const [scoreTeamA, setScoreTeamA] = useState('');
  const [scoreTeamB, setScoreTeamB] = useState('');
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('TEAM_A');

  // Edit Game Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('19:00');
  const [editEndTime, setEditEndTime] = useState('20:30');
  const [editFormat, setEditFormat] = useState('5v5');
  const [editMaxPlayers, setEditMaxPlayers] = useState('10');
  const [editEntryFee, setEditEntryFee] = useState('0');
  const [editSkill, setEditSkill] = useState('Intermediate');
  const [editPrivacy, setEditPrivacy] = useState('PUBLIC');
  const [editDescription, setEditDescription] = useState('');

  // Video Upload Form States
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4');
  const [videoDesc, setVideoDesc] = useState('');

  const game = games.find(g => g.id === id) || games[0];
  const maxSlots = game?.maxPlayers || MATCH_FORMAT_SLOTS[game?.format] || 10;
  const teamCapacity = Math.ceil(maxSlots / 2);

  const confirmedPlayers = game?.confirmedPlayers || [];
  const teamAPlayers = confirmedPlayers.filter((p, i) => p.team === 'TEAM_A' || (!p.team && i < teamCapacity));
  const teamBPlayers = confirmedPlayers.filter((p, i) => p.team === 'TEAM_B' || (!p.team && i >= teamCapacity));

  const spotsLeft = Math.max(0, maxSlots - confirmedPlayers.length);
  const isConfirmed = confirmedPlayers.some(p => p.id === currentUser?.id);
  const isWaitlisted = game?.waitlist?.some(p => p.id === currentUser?.id);
  const waitlistIndex = game?.waitlist?.findIndex(p => p.id === currentUser?.id);
  const isFull = confirmedPlayers.length >= maxSlots || game?.status === 'FULL';
  
  // Authorization check for Match Management Rights (Host, Manager or Super Admin)
  const isAuthorizedManager = currentUser?.role === 'CLUB_MANAGER' || currentUser?.role === 'SUPER_ADMIN' || game?.organizer?.id === currentUser?.id;

  const handleOpenEditModal = () => {
    setEditTitle(game.title || '');
    setEditDate(game.dateTime?.date || '');
    setEditStartTime(game.dateTime?.startTime || '19:00');
    setEditEndTime(game.dateTime?.endTime || '20:30');
    setEditFormat(game.format || '5v5');
    setEditMaxPlayers(String(game.maxPlayers || 10));
    setEditEntryFee(String(game.entryFee || 0));
    setEditSkill(game.skill || 'Intermediate');
    setEditPrivacy(game.privacy || 'PUBLIC');
    setEditDescription(game.description || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditGame = (e) => {
    e.preventDefault();
    if (!editTitle || !editTitle.trim()) {
      toast.error('Game Name cannot be empty.');
      return;
    }

    if (editStartTime && editEndTime && editStartTime >= editEndTime) {
      toast.error('End Time must be after Start Time!');
      return;
    }

    const feeVal = parseFloat(editEntryFee) || 0;
    if (feeVal < 0) {
      toast.error('Entry fee cannot be negative.');
      return;
    }

    const computedSlots = parseInt(editMaxPlayers, 10) || MATCH_FORMAT_SLOTS[editFormat] || 10;

    updateGameDetails(game.id, {
      title: editTitle.trim(),
      format: editFormat,
      maxPlayers: computedSlots,
      entryFee: feeVal,
      skill: editSkill,
      privacy: editPrivacy,
      dateTime: {
        date: editDate,
        startTime: editStartTime,
        endTime: editEndTime
      },
      description: editDescription.trim()
    });

    setIsEditModalOpen(false);
  };

  const matchVideo = gameVideos.find(v => v.gameId === game.id);

  const handleOpenPaymentModal = () => {
    if (!currentUser) {
      toast.error('Please sign in to join pick-up matches.');
      navigate('/login');
      return;
    }
    if (currentUser.role === 'CLUB_MANAGER') {
      toast.error('Club Managers are not allowed to join games as players.');
      return;
    }
    // Default to the team with fewer players if needed
    if (teamAPlayers.length >= teamCapacity && teamBPlayers.length < teamCapacity) {
      setSelectedTeam('TEAM_B');
    } else {
      setSelectedTeam('TEAM_A');
    }
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPaymentAndJoin = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const fee = game.entryFee || 0;

    if (fee > 0 && (currentUser.walletBalance || 0) < fee) {
      toast.error(`Insufficient wallet balance! Match fee is ₹${fee}. Top up in Profile.`);
      return;
    }

    const res = joinGame(game.id, currentUser, selectedTeam);

    if (res.success) {
      if (fee > 0) {
        updateWallet(-fee, `Entry Fee: ${game.title}`);
      }
      toast.success(`Payment confirmed! ${res.message}`);
      setIsPaymentModalOpen(false);
    } else {
      toast.error(res.message);
      setIsPaymentModalOpen(false);
    }
  };

  const handleLeaveMatch = () => {
    leaveGame(game.id, currentUser.id);
    if (game.entryFee > 0) {
      updateWallet(game.entryFee, `Refund: Left match ${game.title}`);
    }
    toast.success(`Left match roster. ₹${game.entryFee} refunded to your wallet!`);
  };

  const handleStartMatch = () => {
    updateGameLifecycle(game.id, 'ONGOING');
  };

  const handleCompleteGame = () => {
    if (game.status !== 'COMPLETED') {
      updateGameLifecycle(game.id, 'COMPLETED');
      toast.success(`Match "${game.title}" marked as COMPLETED & moved to Match History!`);
    }
    if (!game.score) {
      handleOpenScoreModal();
    }
  };

  const handleOpenScoreModal = () => {
    if (game?.score) {
      setScoreTeamA(game.score.teamA !== undefined ? String(game.score.teamA) : '');
      setScoreTeamB(game.score.teamB !== undefined ? String(game.score.teamB) : '');
    } else {
      setScoreTeamA('');
      setScoreTeamB('');
    }
    setIsScoreModalOpen(true);
  };

  const handleSubmitScore = (e) => {
    e.preventDefault();

    if (scoreTeamA === '' || scoreTeamA === null || scoreTeamB === '' || scoreTeamB === null) {
      toast.error('Please enter goals for both Team A and Team B.');
      return;
    }

    const scoreA = parseInt(scoreTeamA, 10);
    const scoreB = parseInt(scoreTeamB, 10);

    if (isNaN(scoreA) || scoreA < 0 || scoreA > 99) {
      toast.error('Team A goals must be a valid number between 0 and 99.');
      return;
    }

    if (isNaN(scoreB) || scoreB < 0 || scoreB > 99) {
      toast.error('Team B goals must be a valid number between 0 and 99.');
      return;
    }

    submitGameScore(game.id, { teamAScore: scoreA, teamBScore: scoreB }, usersList, (updatedUsers) => {
      if (currentUser?.id) {
        const myUpdated = updatedUsers?.find(u => u.id === currentUser.id);
        if (myUpdated) setCurrentUser(myUpdated);
      }
    });

    setIsScoreModalOpen(false);
  };

  const handleAddVideoSubmit = (e) => {
    e.preventDefault();
    if (!videoTitle || !videoTitle.trim()) {
      toast.error('Video title is required.');
      return;
    }

    if (!videoUrl || !videoUrl.trim()) {
      toast.error('Video URL is required.');
      return;
    }

    addGameVideo({
      gameId: game.id,
      clubId: game.venueReference?.clubId,
      courtId: game.venueReference?.courtId,
      title: videoTitle.trim(),
      videoUrl: videoUrl.trim(),
      description: videoDesc.trim() || 'Official match footage',
      uploadedBy: `${currentUser.name} (${currentUser.role})`
    });

    setIsVideoModalOpen(false);
    setVideoTitle('');
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      
      {/* Back button */}
      <BackButton fallback="/player/find-games" label="Back to All Pick-Up Games" />

      {/* Main Banner Header */}
      <div className="footy-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'}>{game.format}</Badge>
              <Badge variant={game.privacy === 'PRIVATE' ? 'danger' : 'gold'}>
                {game.privacy || 'PUBLIC'}
              </Badge>
              
              {game.status === 'ONGOING' ? (
                <Badge variant="danger" size="sm">🔥 MATCH IN PROGRESS (ONGOING)</Badge>
              ) : game.status === 'COMPLETED' ? (
                <Badge variant="emerald" size="sm">🏆 MATCH COMPLETED</Badge>
              ) : (
                <Badge variant={isFull ? 'danger' : 'emerald'} size="sm">
                  {isFull ? 'ROSTER FULL' : `${spotsLeft} Slots Available`}
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase">
              {game.title}
            </h1>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-sport-500 flex-shrink-0" />
              <span>{game.venueReference?.clubName} • {game.venueReference?.courtName || 'Pitch Alpha'} ({game.venueReference?.city})</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">Entry Fee</span>
            <span className="text-3xl font-black text-sport-500">
              ₹{game.entryFee}
            </span>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <div>
            <span className="block text-slate-400 font-semibold">Date</span>
            <span className="text-slate-900 dark:text-white">{game.dateTime?.date}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-semibold">Time Slot</span>
            <span className="text-slate-900 dark:text-white">{game.dateTime?.startTime} - {game.dateTime?.endTime || '20:30'}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-semibold">Format Capacity</span>
            <span className="text-sport-500 font-black">{game.format} ({maxSlots} Slots)</span>
          </div>
          <div>
            <span className="block text-slate-400 font-semibold">Roster Occupancy</span>
            <span className="text-slate-900 dark:text-white">{confirmedPlayers.length} Joined / {spotsLeft} Open</span>
          </div>
          <div>
            <span className="block text-slate-400 font-semibold">Host / Venue</span>
            <span className="text-slate-900 dark:text-white">{game.organizer?.name}</span>
          </div>
        </div>

        {/* Scoreboard if Completed or Score Recorded */}
        {game.score && (() => {
          const outcomeInfo = (() => {
            const teamA = parseInt(game.score.teamA, 10);
            const teamB = parseInt(game.score.teamB, 10);
            const isDraw = teamA === teamB;
            const teamAWon = teamA > teamB;

            const playerIndex = confirmedPlayers.findIndex(p => p.id === currentUser?.id);
            if (currentUser && playerIndex !== -1) {
              const playerObj = confirmedPlayers[playerIndex];
              let playerTeam = playerObj.team;
              if (!playerTeam) {
                playerTeam = playerIndex < teamCapacity ? 'TEAM_A' : 'TEAM_B';
              }

              if (isDraw) return { text: '🤝 RESULT: DRAW', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
              
              const won = (playerTeam === 'TEAM_A' && teamAWon) || (playerTeam === 'TEAM_B' && !teamAWon);
              if (won) {
                return { text: '🎉 VICTORY! YOU WON THIS MATCH', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
              } else {
                return { text: '❌ DEFEAT: YOU LOST THIS MATCH', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
              }
            }

            if (isDraw) return { text: '🏆 MATCH RESULT: DRAW', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
            return {
              text: `🏆 WINNER: ${teamAWon ? 'TEAM A' : 'TEAM B'}`,
              color: teamAWon ? 'text-sky-400' : 'text-rose-400',
              border: teamAWon ? 'border-sky-500/30' : 'border-rose-500/30',
              bg: teamAWon ? 'bg-sky-500/10' : 'bg-rose-500/10'
            };
          })();

          return (
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 text-white space-y-3 border border-amber-500/30 text-center shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase text-amber-400 tracking-widest">OFFICIAL MATCH SCORE RESULT</span>
              </div>

              <div className="flex items-center justify-center space-x-8 py-2">
                <div className="text-center">
                  <span className="text-xs font-extrabold text-slate-400 block uppercase mb-1">TEAM A</span>
                  <span className="text-5xl font-black text-white">{game.score.teamA}</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-xl font-black text-amber-500">VS</span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-extrabold text-slate-400 block uppercase mb-1">TEAM B</span>
                  <span className="text-5xl font-black text-white">{game.score.teamB}</span>
                </div>
              </div>

              <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full ${outcomeInfo.bg} border ${outcomeInfo.border} ${outcomeInfo.color} text-xs font-black`}>
                <span>{outcomeInfo.text}</span>
                <span>•</span>
                <span>⚡ Elo Recalculated</span>
              </div>
            </div>
          );
        })()}

        {/* Description & Rules */}
        {game.description && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-black text-slate-900 dark:text-white uppercase block mb-1">Match Rules & Guidance:</span>
            <p>{game.description}</p>
          </div>
        )}

        {/* Status Alert Banner if Waitlisted */}
        {isWaitlisted && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>You are currently <strong>#{waitlistIndex + 1}</strong> on the waitlist. If a confirmed player leaves, you will be promoted automatically!</span>
            </div>
          </div>
        )}

        {/* AUTHORIZED MANAGEMENT CONTROLS & PLAYER JOIN BAR */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          
          {/* Authorized Management Toolbar for Manager & Admin */}
          {isAuthorizedManager && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Authorized Match Management Controls ({currentUser?.role})</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {game.status !== 'ONGOING' && game.status !== 'COMPLETED' && (
                  <Button variant="primary" size="sm" icon={Play} onClick={handleStartMatch}>
                    Start Match (Set ONGOING)
                  </Button>
                )}

                {game.status !== 'COMPLETED' ? (
                  <Button variant="emerald" size="sm" icon={CheckCircle} onClick={handleCompleteGame}>
                    🏁 Complete & Archive Game
                  </Button>
                ) : (
                  <Link to="/history">
                    <Button variant="emerald" size="sm" icon={Trophy}>
                      🏆 View in Match History
                    </Button>
                  </Link>
                )}

                <Button variant="gold" size="sm" icon={Trophy} onClick={handleOpenScoreModal}>
                  {game.score ? 'Edit / Update Match Score' : 'Record Live Score & Result'}
                </Button>

                <Button variant="outline" size="sm" icon={Edit2} onClick={handleOpenEditModal} className="border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10">
                  Edit Game Details
                </Button>

                <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsVideoModalOpen(true)}>
                  Link Match Video Reference
                </Button>

                <Button 
                  variant="danger" 
                  size="sm" 
                  icon={Trash2} 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to cancel and remove game session "${game.title}"?`)) {
                      removeGame(game.id, 'Cancelled by venue manager');
                      toast.success(`Game session "${game.title}" removed!`);
                      navigate('/games');
                    }
                  }}
                >
                  Cancel & Remove Session
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Wallet Balance: <span className="text-amber-500 font-black">₹{currentUser?.walletBalance?.toFixed(2)}</span>
            </div>

            <div className="flex items-center space-x-3">
              {currentUser?.role === 'CLUB_MANAGER' ? (
                <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Club Managers cannot join games as players or occupy player slots</span>
                </div>
              ) : isConfirmed || isWaitlisted ? (
                <Button variant="danger" size="md" onClick={handleLeaveMatch}>
                  Leave Match & Refund ₹{game.entryFee}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={CheckCircle}
                  onClick={handleOpenPaymentModal}
                  disabled={game.status === 'COMPLETED'}
                >
                  {isFull ? `Join Waitlist (₹${game.entryFee})` : `Join Game (₹${game.entryFee})`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TEAM A vs TEAM B ROSTER SPLIT GRID */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2 uppercase">
          <Users className="w-5 h-5 text-sport-500" />
          <span>Match Lineups: Team A vs Team B ({confirmedPlayers.length}/{maxSlots} Slots)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TEAM A ROSTER */}
          <div className="footy-card p-5 space-y-4 border-l-4 border-l-sky-500">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-black text-sm text-sky-500 uppercase tracking-wider">TEAM A LINEUP</h4>
                <Badge variant="blue" size="sm">{teamAPlayers.length} / {teamCapacity} Players</Badge>
              </div>
              
              {currentUser && currentUser.role !== 'CLUB_MANAGER' && (
                isConfirmed ? (
                  teamBPlayers.some(p => p.id === currentUser.id) && teamAPlayers.length < teamCapacity && (
                    <button
                      type="button"
                      onClick={() => switchPlayerTeam(game.id, currentUser.id, 'TEAM_A')}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-extrabold text-[11px] hover:bg-sky-500 hover:text-white transition-all cursor-pointer"
                    >
                      ⚡ Switch to Team A
                    </button>
                  )
                ) : (
                  !isWaitlisted && teamAPlayers.length < teamCapacity && (
                    <button
                      type="button"
                      onClick={() => { setSelectedTeam('TEAM_A'); handleOpenPaymentModal(); }}
                      className="px-2.5 py-1 rounded-lg bg-sky-500 text-white font-extrabold text-[11px] hover:bg-sky-600 shadow-sm transition-all cursor-pointer"
                    >
                      + Join Team A
                    </button>
                  )
                )
              )}
            </div>

            <div className="space-y-2">
              {teamAPlayers.length > 0 ? (
                teamAPlayers.map((player, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Avatar src={player.avatar} name={player.name} size="sm" />
                      <div>
                        <span className="font-black text-slate-900 dark:text-white block">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{player.position || 'ST'}</span>
                      </div>
                    </div>
                    <Badge variant={player.id === game.organizer?.id ? 'gold' : 'emerald'} size="sm">
                      {player.id === game.organizer?.id ? 'Host' : 'Confirmed'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No players assigned to Team A yet</p>
              )}
            </div>
          </div>

          {/* TEAM B ROSTER */}
          <div className="footy-card p-5 space-y-4 border-l-4 border-l-rose-500">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-black text-sm text-rose-500 uppercase tracking-wider">TEAM B LINEUP</h4>
                <Badge variant="danger" size="sm">{teamBPlayers.length} / {teamCapacity} Players</Badge>
              </div>

              {currentUser && currentUser.role !== 'CLUB_MANAGER' && (
                isConfirmed ? (
                  teamAPlayers.some(p => p.id === currentUser.id) && teamBPlayers.length < teamCapacity && (
                    <button
                      type="button"
                      onClick={() => switchPlayerTeam(game.id, currentUser.id, 'TEAM_B')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                    >
                      ⚡ Switch to Team B
                    </button>
                  )
                ) : (
                  !isWaitlisted && teamBPlayers.length < teamCapacity && (
                    <button
                      type="button"
                      onClick={() => { setSelectedTeam('TEAM_B'); handleOpenPaymentModal(); }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-[11px] hover:bg-rose-600 shadow-sm transition-all cursor-pointer"
                    >
                      + Join Team B
                    </button>
                  )
                )
              )}
            </div>

            <div className="space-y-2">
              {teamBPlayers.length > 0 ? (
                teamBPlayers.map((player, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Avatar src={player.avatar} name={player.name} size="sm" />
                      <div>
                        <span className="font-black text-slate-900 dark:text-white block">{player.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{player.position || 'MID'}</span>
                      </div>
                    </div>
                    <Badge variant="emerald" size="sm">Confirmed</Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No players assigned to Team B yet</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MATCH VIDEO PLAYER SECTION */}
      {matchVideo && (
        <div className="footy-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <Film className="w-5 h-5 text-sky-500" />
              <span>Official Match Video Highlights</span>
            </h3>
            <Badge variant="emerald" size="sm">{matchVideo.videoStatus}</Badge>
          </div>

          <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center border border-slate-800">
            <video
              src={matchVideo.videoUrl}
              controls
              className="w-full h-full object-cover"
              poster="/src/assets/images/courts/court-1.jpg"
            />
          </div>

          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white">{matchVideo.title}</h4>
            <p className="text-slate-400 font-semibold">{matchVideo.description}</p>
            <span className="text-[10px] font-bold text-slate-500 block pt-1">Uploaded by: {matchVideo.uploadedBy} • {matchVideo.uploadDate}</span>
          </div>
        </div>
      )}

      {/* PAYMENT-BEFORE-CONFIRMED-SLOT MODAL */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Confirm Payment & Secure Player Slot">
        <form onSubmit={handleConfirmPaymentAndJoin} className="space-y-4 text-xs font-bold">
          
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-900 dark:text-white font-black text-sm">
              <span>{game.title}</span>
              <Badge variant="emerald" size="sm">{game.format}</Badge>
            </div>
            <p className="text-slate-400 text-[11px]">
              {game.venueReference?.clubName} • {game.dateTime?.date} ({game.dateTime?.startTime}-{game.dateTime?.endTime || '20:30'})
            </p>
          </div>

          {/* TEAM SELECTION CHOICE */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200">
              Select Team Roster *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={teamAPlayers.length >= teamCapacity}
                onClick={() => setSelectedTeam('TEAM_A')}
                className={`p-3 rounded-xl border font-extrabold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedTeam === 'TEAM_A'
                    ? 'bg-sky-500 text-white border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                } ${teamAPlayers.length >= teamCapacity ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="font-black text-sm">Team A Lineup</span>
                <span className="text-[10px] mt-0.5">{teamAPlayers.length} / {teamCapacity} Players {teamAPlayers.length >= teamCapacity ? '(Full)' : ''}</span>
              </button>

              <button
                type="button"
                disabled={teamBPlayers.length >= teamCapacity}
                onClick={() => setSelectedTeam('TEAM_B')}
                className={`p-3 rounded-xl border font-extrabold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedTeam === 'TEAM_B'
                    ? 'bg-rose-500 text-white border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                } ${teamBPlayers.length >= teamCapacity ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="font-black text-sm">Team B Lineup</span>
                <span className="text-[10px] mt-0.5">{teamBPlayers.length} / {teamCapacity} Players {teamBPlayers.length >= teamCapacity ? '(Full)' : ''}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Match Entry Fee:</span>
              <span className="font-black text-slate-900 dark:text-white">₹{game.entryFee}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Your Current Wallet Balance:</span>
              <span className="font-black text-amber-500">₹{currentUser?.walletBalance?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Remaining Balance After Payment:</span>
              <span className={(currentUser?.walletBalance || 0) >= game.entryFee ? 'text-emerald-500' : 'text-rose-500'}>
                ₹{((currentUser?.walletBalance || 0) - game.entryFee).toFixed(2)}
              </span>
            </div>
          </div>

          {(currentUser?.walletBalance || 0) < game.entryFee ? (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] font-bold">
              Insufficient wallet balance! Please top up your wallet in Profile to secure this slot.
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center space-x-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Payment authorization will instantly confirm your player slot in the match roster.</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={CreditCard}
              disabled={(currentUser?.walletBalance || 0) < game.entryFee}
            >
              Pay ₹{game.entryFee} & Confirm Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter Match Score Modal */}
      <Modal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} title="Record Match Outcome & Recalculate Elo">
        <form onSubmit={handleSubmitScore} className="space-y-4 text-xs font-bold">
          <p className="text-slate-400 font-semibold">
            Entering the final score will trigger standard Elo rating calculations (K=32 factor) for all confirmed players and update match status to COMPLETED.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team A Goals</label>
              <input
                type="number"
                min="0"
                max="99"
                placeholder=""
                value={scoreTeamA}
                onChange={(e) => setScoreTeamA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-black text-center"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team B Goals</label>
              <input
                type="number"
                min="0"
                max="99"
                placeholder=""
                value={scoreTeamB}
                onChange={(e) => setScoreTeamB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-black text-center"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsScoreModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm">
              Confirm Score & Publish Result
            </Button>
          </div>
        </form>
      </Modal>

      {/* Link Match Video Reference Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title="Link Match Video Footage">
        <form onSubmit={handleAddVideoSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Video Title</label>
            <input
              type="text"
              placeholder="e.g. Full Match Highlights - Pitch 1"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Video MP4 / Embed Stream URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Video Description / Highlights</label>
            <textarea
              rows="2"
              placeholder="Key goals, saves, penalty shootout footage..."
              value={videoDesc}
              onChange={(e) => setVideoDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsVideoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Film}>
              Upload & Link Match Video
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT GAME DETAILS MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Game Details" maxWidth="max-w-2xl">
        <form onSubmit={handleSaveEditGame} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <p className="text-slate-500 dark:text-slate-400 -mt-3 text-[11px]">
            Update match details, format, timings, entry fee, or match rules.
          </p>

          {/* Game Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Game Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Date, Start Time, End Time (3 Cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Format & Skill Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Game Type / Format <span className="text-rose-500">*</span>
              </label>
              <select
                value={editFormat}
                onChange={(e) => {
                  setEditFormat(e.target.value);
                  if (MATCH_FORMAT_SLOTS[e.target.value]) {
                    setEditMaxPlayers(String(MATCH_FORMAT_SLOTS[e.target.value]));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                required
              >
                <option value="1v1">1v1 (2 Players - Singles)</option>
                <option value="2v2">2v2 (4 Players - Doubles)</option>
                <option value="3v3">3v3 (6 Players)</option>
                <option value="4v4">4v4 (8 Players)</option>
                <option value="5v5">5v5 (10 Players)</option>
                <option value="6v6">6v6 (12 Players)</option>
                <option value="7v7">7v7 (14 Players)</option>
                <option value="8v8">8v8 (16 Players)</option>
                <option value="11v11">11v11 (22 Players)</option>
                <option value="custom">Custom Format</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Skill Level
              </label>
              <select
                value={editSkill}
                onChange={(e) => setEditSkill(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner Friendly</option>
                <option value="Advanced">Advanced / Competitive</option>
                <option value="All Levels">All Levels Welcome</option>
              </select>
            </div>
          </div>

          {/* Max Players, Fee, Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Max Players <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={editMaxPlayers}
                onChange={(e) => setEditMaxPlayers(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Entry Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={editEntryFee}
                onChange={(e) => setEditEntryFee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Privacy
              </label>
              <select
                value={editPrivacy}
                onChange={(e) => setEditPrivacy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Match Description / Rules
            </label>
            <textarea
              rows="3"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GameDetailsPage;
