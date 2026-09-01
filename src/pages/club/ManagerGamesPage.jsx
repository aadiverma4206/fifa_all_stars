import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, MapPin, Users, Trophy, Clock, Shield, Eye, X,
  Building2, ChevronRight, Search, Filter, CheckCircle, AlertCircle, Flame, Trash2
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import toast from 'react-hot-toast';

const FORMATS = ['5v5', '7v7', '3v3', '1v1', '6v6', '11v11'];
const SKILLS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const PRIVACY = ['PUBLIC', 'PRIVATE'];

export const ManagerGamesPage = () => {
  const { games, courts, clubs, createGame, updateGameLifecycle, submitGameScore, removeGame } = useDataStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  // Get manager's club & courts
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);

  // Games at this club
  const clubGames = games.filter(g => g.venueReference?.clubId === myClub?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Create Game Form State
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('5v5');
  const [date, setDate] = useState(getTodayDate(1));
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [entryFee, setEntryFee] = useState('0');
  const [skill, setSkill] = useState('All Levels');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [selectedCourtId, setSelectedCourtId] = useState(myCourts[0]?.courtId || myCourts[0]?.id || '');
  const [description, setDescription] = useState('');

  // Score Entry
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');

  const filtered = clubGames.filter(g => {
    const search = searchTerm.toLowerCase();
    const matchSearch = g.title?.toLowerCase().includes(search) || !searchTerm;
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!title || !title.trim()) { 
      toast.error('Please enter a valid game title!'); 
      return; 
    }

    const today = getTodayDate();
    if (date < today) {
      toast.error('Game date cannot be in the past! Please select today or a future date.');
      return;
    }

    if (!startTime || !endTime) {
      toast.error('Please specify both Start Time and End Time.');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End Time must be after Start Time!');
      return;
    }

    const feeVal = parseFloat(entryFee) || 0;
    if (feeVal < 0) {
      toast.error('Entry fee cannot be negative.');
      return;
    }

    const selectedCourt = myCourts.find(c => c.courtId === selectedCourtId || c.id === selectedCourtId);

    createGame({
      title: title.trim(),
      format,
      date,
      dateTime: { date, startTime, endTime },
      entryFee: feeVal,
      skill,
      privacy,
      description: description.trim(),
      venueReference: {
        clubId: myClub?.id,
        clubName: myClub?.name,
        courtId: selectedCourt?.courtId || selectedCourt?.id || '',
        courtName: selectedCourt?.name || 'Main Pitch',
        city: myClub?.city
      }
    }, currentUser);

    // Reset form
    setTitle(''); setFormat('5v5'); setDate(getTodayDate(1));
    setStartTime('19:00'); setEndTime('20:30'); setEntryFee('0');
    setSkill('All Levels'); setPrivacy('PUBLIC'); setDescription('');
    setIsCreateModalOpen(false);
  };

  const handleOpenScoreModal = (game) => {
    setSelectedGame(game);
    setScoreA(game.score?.teamA !== undefined ? game.score.teamA.toString() : '');
    setScoreB(game.score?.teamB !== undefined ? game.score.teamB.toString() : '');
    setIsScoreModalOpen(true);
  };

  const handleSubmitScore = (e) => {
    e.preventDefault();
    if (!selectedGame) return;

    if (scoreA === '' || scoreA === null || scoreB === '' || scoreB === null) {
      toast.error('Please enter scores for both Team A and Team B.');
      return;
    }

    const parsedA = parseInt(scoreA, 10);
    const parsedB = parseInt(scoreB, 10);

    if (isNaN(parsedA) || parsedA < 0 || parsedA > 99) {
      toast.error('Team A score must be a valid integer between 0 and 99.');
      return;
    }

    if (isNaN(parsedB) || parsedB < 0 || parsedB > 99) {
      toast.error('Team B score must be a valid integer between 0 and 99.');
      return;
    }

    submitGameScore(selectedGame.id, { teamAScore: parsedA, teamBScore: parsedB });
    setIsScoreModalOpen(false);
    setSelectedGame(null);
  };

  const statusOptions = [
    { key: 'all', label: 'All Games' },
    { key: 'OPEN_FOR_JOINING', label: 'Open' },
    { key: 'FULL', label: 'Full' },
    { key: 'ONGOING', label: 'Live' },
    { key: 'COMPLETED', label: 'Completed' }
  ];

  const getStatusBadge = (status) => {
    if (status === 'COMPLETED') return <Badge variant="emerald" size="sm">✅ Completed</Badge>;
    if (status === 'ONGOING') return <Badge variant="danger" size="sm">🔴 Live</Badge>;
    if (status === 'FULL') return <Badge variant="blue" size="sm">🔒 Full</Badge>;
    return <Badge variant="gold" size="sm">🟢 Open</Badge>;
  };

  return (
    <div className="space-y-6 py-4">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-sport-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{myClub?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Venue Game Sessions
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Create and manage football sessions hosted at your venue. Managers organize — players pay & play.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Create New Game Session
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Sessions', value: clubGames.length, color: 'text-sport-500', bg: 'bg-sport-500/10' },
          { label: 'Open / Joinable', value: clubGames.filter(g => g.status === 'OPEN_FOR_JOINING').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Live Now', value: clubGames.filter(g => g.status === 'ONGOING').length, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Completed', value: clubGames.filter(g => g.status === 'COMPLETED').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map(stat => (
          <div key={stat.label} className={`footy-card p-4 rounded-2xl ${stat.bg} border-0`}>
            <span className={`block text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Manager Rule Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-black block mb-0.5">Manager Role — Organizer Only</span>
          As a Club Manager, you create and organize game sessions for your venue. You <strong>cannot join as a player</strong> or occupy player slots. Players will receive notifications and pay the entry fee to join.
        </div>
      </div>

      {/* Filters */}
      <div className="footy-card p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search game sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {statusOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                statusFilter === opt.key
                  ? 'bg-sport-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Games List */}
      {filtered.length === 0 ? (
        <div className="footy-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-3xl">⚽</div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">No Sessions Found</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Create your first venue game session to get started.</p>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Create First Session
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="footy-card p-4 sm:p-5 hover:border-sport-500/40 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left: Score or Status block */}
                <div className={`flex-shrink-0 w-full sm:w-24 flex flex-row sm:flex-col items-center justify-center gap-2 p-3 rounded-2xl ${
                  game.status === 'COMPLETED' && game.score
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {game.status === 'COMPLETED' && game.score ? (
                    <>
                      <span className="text-xl font-black text-white">{game.score.teamA}</span>
                      <span className="text-xs font-black text-slate-400">–</span>
                      <span className="text-xl font-black text-white">{game.score.teamB}</span>
                      <span className="hidden sm:block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Score</span>
                    </>
                  ) : (
                    <span className="text-xs font-black text-slate-500 uppercase">
                      {game.status === 'ONGOING' ? '🔴 Live' : game.status === 'FULL' ? '🔒 Full' : '🟢 Open'}
                    </span>
                  )}
                </div>

                {/* Middle: Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'} size="sm">{game.format}</Badge>
                    {getStatusBadge(game.status)}
                    <Badge variant={game.privacy === 'PRIVATE' ? 'danger' : 'gold'} size="sm">{game.privacy}</Badge>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-sport-500 transition-colors truncate">
                    {game.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {game.dateTime?.date} • {game.dateTime?.startTime}–{game.dateTime?.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sport-500" />
                      {game.venueReference?.courtName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {game.confirmedPlayers?.length || 0}/{game.maxPlayers} players
                    </span>
                    <span className="flex items-center gap-1 text-sport-500 font-black">
                      ₹{game.entryFee}/player
                    </span>
                  </div>

                  {/* Player avatars */}
                  {game.confirmedPlayers?.length > 0 && (
                    <div className="flex -space-x-2 pt-1">
                      {game.confirmedPlayers.slice(0, 8).map(p => (
                        <Avatar key={p.id} src={p.avatar} name={p.name} size="xs" className="border-2 border-white dark:border-slate-900" />
                      ))}
                      {game.confirmedPlayers.length > 8 && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-white border-2 border-white dark:border-slate-900">
                          +{game.confirmedPlayers.length - 8}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                  <Link to={`/games/${game.id}`} className="flex-1 sm:flex-none">
                    <Button variant="outline" size="sm" icon={Eye} className="w-full text-xs">
                      View
                    </Button>
                  </Link>
                  {game.status === 'OPEN_FOR_JOINING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 sm:flex-none text-xs"
                      onClick={() => { updateGameLifecycle(game.id, 'ONGOING'); }}
                    >
                      Start Match
                    </Button>
                  )}
                  {game.status === 'ONGOING' && (
                    <Button
                      variant="gold"
                      size="sm"
                      className="flex-1 sm:flex-none text-xs"
                      onClick={() => handleOpenScoreModal(game)}
                    >
                      Enter Score
                    </Button>
                  )}
                  {game.status === 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none text-xs"
                      onClick={() => handleOpenScoreModal(game)}
                    >
                      Edit Score
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    className="flex-1 sm:flex-none text-xs"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove/cancel game session "${game.title}"?`)) {
                        removeGame(game.id, 'Cancelled by venue manager');
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══ CREATE GAME MODAL ═══ */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="🏟️ Create Venue Game Session" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateGame} className="space-y-5">

          {/* Manager notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            You are creating this session as organizer. You will <strong>not</strong> occupy any player slot.
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Game Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Friday Night 5v5 at Bernabeu"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            />
          </div>

          {/* Format & Skill */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Match Format</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Skill Level</label>
              <select
                value={skill}
                onChange={e => setSkill(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Court Selection */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Select Court / Pitch</label>
            <select
              value={selectedCourtId}
              onChange={e => setSelectedCourtId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            >
              {myCourts.map(c => (
                <option key={c.courtId || c.id} value={c.courtId || c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Entry Fee & Privacy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Entry Fee (₹ per player)</label>
              <input
                type="number"
                min="0"
                value={entryFee}
                onChange={e => setEntryFee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Privacy</label>
              <select
                value={privacy}
                onChange={e => setPrivacy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {PRIVACY.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Briefly describe the session, rules, or special notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-sport-500 hover:bg-sport-600 text-white text-xs font-black shadow-md shadow-sport-500/25 transition-all"
            >
              ✅ Create Game Session
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══ SCORE ENTRY MODAL ═══ */}
      <Modal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} title="🏆 Enter Match Score" maxWidth="max-w-sm">
        {selectedGame && (
          <form onSubmit={handleSubmitScore} className="space-y-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
              {selectedGame.title}
            </p>
            <div className="flex items-center gap-4 justify-center">
              <div className="text-center flex-1">
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Team A</label>
                <input
                  type="number" min="0" max="99"
                  placeholder=""
                  value={scoreA}
                  onChange={e => setScoreA(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-sport-500/40 bg-slate-50 dark:bg-slate-900 text-3xl font-black text-sport-500 text-center focus:ring-2 focus:ring-sport-500 focus:outline-none"
                />
              </div>
              <span className="text-2xl font-black text-slate-400 mt-5">–</span>
              <div className="text-center flex-1">
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Team B</label>
                <input
                  type="number" min="0" max="99"
                  placeholder=""
                  value={scoreB}
                  onChange={e => setScoreB(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-blue-500/40 bg-slate-50 dark:bg-slate-900 text-3xl font-black text-blue-500 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsScoreModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition-all">
                Save Final Score
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManagerGamesPage;
