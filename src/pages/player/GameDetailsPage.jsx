import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Shield, ArrowLeft, Send, CheckCircle, Trophy, UserCheck, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const GameDetailsPage = () => {
  const { id } = useParams();
  const { games, joinGame, leaveGame, submitGameScore } = useDataStore();
  const { currentUser, updateWallet, usersList, setCurrentUser } = useAuthStore();

  const [scoreTeamA, setScoreTeamA] = useState('3');
  const [scoreTeamB, setScoreTeamB] = useState('2');
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  const game = games.find(g => g.id === id) || games[0];
  const isConfirmed = game?.confirmedPlayers?.some(p => p.id === currentUser?.id);
  const isWaitlisted = game?.waitlist?.some(p => p.id === currentUser?.id);
  const waitlistIndex = game?.waitlist?.findIndex(p => p.id === currentUser?.id);
  const isFull = (game?.confirmedPlayers?.length || 0) >= game?.maxPlayers;
  const isOrganizer = game?.organizer?.id === currentUser?.id;

  const handleJoinMatch = () => {
    if (!currentUser) return;
    
    if (currentUser.walletBalance < game.entryFee) {
      toast.error(`Insufficient wallet balance! Match fee is ₹${game.entryFee}. Top up in Profile.`);
      return;
    }

    const res = joinGame(game.id, currentUser);

    if (res.success) {
      updateWallet(-game.entryFee);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleLeaveMatch = () => {
    leaveGame(game.id, currentUser.id);
    updateWallet(game.entryFee);
    toast.success(`Left match roster. ₹${game.entryFee} refunded to your wallet!`);
  };

  const handleSubmitScore = (e) => {
    e.preventDefault();
    const scoreA = parseInt(scoreTeamA, 10);
    const scoreB = parseInt(scoreTeamB, 10);

    submitGameScore(game.id, { teamAScore: scoreA, teamBScore: scoreB }, usersList, (updatedUsers) => {
      const myUpdated = updatedUsers.find(u => u.id === currentUser.id);
      if (myUpdated) setCurrentUser(myUpdated);
    });

    setIsScoreModalOpen(false);
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      
      {/* Back button */}
      <Link to="/games" className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-sport-500 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Pick-Up Games</span>
      </Link>

      {/* Main Banner Header */}
      <div className="footy-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'}>{game.format}</Badge>
              <Badge variant={isFull ? 'danger' : 'gold'}>
                {isFull ? 'ROSTER FULL' : `${game.maxPlayers - (game.confirmedPlayers?.length || 0)} Slots Open`}
              </Badge>
              <Badge variant="blue">{game.skill}</Badge>
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase">
              {game.title}
            </h1>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-sport-500 flex-shrink-0" />
              <span>{game.venueReference?.clubName} • {game.venueReference?.courtName} ({game.venueReference?.city})</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">Entry Fee</span>
            <span className="text-3xl font-black text-sport-500">
              ₹{game.entryFee}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <div>
            <span className="block text-slate-400 font-semibold">Date</span>
            <span className="text-slate-900 dark:text-white">{game.dateTime?.date}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-semibold">Time Slot</span>
            <span className="text-slate-900 dark:text-white">{game.dateTime?.startTime} - {game.dateTime?.endTime}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-semibold">Confirmed Players</span>
            <span className="text-slate-900 dark:text-white">{game.confirmedPlayers?.length} / {game.maxPlayers}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-semibold">Host / Organizer</span>
            <span className="text-slate-900 dark:text-white">{game.organizer?.name}</span>
          </div>
        </div>

        {/* Status Alert Banner if Waitlisted */}
        {isWaitlisted && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>You are currently <strong>#{waitlistIndex + 1}</strong> on the automated waitlist queue. If a player leaves, you will be promoted automatically!</span>
            </div>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Wallet Balance: <span className="text-amber-500 font-black">₹{currentUser?.walletBalance?.toFixed(2)}</span>
          </div>

          <div className="flex items-center space-x-3">
            {isOrganizer && game.status !== 'COMPLETED' && (
              <Button variant="gold" size="md" icon={Trophy} onClick={() => setIsScoreModalOpen(true)}>
                Enter Match Score & Update Elo
              </Button>
            )}

            {isConfirmed || isWaitlisted ? (
              <Button variant="danger" size="md" onClick={handleLeaveMatch}>
                Leave Match & Refund ₹{game.entryFee}
              </Button>
            ) : (
              <Button variant="primary" size="md" icon={CheckCircle} onClick={handleJoinMatch}>
                {isFull ? `Join Waitlist (₹${game.entryFee})` : `Confirm Join Match (₹${game.entryFee})`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Roster & Queue Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-sport-500" />
          <span>Confirmed Match Roster ({game.confirmedPlayers?.length}/{game.maxPlayers})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {game.confirmedPlayers?.map((player, idx) => (
            <div key={idx} className="footy-card p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar src={player.avatar} name={player.name} size="sm" />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{player.name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold">{player.position || 'MID'}</span>
                </div>
              </div>
              <Badge variant={player.id === game.organizer?.id ? 'gold' : 'emerald'} size="sm">
                {player.id === game.organizer?.id ? 'Host' : 'Confirmed'}
              </Badge>
            </div>
          ))}
        </div>

        {game.waitlist?.length > 0 && (
          <div className="space-y-3 pt-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Automated Waitlist Queue ({game.waitlist.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {game.waitlist.map((wPlayer, idx) => (
                <div key={idx} className="footy-card p-3 rounded-2xl flex items-center justify-between opacity-80 border-amber-500/30">
                  <div className="flex items-center space-x-3">
                    <Avatar src={wPlayer.avatar} name={wPlayer.name} size="sm" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{wPlayer.name}</span>
                  </div>
                  <Badge variant="waitlist" size="sm">Waitlist #{idx + 1}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enter Match Score Modal */}
      <Modal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} title="Record Match Outcome & Recalculate Elo">
        <form onSubmit={handleSubmitScore} className="space-y-4 text-xs font-bold">
          <p className="text-slate-400 font-semibold">
            Entering the final score will trigger standard Elo rating calculations (K=32 factor) for all confirmed players.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team A Goals</label>
              <input
                type="number"
                value={scoreTeamA}
                onChange={(e) => setScoreTeamA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-black text-center"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team B Goals</label>
              <input
                type="number"
                value={scoreTeamB}
                onChange={(e) => setScoreTeamB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-black text-center"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsScoreModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm">
              Confirm Score & Update Ratings
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GameDetailsPage;
