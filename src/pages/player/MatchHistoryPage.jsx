import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Calendar, MapPin, Search, Filter, ChevronRight, Clock, Users, 
  ArrowLeft, Star, Sparkles, TrendingDown, Zap, XCircle, Award, Film, 
  Building2, X, RotateCcw, LayoutGrid, List, Flame, TrendingUp, CheckCircle2, 
  ShieldCheck, Play, Video
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import BackButton from '../../components/common/BackButton';

export const MatchHistoryPage = () => {
  const { games, gameVideos, clubs, courts } = useDataStore();
  const { currentUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [pitchFilter, setPitchFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'past' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const todayStr = getTodayDate(0);
  const tomorrowStr = getTodayDate(1);

  const isManager = currentUser?.role === 'CLUB_MANAGER';
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id) || c.managerId === currentUser?.id) || clubs[0];
  const myCourts = courts?.filter(c => c.clubId === myClub?.id) || [];

  // Helper to check if a game has a score entered
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

  // Helper to check if a game belongs in match history:
  // ANY COMPLETED match (whether score is entered or not, whether video is uploaded or not)
  // OR any ONGOING match with live/final score
  const isGameInHistory = (g) => {
    return g.status === 'COMPLETED' || (g.status === 'ONGOING' && hasScoreEntered(g)) || hasScoreEntered(g);
  };

  // All COMPLETED games (or ONGOING with scores) - publicly visible match history
  const completedGames = games.filter(isGameInHistory);

  // My games / My Venue games:
  const myCompletedGames = currentUser
    ? completedGames.filter(g => {
        if (isManager && myClub?.id) {
          return (
            g.venueReference?.clubId === myClub.id ||
            g.clubId === myClub.id ||
            g.venueReference?.clubName?.toLowerCase() === myClub.name?.toLowerCase()
          );
        }
        return (
          g.confirmedPlayers?.some(p => p.id === currentUser.id) ||
          g.organizer?.id === currentUser.id
        );
      })
    : [];

  const [activeTab, setActiveTab] = useState(currentUser ? 'mine' : 'all');

  const sourceGames = activeTab === 'mine' ? myCompletedGames : completedGames;

  // Venue Management KPI Metrics
  const venueTotalGoals = myCompletedGames.reduce((sum, g) => {
    const sA = parseInt(g.score?.teamA || 0, 10) || 0;
    const sB = parseInt(g.score?.teamB || 0, 10) || 0;
    return sum + sA + sB;
  }, 0);
  const venueAvgGoals = myCompletedGames.length > 0 
    ? (venueTotalGoals / myCompletedGames.length).toFixed(1) 
    : '0.0';
  const venueHighlightsCount = myCompletedGames.filter(g => 
    (gameVideos || []).some(v => v.gameId === g.id) || !!g.videoReference || !!g.videoUrl
  ).length;

  const getResultLabel = (game) => {
    const hasScore = hasScoreEntered(game);
    const scoreA = hasScore ? parseInt(game.score.teamA, 10) : (game.liveScore?.teamA !== undefined ? parseInt(game.liveScore.teamA, 10) : 0);
    const scoreB = hasScore ? parseInt(game.score.teamB, 10) : (game.liveScore?.teamB !== undefined ? parseInt(game.liveScore.teamB, 10) : 0);

    const isDraw = scoreA === scoreB;
    const teamAWon = scoreA > scoreB;

    const confirmed = game.confirmedPlayers || [];
    const playerIndex = confirmed.findIndex(p => p.id === currentUser?.id);

    if (currentUser && playerIndex !== -1 && !isManager) {
      const playerObj = confirmed[playerIndex];
      const maxSlots = game.maxPlayers || 10;
      const teamCap = Math.ceil(maxSlots / 2);

      let playerTeam = playerObj.team;
      if (!playerTeam) {
        playerTeam = playerIndex < teamCap ? 'TEAM_A' : 'TEAM_B';
      }

      if (isDraw) {
        return { 
          type: 'DRAW',
          label: '🤝 DRAW', 
          title: '🤝 DRAW',
          subtitle: hasScore ? 'MATCH TIED' : 'MATCH COMPLETED',
          color: 'gold',
          borderColor: 'border-amber-500/60 dark:border-amber-400/60',
          textColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-500/10'
        };
      }

      const playerTeamWon = (playerTeam === 'TEAM_A' && teamAWon) || (playerTeam === 'TEAM_B' && !teamAWon);

      if (playerTeamWon) {
        return { 
          type: 'WON',
          label: '🎉 YOU WON', 
          title: '🎉 YOU WON!',
          subtitle: 'VICTORY MATCH',
          color: 'emerald',
          borderColor: 'border-emerald-500/60 dark:border-emerald-400/60',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-500/10'
        };
      } else {
        return { 
          type: 'LOST',
          label: '💔 YOU LOST', 
          title: '💔 YOU LOST',
          subtitle: 'DEFEAT MATCH',
          color: 'danger',
          borderColor: 'border-rose-500/60 dark:border-rose-400/60',
          textColor: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-500/10'
        };
      }
    }

    if (!hasScore && !game.liveScore) {
      return { 
        type: 'COMPLETED',
        label: '✅ COMPLETED', 
        title: '✅ COMPLETED',
        subtitle: 'MATCH FINISHED',
        color: 'emerald',
        borderColor: 'border-emerald-500/60',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10'
      };
    }

    if (isDraw) {
      return { 
        type: 'DRAW',
        label: '🤝 DRAW', 
        title: '🤝 DRAW',
        subtitle: 'TIED MATCH',
        color: 'gold',
        borderColor: 'border-amber-500/60',
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10'
      };
    }

    return {
      type: teamAWon ? 'TEAM_A' : 'TEAM_B',
      label: teamAWon ? '🏆 TEAM A WON' : '🏆 TEAM B WON',
      title: teamAWon ? '🏆 TEAM A WON' : '🏆 TEAM B WON',
      subtitle: 'FINAL RESULT',
      color: teamAWon ? 'blue' : 'rose',
      borderColor: teamAWon ? 'border-sky-500/60' : 'border-rose-500/60',
      textColor: teamAWon ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400',
      bgColor: teamAWon ? 'bg-sky-500/10' : 'bg-rose-500/10'
    };
  };

  const filtered = sourceGames.filter(g => {
    const search = searchTerm.toLowerCase();
    const matchTitle = g.title?.toLowerCase().includes(search);
    const matchVenue = g.venueReference?.clubName?.toLowerCase().includes(search);
    const matchCourt = (g.venueReference?.courtName || g.courtName)?.toLowerCase().includes(search);
    const matchCity = g.venueReference?.city?.toLowerCase().includes(search);
    const matchesSearch = matchTitle || matchVenue || matchCourt || matchCity || !searchTerm;

    const matchesFormat = formatFilter === 'all' || g.format === formatFilter;

    // Pitch filter
    const matchesPitch = pitchFilter === 'all' || 
      g.venueReference?.courtId === pitchFilter || 
      g.venueReference?.courtName?.toLowerCase()?.includes(pitchFilter.toLowerCase());

    // Date filtering
    const gameDate = g.dateTime?.date || g.date || '';
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = gameDate === todayStr;
    } else if (dateFilter === 'yesterday') {
      matchesDate = gameDate === getTodayDate(-1);
    } else if (dateFilter === 'past') {
      matchesDate = gameDate <= todayStr;
    } else if (dateFilter === 'custom' && customDate) {
      matchesDate = gameDate === customDate;
    }

    const result = getResultLabel(g);
    const hasVideo = (gameVideos || []).some(v => v.gameId === g.id) || !!g.videoReference || !!g.videoUrl;
    const matchesResult =
      resultFilter === 'all' ||
      (resultFilter === 'won' && (result?.type === 'WON' || result?.type === 'TEAM_A' || result?.type === 'TEAM_B')) ||
      (resultFilter === 'lost' && result?.type === 'LOST') ||
      (resultFilter === 'draw' && result?.type === 'DRAW') ||
      (resultFilter === 'completed' && (result?.type === 'COMPLETED' || g.status === 'COMPLETED')) ||
      (resultFilter === 'video' && hasVideo);

    return matchesSearch && matchesFormat && matchesPitch && matchesDate && matchesResult;
  });

  const resetAllFilters = () => {
    setSearchTerm('');
    setFormatFilter('all');
    setPitchFilter('all');
    setResultFilter('all');
    setDateFilter('all');
    setCustomDate('');
  };

  const formatMatchDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-[1700px] w-full mx-auto px-2 sm:px-4 lg:px-6 overflow-x-hidden">

      {/* ═══ 1. TOP HEADER & VENUE HERO BANNER ═══ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <BackButton 
              fallback={isManager ? "/club/games" : "/player/find-games"} 
              label={isManager ? "Back to Sessions" : "Back to Find Games"} 
              className="mb-2 text-xs font-semibold" 
            />
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0" />
                <span>{isManager ? `${myClub?.name || 'Venue'} Match Records` : 'Match History & Results'}</span>
              </h1>
              {isManager && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official Venue Archive</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isManager 
                ? `Official match records, live scores, and video archives hosted at ${myClub?.name || 'your venue'}.`
                : 'Completed pick-up fixtures, scores, highlights and match outcomes across verified venues.'
              }
            </p>
          </div>

          {/* Source Tabs & View Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            {currentUser && (
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 gap-1">
                {[
                  { key: 'mine', label: isManager ? `🏟️ Venue (${myCompletedGames.length})` : `⚡ My Matches (${myCompletedGames.length})` },
                  { key: 'all', label: `🌐 All Matches (${completedGames.length})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-3.5 rounded-lg text-xs font-black transition-all uppercase text-center cursor-pointer whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* View Mode Toggle (Grid vs List) */}
            <div className="hidden sm:inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ 2. VENUE STATS KPI CARDS (FOR CLUB MANAGER) ═══ */}
        {isManager && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="admin-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Total Matches Hosted
                </span>
                <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {myCompletedGames.length}
                </span>
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Full Time Verified
                </span>
              </div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="admin-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Total Goals Scored
                </span>
                <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {venueTotalGoals}
                </span>
                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-0.5">
                  <Flame className="w-3 h-3" /> High Excitement Venue
                </span>
              </div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="admin-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Scoring Average
                </span>
                <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {venueAvgGoals} <span className="text-xs font-semibold text-slate-400">G/M</span>
                </span>
                <span className="text-[11px] font-bold text-sky-500 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> Competitive 11v11
                </span>
              </div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="admin-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Video Highlights
                </span>
                <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {venueHighlightsCount}
                </span>
                <span className="text-[11px] font-bold text-purple-500 flex items-center gap-1 mt-0.5">
                  <Film className="w-3 h-3" /> Replays Available
                </span>
              </div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center flex-shrink-0">
                <Film className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ 3. MODERN FULL-WIDTH FILTER & SEARCH BAR ═══ */}
      <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        
        {/* Row 1: Search, Pitch Selector & Date Picker */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search match title, pitch, team, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pitch Filter (For Venue Manager) */}
          {isManager && myCourts.length > 0 && (
            <div className="relative flex-shrink-0 min-w-[180px]">
              <select
                value={pitchFilter}
                onChange={(e) => setPitchFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 cursor-pointer"
              >
                <option value="all">🏟️ All Venue Pitches</option>
                {myCourts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Selector */}
          <div className="relative flex-shrink-0">
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-sport-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  if (e.target.value) setDateFilter('custom');
                  else setDateFilter('all');
                }}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer w-32"
                title="Filter by match date"
              />
              {customDate && (
                <button
                  onClick={() => { setCustomDate(''); setDateFilter('all'); }}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Clear date filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Filter Chips & Reset */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'all', label: `All Matches (${sourceGames.length})` },
              { key: 'won', label: '🏆 Team Victories' },
              { key: 'draw', label: '🤝 Draws / Ties' },
              { key: 'video', label: '🎥 With Video Replays' }
            ].map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setResultFilter(opt.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  resultFilter === opt.key
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs font-black'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {(searchTerm || resultFilter !== 'all' || pitchFilter !== 'all' || customDate || dateFilter !== 'all') && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

      </div>

      {/* ═══ 4. MATCH HISTORY CONTENT (RESPONSIVE FULL SCREEN GRID / LIST) ═══ */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-2xl">
            ⚽
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              No match records found
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'mine' 
                ? (isManager ? "No completed matches recorded under the selected filters at your venue." : "You haven't participated in any completed matches matching these criteria.") 
                : 'No completed matches match your search criteria.'}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-sport-500 hover:bg-sport-600 text-white text-xs font-black uppercase shadow-md cursor-pointer transition-all"
          >
            Clear Filters &amp; View All
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ═══ GRID VIEW: BEAUTIFUL FULL-SCREEN 3-COLUMN ADAPTIVE SPORTS CARDS ═══ */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((game, idx) => {
            const result = getResultLabel(game);
            const hasScore = hasScoreEntered(game);
            const hasVideo = (gameVideos || []).some(v => v.gameId === game.id) || !!game.videoReference || !!game.videoUrl;
            const isMyVenue = isManager && (
              game.venueReference?.clubId === myClub?.id ||
              game.venueReference?.clubName?.toLowerCase() === myClub?.name?.toLowerCase()
            );

            const displayScoreA = hasScore ? parseInt(game.score.teamA, 10) : (game.liveScore?.teamA ?? 0);
            const displayScoreB = hasScore ? parseInt(game.score.teamB, 10) : (game.liveScore?.teamB ?? 0);
            const isDraw = hasScore && displayScoreA === displayScoreB;
            const teamAWon = hasScore && displayScoreA > displayScoreB;
            const teamBWon = hasScore && displayScoreB > displayScoreA;
            const gameDate = game.dateTime?.date || game.date;

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="h-full"
              >
                <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden group">
                  
                  <div>
                    {/* Card Top Ribbon */}
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {game.status === 'ONGOING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> LIVE MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            FULL TIME
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px]">
                          {game.format || '11v11'}
                        </span>
                        {isMyVenue && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[10px]">
                            🏟️ Venue Host
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatMatchDate(gameDate)}</span>
                      </div>
                    </div>

                    {/* Match Title & Venue Details */}
                    <div className="p-4 pb-2">
                      <Link to={`/games/${game.id}`} className="block">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-sport-500 transition-colors">
                          {game.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{game.venueReference?.courtName || game.venueReference?.clubName}</span>
                        <span>· {game.venueReference?.city}</span>
                      </p>
                    </div>

                    {/* Sports Scoreboard Widget */}
                    <div className="px-4 py-2">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-3 space-y-2.5">
                        
                        {/* Team A */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-xs border border-sky-500/20 flex-shrink-0">
                              A
                            </div>
                            <span className={`text-xs sm:text-sm font-bold truncate ${teamAWon ? 'text-slate-900 dark:text-white font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                              Team A
                            </span>
                            {teamAWon && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex-shrink-0">
                                🏆 Winner
                              </span>
                            )}
                          </div>
                          <span className={`text-lg sm:text-xl font-mono font-black px-2 py-0.5 rounded ${
                            teamAWon ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400'
                          }`}>
                            {displayScoreA}
                          </span>
                        </div>

                        <div className="border-t border-slate-200/60 dark:border-slate-800/60" />

                        {/* Team B */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xs border border-rose-500/20 flex-shrink-0">
                              B
                            </div>
                            <span className={`text-xs sm:text-sm font-bold truncate ${teamBWon ? 'text-slate-900 dark:text-white font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                              Team B
                            </span>
                            {teamBWon && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex-shrink-0">
                                🏆 Winner
                              </span>
                            )}
                          </div>
                          <span className={`text-lg sm:text-xl font-mono font-black px-2 py-0.5 rounded ${
                            teamBWon ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400'
                          }`}>
                            {displayScoreB}
                          </span>
                        </div>

                        {isDraw && (
                          <div className="pt-1 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-wider">
                              🤝 Match Drawn · Shared Points
                            </span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Match Description */}
                    {game.description && (
                      <div className="px-4 py-1.5">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {game.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom / Footer Actions */}
                  <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {hasVideo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-black">
                          <Play className="w-3 h-3 fill-current" />
                          <span>Highlights</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Kickoff: {game.dateTime?.startTime || '19:00'}
                        </span>
                      )}

                      {game.confirmedPlayers?.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {game.confirmedPlayers.slice(0, 3).map(p => (
                              <Avatar 
                                key={p.id} 
                                src={p.avatar} 
                                name={p.name} 
                                size="xs" 
                                className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900" 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {game.confirmedPlayers.length} Players
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/games/${game.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sport-500 hover:text-white dark:hover:bg-sport-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs flex-shrink-0"
                    >
                      <span>Scorecard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ═══ LIST / TABLE VIEW: FULL-WIDTH EXECUTIVE ROSTER ═══ */
        <div className="admin-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Status &amp; Date</th>
                  <th className="py-3.5 px-4">Match Title &amp; Pitch</th>
                  <th className="py-3.5 px-4 text-center">Scoreboard</th>
                  <th className="py-3.5 px-4 text-center">Outcome</th>
                  <th className="py-3.5 px-4">Lineup &amp; Video</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(game => {
                  const hasScore = hasScoreEntered(game);
                  const sA = hasScore ? parseInt(game.score.teamA, 10) : (game.liveScore?.teamA ?? 0);
                  const sB = hasScore ? parseInt(game.score.teamB, 10) : (game.liveScore?.teamB ?? 0);
                  const isDraw = hasScore && sA === sB;
                  const teamAWon = hasScore && sA > sB;
                  const teamBWon = hasScore && sB > sA;
                  const hasVideo = (gameVideos || []).some(v => v.gameId === game.id) || !!game.videoReference || !!game.videoUrl;

                  return (
                    <tr key={game.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 block w-max">
                          FULL TIME
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold block mt-1">
                          {formatMatchDate(game.dateTime?.date || game.date)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate max-w-xs">
                          {game.title}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-sport-500" />
                          {game.venueReference?.courtName || game.venueReference?.clubName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-black text-sm">
                          <span className={teamAWon ? 'text-sky-500' : 'text-slate-400'}>{sA}</span>
                          <span className="text-slate-400">:</span>
                          <span className={teamBWon ? 'text-rose-500' : 'text-slate-400'}>{sB}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isDraw ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase border border-amber-500/20">
                            🤝 Tied
                          </span>
                        ) : teamAWon ? (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase border border-sky-500/20">
                            🏆 Team A Won
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase border border-rose-500/20">
                            🏆 Team B Won
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {hasVideo && (
                            <span className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" title="Highlights available">
                              <Film className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-slate-500">
                            {game.confirmedPlayers?.length || 0} players
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/games/${game.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sport-500 hover:text-white dark:hover:bg-sport-500 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchHistoryPage;

