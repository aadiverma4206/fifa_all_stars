import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Calendar, MapPin, Users, Trophy, Clock, Shield, Eye, X,
  Building2, Search, Filter, CheckCircle, Flame, Trash2,
  Edit2, Play, RotateCcw, Lock
} from 'lucide-react';
import { useDataStore, MATCH_FORMAT_SLOTS } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { validateTitle, validateDateNotPast, validateTimeRange, validatePositiveAmount, validateIntegerRange, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import toast from 'react-hot-toast';

const FORMATS = ['11v11'];
const SKILLS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const PRIVACY = ['PUBLIC', 'PRIVATE'];

export const ManagerGamesPage = () => {
  const {
    games, courts, clubs, createGame, updateGameLifecycle,
    submitGameScore, updateLiveScore, updateGameDetails, removeGame
  } = useDataStore();
  const { currentUser, usersList, setCurrentUser } = useAuthStore();
  const navigate = useNavigate();

  // Get manager's club & courts
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);

  // All games belonging to this venue
  const clubGames = games.filter(g => g.venueReference?.clubId === myClub?.id);

  // Helper check functions
  const hasScoreEntered = (g) => {
    return (
      g?.score !== null &&
      g?.score !== undefined &&
      g?.score?.teamA !== null &&
      g?.score?.teamA !== undefined &&
      g?.score?.teamB !== null &&
      g?.score?.teamB !== undefined
    );
  };

  const isCompletedGame = (g) => {
    return g.status === 'COMPLETED' || (g.status !== 'ONGOING' && hasScoreEntered(g));
  };

  const isLiveGame = (g) => {
    return g.status === 'ONGOING';
  };

  const isUpcomingGame = (g) => {
    return !isCompletedGame(g) && !isLiveGame(g);
  };

  // Grouped datasets
  const upcomingGames = clubGames.filter(isUpcomingGame);
  const liveGames = clubGames.filter(isLiveGame);
  const completedGames = clubGames.filter(isCompletedGame);
  const activeVenueGames = clubGames.filter(g => !isCompletedGame(g));

  // Tab & Filter States for Active Game Sessions
  const [activeCategoryTab, setActiveCategoryTab] = useState('upcoming'); // 'upcoming' | 'ongoing' | 'all'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'tomorrow' | 'upcoming' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isLiveScoreModalOpen, setIsLiveScoreModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Loading & Concurrency Locks
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isSubmittingLiveScore, setIsSubmittingLiveScore] = useState(false);
  const [startingGameId, setStartingGameId] = useState(null);
  const [removingGameId, setRemovingGameId] = useState(null);
  const [gameToRemove, setGameToRemove] = useState(null);

  const isCreatingGameRef = useRef(false);
  const isEditingGameRef = useRef(false);
  const isSubmittingScoreRef = useRef(false);
  const isSubmittingLiveScoreRef = useRef(false);
  const startingGameRef = useRef(false);
  const removingGameRef = useRef(false);

  // Create Game Form State
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('11v11');
  const [date, setDate] = useState(getTodayDate(1));
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [entryFee, setEntryFee] = useState('0');
  const [skill, setSkill] = useState('All Levels');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [selectedCourtId, setSelectedCourtId] = useState(myCourts[0]?.courtId || myCourts[0]?.id || '');
  const [description, setDescription] = useState('');

  // Edit Game Form State
  const [editTitle, setEditTitle] = useState('');
  const [editFormat, setEditFormat] = useState('11v11');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('19:00');
  const [editEndTime, setEditEndTime] = useState('20:30');
  const [editEntryFee, setEditEntryFee] = useState('0');
  const [editSkill, setEditSkill] = useState('All Levels');
  const [editPrivacy, setEditPrivacy] = useState('PUBLIC');
  const [editCourtId, setEditCourtId] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Score Entry States
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [liveScoreA, setLiveScoreA] = useState('');
  const [liveScoreB, setLiveScoreB] = useState('');

  const todayStr = getTodayDate(0);
  const tomorrowStr = getTodayDate(1);

  // Filter Active Sessions (Excluding Completed which live in dedicated /club/history)
  const filteredActiveGames = activeVenueGames.filter(g => {
    // 1. Category Filter
    let matchesCategory = true;
    if (activeCategoryTab === 'upcoming') matchesCategory = isUpcomingGame(g);
    else if (activeCategoryTab === 'ongoing') matchesCategory = isLiveGame(g);

    // 2. Date-wise Filter
    const gameDate = g.dateTime?.date || g.date || '';
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = gameDate === todayStr;
    } else if (dateFilter === 'tomorrow') {
      matchesDate = gameDate === tomorrowStr;
    } else if (dateFilter === 'upcoming') {
      matchesDate = gameDate >= todayStr;
    } else if (dateFilter === 'custom' && customDate) {
      matchesDate = gameDate === customDate;
    }

    // 3. Format Filter
    const matchesFormat = formatFilter === 'all' || g.format === formatFilter;

    // 4. Search Filter
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search ||
      g.title?.toLowerCase().includes(search) ||
      g.venueReference?.courtName?.toLowerCase().includes(search) ||
      g.format?.toLowerCase().includes(search) ||
      g.confirmedPlayers?.some(p => p.name?.toLowerCase().includes(search));

    return matchesCategory && matchesDate && matchesFormat && matchesSearch;
  });

  // Handle Create Game
  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (isCreatingGame || isCreatingGameRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(title, 'Game Title'), field: 'title' },
      { check: () => validateDateNotPast(date, 'Game Date'), field: 'date' },
      { check: () => validateTimeRange(startTime, endTime), field: 'startTime' },
      { check: () => validatePositiveAmount(entryFee, 'Entry Fee', true), field: 'entryFee' }
    ]);

    if (!isValid) return;

    const feeVal = parseFloat(entryFee) || 0;
    const selectedCourt = myCourts.find(c => c.courtId === selectedCourtId || c.id === selectedCourtId) || myCourts[0];

    isCreatingGameRef.current = true;
    setIsCreatingGame(true);
    try {
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

      setTitle(''); setFormat('5v5'); setDate(getTodayDate(1));
      setStartTime('19:00'); setEndTime('20:30'); setEntryFee('0');
      setSkill('All Levels'); setPrivacy('PUBLIC'); setDescription('');
      setIsCreateModalOpen(false);
      toast.success('Game session published successfully!');
    } catch (err) {
      logActionError('handleCreateGame', err);
      toast.error(getErrorMessage(err, 'creating game session'));
    } finally {
      setIsCreatingGame(false);
      setTimeout(() => {
        isCreatingGameRef.current = false;
      }, 400);
    }
  };

  // Handle Edit Game
  const handleOpenEditModal = (game) => {
    setSelectedGame(game);
    setEditTitle(game.title || '');
    setEditFormat(game.format || '5v5');
    setEditDate(game.dateTime?.date || game.date || getTodayDate(1));
    setEditStartTime(game.dateTime?.startTime || '19:00');
    setEditEndTime(game.dateTime?.endTime || '20:30');
    setEditEntryFee(String(game.entryFee || 0));
    setEditSkill(game.skill || 'All Levels');
    setEditPrivacy(game.privacy || 'PUBLIC');
    setEditCourtId(game.venueReference?.courtId || myCourts[0]?.courtId || '');
    setEditDescription(game.description || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditGame = async (e) => {
    e.preventDefault();
    if (!selectedGame || isEditingGame || isEditingGameRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(editTitle, 'Game Title'), field: 'editTitle' },
      { check: () => validateDateNotPast(editDate, 'Game Date'), field: 'editDate' },
      { check: () => validateTimeRange(editStartTime, editEndTime), field: 'editStartTime' },
      { check: () => validatePositiveAmount(editEntryFee, 'Entry Fee', true), field: 'editEntryFee' }
    ]);

    if (!isValid) return;

    const feeVal = parseFloat(editEntryFee) || 0;
    const selectedCourt = myCourts.find(c => c.courtId === editCourtId || c.id === editCourtId) || myCourts[0];
    const computedSlots = MATCH_FORMAT_SLOTS[editFormat] || selectedGame.maxPlayers || 10;
    const trimmedTitle = editTitle.trim();
    const trimmedDesc = editDescription.trim();

    // Detect whether anything actually changed
    const hasChanges =
      trimmedTitle !== (selectedGame.title || '').trim() ||
      editFormat !== selectedGame.format ||
      computedSlots !== selectedGame.maxPlayers ||
      feeVal !== (selectedGame.entryFee || 0) ||
      editSkill !== selectedGame.skill ||
      editPrivacy !== selectedGame.privacy ||
      editDate !== (selectedGame.dateTime?.date || selectedGame.date) ||
      editStartTime !== selectedGame.dateTime?.startTime ||
      editEndTime !== selectedGame.dateTime?.endTime ||
      editCourtId !== selectedGame.venueReference?.courtId ||
      trimmedDesc !== (selectedGame.description || '').trim();

    if (!hasChanges) {
      toast('No changes detected for this game session.', { icon: 'ℹ️' });
      setIsEditModalOpen(false);
      setSelectedGame(null);
      return;
    }

    isEditingGameRef.current = true;
    setIsEditingGame(true);
    try {
      updateGameDetails(selectedGame.id, {
        title: trimmedTitle,
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
        venueReference: {
          ...selectedGame.venueReference,
          courtId: selectedCourt?.courtId || selectedCourt?.id || selectedGame.venueReference?.courtId,
          courtName: selectedCourt?.name || selectedGame.venueReference?.courtName
        },
        description: trimmedDesc
      });

      setIsEditModalOpen(false);
      setSelectedGame(null);
      toast.success('Game session details updated.');
    } catch (err) {
      logActionError('handleSaveEditGame', err);
      toast.error(getErrorMessage(err, 'updating game session'));
    } finally {
      setIsEditingGame(false);
      setTimeout(() => {
        isEditingGameRef.current = false;
      }, 400);
    }
  };

  // Handle Score Entry Modal (Finishing Match)
  const handleOpenScoreModal = (game) => {
    setSelectedGame(game);
    setScoreA(game.score?.teamA !== undefined ? game.score.teamA.toString() : (game.liveScore?.teamA !== undefined ? game.liveScore.teamA.toString() : ''));
    setScoreB(game.score?.teamB !== undefined ? game.score.teamB.toString() : (game.liveScore?.teamB !== undefined ? game.liveScore.teamB.toString() : ''));
    setIsScoreModalOpen(true);
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!selectedGame || isSubmittingScore || isSubmittingScoreRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateIntegerRange(scoreA, 0, 99, 'Team A Final Goals'), field: 'scoreA' },
      { check: () => validateIntegerRange(scoreB, 0, 99, 'Team B Final Goals'), field: 'scoreB' }
    ]);

    if (!isValid) return;

    const parsedA = parseInt(scoreA, 10);
    const parsedB = parseInt(scoreB, 10);

    // Change detection: if already recorded identical score
    if (selectedGame.score && selectedGame.score.teamA === parsedA && selectedGame.score.teamB === parsedB && selectedGame.status === 'COMPLETED') {
      toast('Final match score is already recorded.', { icon: 'ℹ️' });
      setIsScoreModalOpen(false);
      setSelectedGame(null);
      return;
    }

    isSubmittingScoreRef.current = true;
    setIsSubmittingScore(true);
    try {
      submitGameScore(selectedGame.id, { teamAScore: parsedA, teamBScore: parsedB }, usersList, (updatedUsers) => {
        if (currentUser?.id) {
          const myUpdated = updatedUsers?.find(u => u.id === currentUser.id);
          if (myUpdated) setCurrentUser(myUpdated);
        }
      }, `${currentUser?.name || 'Venue Manager'} (Club Manager)`);

      setIsScoreModalOpen(false);
      setSelectedGame(null);
    } catch (err) {
      logActionError('handleSubmitScore', err);
      toast.error(getErrorMessage(err, 'submitting final match score'));
    } finally {
      setIsSubmittingScore(false);
      setTimeout(() => {
        isSubmittingScoreRef.current = false;
      }, 400);
    }
  };

  // Handle Live Score Modal
  const handleOpenLiveScoreModal = (game) => {
    setSelectedGame(game);
    setLiveScoreA(game.liveScore?.teamA !== undefined ? String(game.liveScore.teamA) : (game.score?.teamA !== undefined ? String(game.score.teamA) : '0'));
    setLiveScoreB(game.liveScore?.teamB !== undefined ? String(game.liveScore.teamB) : (game.score?.teamB !== undefined ? String(game.score.teamB) : '0'));
    setIsLiveScoreModalOpen(true);
  };

  const handleSubmitLiveScore = async (e) => {
    e.preventDefault();
    if (!selectedGame || isSubmittingLiveScore || isSubmittingLiveScoreRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateIntegerRange(liveScoreA, 0, 99, 'Team A Live Goals'), field: 'liveScoreA' },
      { check: () => validateIntegerRange(liveScoreB, 0, 99, 'Team B Live Goals'), field: 'liveScoreB' }
    ]);

    if (!isValid) return;

    const parsedA = parseInt(liveScoreA, 10);
    const parsedB = parseInt(liveScoreB, 10);

    // Change detection: if live score is already identical
    if (selectedGame.liveScore && selectedGame.liveScore.teamA === parsedA && selectedGame.liveScore.teamB === parsedB) {
      toast('Live score is already up to date.', { icon: 'ℹ️' });
      setIsLiveScoreModalOpen(false);
      setSelectedGame(null);
      return;
    }

    isSubmittingLiveScoreRef.current = true;
    setIsSubmittingLiveScore(true);
    try {
      updateLiveScore(selectedGame.id, { teamAScore: parsedA, teamBScore: parsedB }, currentUser?.name || 'Venue Manager');
      setIsLiveScoreModalOpen(false);
      setSelectedGame(null);
    } catch (err) {
      logActionError('handleSubmitLiveScore', err);
      toast.error(getErrorMessage(err, 'updating live score'));
    } finally {
      setIsSubmittingLiveScore(false);
      setTimeout(() => {
        isSubmittingLiveScoreRef.current = false;
      }, 400);
    }
  };

  const handleStartMatch = async (game) => {
    if (startingGameId || startingGameRef.current) return;

    if (!checkNetworkOnline()) return;

    startingGameRef.current = true;
    setStartingGameId(game.id);
    try {
      updateGameLifecycle(game.id, 'ONGOING');
      toast.success(`Match "${game.title}" is now LIVE!`);
    } catch (err) {
      logActionError('handleStartMatch', err);
      toast.error(getErrorMessage(err, 'starting match'));
    } finally {
      setStartingGameId(null);
      setTimeout(() => {
        startingGameRef.current = false;
      }, 400);
    }
  };

  const handleRequestRemoveGame = (game) => {
    if (removingGameId || removingGameRef.current) return;
    setGameToRemove(game);
  };

  const handleConfirmRemoveGame = async () => {
    if (!gameToRemove || removingGameId || removingGameRef.current) return;

    if (!checkNetworkOnline()) return;

    const game = gameToRemove;
    removingGameRef.current = true;
    setGameToRemove(null);
    setRemovingGameId(game.id);
    try {
      removeGame(game.id, 'Cancelled by venue manager');
      toast.success(`Game session "${game.title}" removed.`);
    } catch (err) {
      logActionError('handleConfirmRemoveGame', err);
      toast.error(getErrorMessage(err, 'removing game session'));
    } finally {
      setRemovingGameId(null);
      setTimeout(() => {
        removingGameRef.current = false;
      }, 400);
    }
  };

  const resetAllFilters = () => {
    setActiveCategoryTab('upcoming');
    setDateFilter('all');
    setCustomDate('');
    setSearchTerm('');
    setFormatFilter('all');
  };

  return (
    <div className="space-y-6 py-4 max-w-[1700px] mx-auto px-2 sm:px-4">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-sport-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{myClub?.name || 'Club Venue'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <span>Venue Game Sessions</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Organize upcoming sessions, manage live match kick-offs, and open player registrations for your venue.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link to="/club/history">
            <Button
              variant="outline"
              size="md"
              icon={Trophy}
              className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
            >
              Match History ({completedGames.length})
            </Button>
          </Link>
          
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-lg shadow-sport-500/20"
          >
            Create New Game Session
          </Button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Card 1: All Active Sessions */}
        <div 
          onClick={() => setActiveCategoryTab('all')}
          className={`admin-card admin-card-hover p-4 rounded-xl border bg-sport-500/10 border-sport-500/20 cursor-pointer transition-all ${activeCategoryTab === 'all' ? 'ring-2 ring-sport-500 shadow-md' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-2xl sm:text-3xl font-black text-sport-500">{activeVenueGames.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">View ➔</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Total Active Sessions</span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Upcoming & live games</span>
        </div>

        {/* Card 2: Upcoming / Open */}
        <div 
          onClick={() => setActiveCategoryTab('upcoming')}
          className={`admin-card admin-card-hover p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 cursor-pointer transition-all ${activeCategoryTab === 'upcoming' ? 'ring-2 ring-emerald-500 shadow-md' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-2xl sm:text-3xl font-black text-emerald-500">{upcomingGames.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">View ➔</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Upcoming / Open</span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Jo game abhi nahi hua</span>
        </div>

        {/* Card 3: Live Matches */}
        <div 
          onClick={() => setActiveCategoryTab('ongoing')}
          className={`admin-card admin-card-hover p-4 rounded-xl border bg-rose-500/10 border-rose-500/20 cursor-pointer transition-all ${activeCategoryTab === 'ongoing' ? 'ring-2 ring-rose-500 shadow-md' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-2xl sm:text-3xl font-black text-rose-500">{liveGames.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">View ➔</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Live Matches</span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">In-progress sessions</span>
        </div>

        {/* Card 4: Match History (Direct Navigation to /club/history) */}
        <Link to="/club/history" className="block">
          <div className="admin-card admin-card-hover p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 cursor-pointer transition-all h-full">
            <div className="flex items-center justify-between">
              <span className="block text-2xl sm:text-3xl font-black text-amber-500">{completedGames.length}</span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Open ➔</span>
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Match History</span>
            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">View all completed records</span>
          </div>
        </Link>
      </div>

      {/* 1. CATEGORY SEGMENTED RIBBON TABS (Upcoming vs Live vs All Active) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto max-w-full scrollbar-none w-full sm:w-auto inline-flex">
            {[
              { key: 'upcoming', label: `⚡ Upcoming & Open (${upcomingGames.length})` },
              { key: 'ongoing', label: `🔴 Live Matches (${liveGames.length})` },
              { key: 'all', label: `🌐 All Active Game Sessions (${activeVenueGames.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveCategoryTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeCategoryTab === tab.key
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/club/history">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Go to Match History ({completedGames.length}) ➔</span>
              </span>
            </Link>

            {(activeCategoryTab !== 'upcoming' || dateFilter !== 'all' || customDate || searchTerm || formatFilter !== 'all') && (
              <button
                onClick={resetAllFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. DATE-WISE & SEARCH FILTER TOOLBAR */}
        <div className="admin-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5">
          
          {/* Top Row: Search & Pick Date */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search active sessions by title, pitch/court name, player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
              />
            </div>

            {/* Pick Date Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Pick Date:</span>
              <div className="relative flex-1 md:w-44">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    if (e.target.value) setDateFilter('custom');
                    else setDateFilter('all');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
                />
              </div>
              {customDate && (
                <button
                  onClick={() => { setCustomDate(''); setDateFilter('all'); }}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                  title="Clear selected date"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Date Quick Filters & Format Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            
            {/* Quick Date Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Date:</span>
              {[
                { key: 'all', label: '📅 All Dates' },
                { key: 'today', label: `⚡ Today (${todayStr})` },
                { key: 'tomorrow', label: `🌅 Tomorrow (${tomorrowStr})` },
                { key: 'upcoming', label: '🔮 Future Scheduled' }
              ].map(dOpt => (
                <button
                  key={dOpt.key}
                  onClick={() => {
                    setDateFilter(dOpt.key);
                    if (dOpt.key !== 'custom') setCustomDate('');
                  }}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    dateFilter === dOpt.key
                      ? 'bg-sport-500 text-white shadow-xs font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {dOpt.label}
                </button>
              ))}
            </div>

            {/* Format Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Format:</span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase bg-amber-500 text-slate-950 shadow-xs">
                11v11 (Official Full Pitch)
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* 3. ACTIVE SESSIONS LIST */}
      {filteredActiveGames.length === 0 ? (
        <div className="admin-card p-12 sm:p-16 text-center space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-3xl">⚽</div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Active Sessions Found</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              No sessions match your selected filters. Create a new session or check Match History for finished games.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold uppercase cursor-pointer"
            >
              Clear Filters
            </button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
              Create New Session
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Showing {filteredActiveGames.length} Active Game Session{filteredActiveGames.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredActiveGames.map((game, idx) => {
            const isLive = isLiveGame(game);
            const isUpcoming = isUpcomingGame(game);

            const totalSlots = game.maxPlayers || MATCH_FORMAT_SLOTS[game.format] || 10;
            const confirmedCount = game.confirmedPlayers?.length || 0;
            const spotsLeft = Math.max(0, totalSlots - confirmedCount);
            const isFull = confirmedCount >= totalSlots || game.status === 'FULL';

            const displayScoreA = game.liveScore?.teamA ?? (game.score?.teamA ?? 0);
            const displayScoreB = game.liveScore?.teamB ?? (game.score?.teamB ?? 0);

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="admin-card admin-card-hover p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Left Block: Start Time / Live Indicator */}
                  <div className="flex items-center space-x-4">
                    
                    <div className={`flex-shrink-0 w-28 sm:w-32 flex flex-col items-center justify-center p-3 rounded-xl border text-center ${
                      isLive
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                    }`}>
                      {isLive ? (
                        <>
                          <div className="flex items-center space-x-1 font-mono font-black text-xl text-rose-500 leading-none">
                            <span className="animate-pulse">🔴</span>
                            <span>{displayScoreA} – {displayScoreB}</span>
                          </div>
                          <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider mt-1">
                            LIVE IN PLAY
                          </span>
                        </>
                      ) : (
                        /* UPCOMING / JO GAME ABHI NAHI HUA HAI */
                        <>
                          <span className="text-xl font-mono font-black text-slate-900 dark:text-white leading-none">
                            {game.dateTime?.startTime || '19:00'}
                          </span>
                          <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-1">
                            {game.dateTime?.date === todayStr ? '⚡ TODAY' : game.dateTime?.date === tomorrowStr ? '🌅 TOMORROW' : 'SCHEDULED'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Main Match Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={game.format === '5v5' || game.format === '2v2' ? 'emerald' : 'blue'} size="sm" className="rounded-md">
                          {game.format}
                        </Badge>
                        
                        {isLive ? (
                          <Badge variant="danger" size="sm" className="rounded-md">🔥 LIVE MATCH</Badge>
                        ) : isFull ? (
                          <Badge variant="blue" size="sm" className="rounded-md">🔒 ROSTER FULL</Badge>
                        ) : (
                          <Badge variant="emerald" size="sm" className="rounded-md">🟢 OPEN ({spotsLeft} SLOTS LEFT)</Badge>
                        )}

                        <Badge variant={game.privacy === 'PRIVATE' ? 'danger' : 'gold'} size="sm" className="rounded-md">
                          {game.privacy}
                        </Badge>
                      </div>

                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-sport-500 transition-colors truncate">
                        {game.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          {game.dateTime?.date} ({game.dateTime?.startTime}–{game.dateTime?.endTime})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                          {game.venueReference?.courtName || 'Pitch Alpha'}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                          <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          {confirmedCount}/{totalSlots} Players
                        </span>
                        <span className="flex items-center gap-1 text-sport-500 font-black">
                          ₹{game.entryFee}/player
                        </span>
                      </div>

                      {/* Player Avatars */}
                      {game.confirmedPlayers?.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex -space-x-1.5">
                            {game.confirmedPlayers.slice(0, 6).map(p => (
                              <Avatar key={p.id} src={p.avatar} name={p.name} size="xs" className="rounded-md border-2 border-white dark:border-slate-900" />
                            ))}
                            {game.confirmedPlayers.length > 6 && (
                              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-900">
                                +{game.confirmedPlayers.length - 6}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">players registered</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action Control Hub for Manager */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                    
                    {/* View Details Link */}
                    <Link to={`/games/${game.id}`}>
                      <Button variant="outline" size="sm" icon={Eye} className="text-xs font-bold">
                        View
                      </Button>
                    </Link>

                    {/* UPCOMING GAME CONTROLS (Jo game abhi nahi hua hai) */}
                    {isUpcoming && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Play}
                          isLoading={startingGameId === game.id}
                          disabled={startingGameId !== null}
                          onClick={() => handleStartMatch(game)}
                          className="text-xs font-black shadow-xs"
                        >
                          Start Match
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit2}
                          onClick={() => handleOpenEditModal(game)}
                          className="text-xs font-semibold"
                        >
                          Edit
                        </Button>
                      </>
                    )}

                    {/* LIVE GAME CONTROLS */}
                    {isLive && (
                      <>
                        <Button
                          variant="emerald"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => handleOpenScoreModal(game)}
                          className="text-xs font-black shadow-xs"
                        >
                          Finish Match
                        </Button>

                        <Button
                          variant="gold"
                          size="sm"
                          icon={Trophy}
                          onClick={() => handleOpenLiveScoreModal(game)}
                          className="text-xs font-bold"
                        >
                          Live Score
                        </Button>
                      </>
                    )}

                    {/* Cancel / Remove Button */}
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      isLoading={removingGameId === game.id}
                      disabled={removingGameId !== null}
                      onClick={() => handleRequestRemoveGame(game)}
                      className="text-xs font-semibold"
                      title="Cancel and remove session"
                    >
                      Remove
                    </Button>

                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ CREATE GAME MODAL ═══ */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="🏟️ Create Venue Game Session" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateGame} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            You are creating this session as organizer. You will <strong>not</strong> occupy any player slot.
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Game Title *</label>
            <input
              name="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Friday Night 5v5 Super Match"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Match Format</label>
              <select
                name="format"
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
                name="skill"
                value={skill}
                onChange={e => setSkill(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Select Pitch / Court</label>
            <select
              name="selectedCourtId"
              value={selectedCourtId}
              onChange={e => setSelectedCourtId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            >
              {myCourts.map(c => (
                <option key={c.courtId || c.id} value={c.courtId || c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Date</label>
              <input
                name="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Start Time</label>
              <input
                name="startTime"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">End Time</label>
              <input
                name="endTime"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Entry Fee (₹ per player)</label>
              <input
                name="entryFee"
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
                name="privacy"
                value={privacy}
                onChange={e => setPrivacy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {PRIVACY.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Description (optional)</label>
            <textarea
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Briefly describe the session, rules, or special notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingGame}
              disabled={isCreatingGame}
              className="flex-1"
            >
              ✅ Publish Game Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══ EDIT GAME MODAL ═══ */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="✏️ Edit Game Session" maxWidth="max-w-2xl">
        <form onSubmit={handleSaveEditGame} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Game Title *</label>
            <input
              name="editTitle"
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Match Format</label>
              <select
                name="editFormat"
                value={editFormat}
                onChange={e => setEditFormat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Skill Level</label>
              <select
                name="editSkill"
                value={editSkill}
                onChange={e => setEditSkill(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Select Court / Pitch</label>
            <select
              name="editCourtId"
              value={editCourtId}
              onChange={e => setEditCourtId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            >
              {myCourts.map(c => (
                <option key={c.courtId || c.id} value={c.courtId || c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Date</label>
              <input
                name="editDate"
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Start Time</label>
              <input
                name="editStartTime"
                type="time"
                value={editStartTime}
                onChange={e => setEditStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">End Time</label>
              <input
                name="editEndTime"
                type="time"
                value={editEndTime}
                onChange={e => setEditEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Entry Fee (₹)</label>
              <input
                name="editEntryFee"
                type="number"
                min="0"
                value={editEntryFee}
                onChange={e => setEditEntryFee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Privacy</label>
              <select
                name="editPrivacy"
                value={editPrivacy}
                onChange={e => setEditPrivacy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {PRIVACY.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              isLoading={isEditingGame}
              disabled={isEditingGame}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══ ENTER FINAL SCORE MODAL ═══ */}
      <Modal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} title="🏁 Enter Final Match Score" maxWidth="max-w-md">
        {selectedGame && (
          <form onSubmit={handleSubmitScore} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-400">
              🏆 Submitting the final score marks the match as <strong>COMPLETED</strong>, calculates player ELO, and records it in Match History.
            </div>

            <p className="text-xs font-black text-slate-700 dark:text-slate-300 text-center">
              {selectedGame.title}
            </p>

            <div className="flex items-center gap-4 justify-center">
              <div className="text-center flex-1">
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Team A Score</label>
                <input
                  name="scoreA"
                  type="number" min="0" max="99"
                  placeholder="0"
                  value={scoreA}
                  onChange={e => setScoreA(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sport-500/40 bg-slate-50 dark:bg-slate-900 text-2xl font-mono font-black text-sport-500 text-center focus:ring-2 focus:ring-sport-500 focus:outline-none"
                />
              </div>
              <span className="text-2xl font-black text-slate-400 mt-5">–</span>
              <div className="text-center flex-1">
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Team B Score</label>
                <input
                  name="scoreB"
                  type="number" min="0" max="99"
                  placeholder="0"
                  value={scoreB}
                  onChange={e => setScoreB(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-500/40 bg-slate-50 dark:bg-slate-900 text-2xl font-mono font-black text-blue-500 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsScoreModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="emerald"
                size="sm"
                isLoading={isSubmittingScore}
                disabled={isSubmittingScore}
                className="flex-1"
              >
                🏁 Save & Publish Final Score
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ═══ LIVE SCORE MODAL ═══ */}
      <Modal isOpen={isLiveScoreModalOpen} onClose={() => setIsLiveScoreModalOpen(false)} title="🔴 Update Live Match Score" maxWidth="max-w-md">
        {selectedGame && (
          <form onSubmit={handleSubmitLiveScore} className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-700 dark:text-rose-400">
              ⚡ Live score updates the real-time scoreboard. The match remains Active until you click "Finish Match".
            </div>

            <p className="text-xs font-black text-slate-700 dark:text-slate-300 text-center">
              {selectedGame.title}
            </p>

            <div className="flex items-center gap-4 justify-center">
              <div className="text-center flex-1">
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Team A Live</label>
                <input
                  name="liveScoreA"
                  type="number" min="0" max="99"
                  placeholder="0"
                  value={liveScoreA}
                  onChange={e => setLiveScoreA(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-rose-500/40 bg-slate-50 dark:bg-slate-900 text-2xl font-mono font-black text-rose-500 text-center focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <span className="text-2xl font-black text-slate-400 mt-5">–</span>
              <div className="text-center flex-1">
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Team B Live</label>
                <input
                  name="liveScoreB"
                  type="number" min="0" max="99"
                  placeholder="0"
                  value={liveScoreB}
                  onChange={e => setLiveScoreB(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-rose-500/40 bg-slate-50 dark:bg-slate-900 text-2xl font-mono font-black text-rose-500 text-center focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsLiveScoreModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingLiveScore}
                disabled={isSubmittingLiveScore}
                className="flex-1"
              >
                🔴 Update Live Score
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ═══ REMOVE GAME CONFIRM MODAL ═══ */}
    <Modal
      isOpen={!!gameToRemove}
      onClose={() => { if (!removingGameId) setGameToRemove(null); }}
      title="🗑️ Cancel & Remove Game Session"
      maxWidth="max-w-md"
    >
      {gameToRemove && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-2">
            <p className="text-sm font-bold">Are you sure you want to cancel and remove this game session?</p>
            <p className="text-xs font-semibold opacity-80">This action is irreversible. All registered players will be removed from the roster.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-400">Session:</span>
              <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]">{gameToRemove.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date &amp; Time:</span>
              <span className="text-slate-700 dark:text-slate-300">{gameToRemove.dateTime?.date} · {gameToRemove.dateTime?.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Registered Players:</span>
              <span className="text-slate-700 dark:text-slate-300">{gameToRemove.confirmedPlayers?.length || 0} / {gameToRemove.maxPlayers}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGameToRemove(null)}
              className="w-full sm:flex-1 border border-slate-200 dark:border-slate-700 justify-center"
            >
              Keep Session
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              isLoading={!!removingGameId}
              disabled={!!removingGameId}
              onClick={handleConfirmRemoveGame}
              className="w-full sm:flex-1 justify-center"
            >
              Yes, Cancel &amp; Remove
            </Button>
          </div>
        </div>
      )}
    </Modal>
    </div>
  );
};

export default ManagerGamesPage;
