import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Award, Shield, ArrowLeft, Plus } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const TournamentDetailsPage = () => {
  const { id } = useParams();
  const { tournaments, registerTeamForTournament } = useDataStore();
  const { currentUser, updateWallet } = useAuthStore();

  const tournament = tournaments.find(t => t.id === id) || tournaments[0];
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState(currentUser?.name || 'Arjun Mehta');
  const [teamLogo, setTeamLogo] = useState('⚽');

  const handleRegisterTeam = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to register your squad for this tournament.');
      return;
    }
    if (!teamName || !teamName.trim()) {
      toast.error('Please enter a valid squad name.');
      return;
    }

    const fee = parseFloat(tournament.entryFee) || 0;
    if (fee > 0 && (currentUser.walletBalance || 0) < fee) {
      toast.error(`Insufficient wallet balance! Entry fee is ₹${fee}, but your balance is ₹${currentUser.walletBalance?.toFixed(2)}. Please top up your wallet.`);
      return;
    }

    if (fee > 0 && updateWallet) {
      updateWallet(-fee, `Tournament Entry: ${tournament.title}`);
    }

    registerTeamForTournament(tournament.id, {
      id: `tm_${Date.now()}`,
      name: teamName.trim(),
      captain: captainName.trim() || currentUser.name,
      logo: teamLogo
    });

    toast.success(`Squad "${teamName}" registered for ${tournament.title}!`);
    setIsRegisterModalOpen(false);
    setTeamName('');
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      
      <BackButton fallback="/player/tournaments" label="Back to Tournaments" />

      <div className="relative rounded-3xl overflow-hidden footy-card p-6 sm:p-10 space-y-6">
        {tournament.banner && (
          <img
            src={tournament.banner}
            alt={tournament.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="gold">{tournament.type || tournament.format}</Badge>
            <Badge variant="emerald">{tournament.city || 'Raipur'}</Badge>
            <Badge variant="blue">{tournament.registeredTeamsCount}/{tournament.maxTeams} Teams</Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase">
            {tournament.title}
          </h1>

          <p className="text-sm font-bold text-amber-500">{tournament.tagline}</p>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold max-w-2xl">
            {tournament.description}
          </p>

          {tournament.champion && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-xs inline-block">
              🏆 Champion Title Winner: {tournament.champion}
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4 items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Prize Pool</span>
              <span className="text-2xl font-black text-amber-500">{tournament.prizePool}</span>
            </div>

            <Button variant="gold" size="lg" icon={Plus} onClick={() => setIsRegisterModalOpen(true)}>
              Register Squad (₹{tournament.entryFee})
            </Button>
          </div>
        </div>
      </div>

      {/* Bracket Preview if Knockout */}
      {tournament.brackets?.quarterFinals && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Knockout Tournament Brackets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* QF */}
            <div className="footy-card p-4 space-y-3">
              <h4 className="font-black text-xs text-slate-400 uppercase">Quarter Finals</h4>
              {tournament.brackets.quarterFinals.map(m => (
                <div key={m.matchId} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold space-y-1">
                  <div className="flex justify-between">
                    <span>{m.teamA}</span>
                    <span className="text-sport-500 font-extrabold">{m.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{m.teamB}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SF */}
            <div className="footy-card p-4 space-y-3">
              <h4 className="font-black text-xs text-slate-400 uppercase">Semi Finals</h4>
              {tournament.brackets.semiFinals?.map(m => (
                <div key={m.matchId} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold space-y-1">
                  <div className="flex justify-between">
                    <span>{m.teamA}</span>
                    <span className="text-sport-500 font-extrabold">{m.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{m.teamB}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Finals */}
            <div className="footy-card p-4 space-y-3 border-amber-500/40">
              <h4 className="font-black text-xs text-amber-500 uppercase">Grand Final</h4>
              {tournament.brackets.finals?.map(m => (
                <div key={m.matchId} className="p-3 rounded-xl bg-amber-500/10 text-xs font-bold space-y-1">
                  <div className="flex justify-between text-slate-900 dark:text-white">
                    <span>{m.teamA}</span>
                    <span className="text-amber-500 font-black">{m.score}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white">
                    <span>{m.teamB}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Grid: Registered Teams & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Teams List (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-sport-500" />
            <span>Registered Squads ({tournament.teams?.length || 0})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tournament.teams?.map((tm) => (
              <div key={tm.id} className="footy-card p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{tm.logo}</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{tm.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold">Captain: {tm.captain}</p>
                  </div>
                </div>
                <Badge variant={tm.status === 'CONFIRMED' ? 'emerald' : 'gold'} size="sm">
                  {tm.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Rules & Guidelines</h3>
          <div className="footy-card p-5 space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {tournament.rules?.map((rule, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-amber-500 font-black">•</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Registration Modal */}
      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Register Squad for Tournament">
        <form onSubmit={handleRegisterTeam} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Squad Name</label>
            <input
              type="text"
              placeholder="e.g. Raipur Strikers FC"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Captain Name</label>
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Team Logo Emoji</label>
            <div className="flex gap-2">
              {['⚡', '🔥', '🛡️', '🧱', '⚽', '🦉', '🦅'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setTeamLogo(emoji)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border ${
                    teamLogo === emoji ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm">
              Confirm Registration (₹{tournament.entryFee})
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TournamentDetailsPage;
