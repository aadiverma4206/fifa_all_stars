import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, Search, Filter, ChevronRight, Clock, Users, ArrowLeft, Star, Sparkles, TrendingDown, Zap, XCircle, Award, Film, Building2, X, RotateCcw } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import BackButton from '../../components/common/BackButton';

export const MatchHistoryPage = () => {
  const { games, gameVideos, clubs } = useDataStore();
  const { currentUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'tomorrow' | 'past' | 'custom'
  const [customDate, setCustomDate] = useState('');

  const todayStr = getTodayDate(0);
  const tomorrowStr = getTodayDate(1);

  const isManager = currentUser?.role === 'CLUB_MANAGER';
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];

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
        if (isManager && myClub?.id && g.venueReference?.clubId === myClub.id) return true;
        return (
          g.confirmedPlayers?.some(p => p.id === currentUser.id) ||
          g.organizer?.id === currentUser.id
        );
      })
    : [];

  const [activeTab, setActiveTab] = useState(currentUser ? 'mine' : 'all');

  const sourceGames = activeTab === 'mine' ? myCompletedGames : completedGames;

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
    const matchCity = g.venueReference?.city?.toLowerCase().includes(search);
    const matchesSearch = matchTitle || matchVenue || matchCity || !searchTerm;

    const matchesFormat = formatFilter === 'all' || g.format === formatFilter;

    // Date filtering
    const gameDate = g.dateTime?.date || g.date || '';
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = gameDate === todayStr;
    } else if (dateFilter === 'tomorrow') {
      matchesDate = gameDate === tomorrowStr;
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

    return matchesSearch && matchesFormat && matchesDate && matchesResult;
  });

  const formats = ['all', '11v11'];

  const resetAllFilters = () => {
    setSearchTerm('');
    setFormatFilter('all');
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
    <div className="space-y-4 py-4 sm:py-6 max-w-4xl w-full mx-auto px-3 sm:px-6 lg:px-8 overflow-x-hidden">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <BackButton fallback={isManager ? "/club/games" : "/player/find-games"} label={isManager ? "Back to Sessions" : "Back to Find Games"} className="mb-1.5 text-xs font-semibold" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />
            <span>{isManager ? `${myClub?.name || 'Venue'} Match Records` : 'Match History & Results'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isManager 
              ? 'Official match records and final scores hosted at your venue.'
              : 'Completed pick-up fixtures, scores, highlights and match outcomes.'
            }
          </p>
        </div>

        {/* Source Tab Segmented Ribbon */}
        {currentUser && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto gap-1 self-start sm:self-center">
            {[
              { key: 'mine', label: isManager ? `🏟️ Venue (${myCompletedGames.length})` : `⚡ My Matches (${myCompletedGames.length})` },
              { key: 'all', label: `🌐 All Matches (${completedGames.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all uppercase text-center cursor-pointer truncate ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5">
        
        {/* Row 1: Search & Date Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search match, turf, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Selector */}
          <div className="relative flex-shrink-0">
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 gap-1.5 focus-within:ring-2 focus-within:ring-sport-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  if (e.target.value) setDateFilter('custom');
                  else setDateFilter('all');
                }}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer w-28 sm:w-32"
                title="Filter by date"
              />
              {customDate && (
                <button
                  onClick={() => { setCustomDate(''); setDateFilter('all'); }}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Clear date"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Filter Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[
              { key: 'all', label: `All (${sourceGames.length})` },
              { key: 'won', label: '🏆 Wins' },
              { key: 'lost', label: '💔 Defeats' },
              { key: 'draw', label: '🤝 Draws' },
              { key: 'video', label: '🎥 Highlights' }
            ].map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setResultFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  resultFilter === opt.key
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-black'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {(searchTerm || resultFilter !== 'all' || customDate || dateFilter !== 'all') && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 whitespace-nowrap flex items-center gap-1 pl-2 flex-shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Match History List */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-xl">⚽</div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No match records found</h3>
            <p className="text-xs font-medium text-slate-400 mt-1">
              {activeTab === 'mine' ? (isManager ? "No completed matches recorded at your venue yet." : "You haven't participated in any completed matches yet.") : 'No completed matches match your search filters.'}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl bg-sport-500 hover:bg-sport-600 text-white text-xs font-bold uppercase shadow-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((game, idx) => {
            const result = getResultLabel(game);
            const hasScore = hasScoreEntered(game);
            const hasVideo = (gameVideos || []).some(v => v.gameId === game.id) || !!game.videoReference || !!game.videoUrl;
            const isMyGame = currentUser && (
              game.confirmedPlayers?.some(p => p.id === currentUser.id) ||
              game.organizer?.id === currentUser.id ||
              (isManager && game.venueReference?.clubId === myClub?.id)
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
              >
                <Link to={`/games/${game.id}`} className="block group">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden">
                    
                    {/* 1. Header Ribbon: Status, Format, Date */}
                    <div className="px-3.5 sm:px-4 py-2 bg-slate-50/90 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {game.status === 'ONGOING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> LIVE MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            FULL TIME
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px]">
                          {game.format || '11v11'}
                        </span>
                        {isMyGame && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[10px]">
                            {isManager ? '🏟️ Venue' : '⚡ My Match'}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatMatchDate(gameDate)}</span>
                        {game.dateTime?.startTime && (
                          <span className="text-slate-400 font-medium">· {game.dateTime.startTime}</span>
                        )}
                      </div>
                    </div>

                    {/* 2. Match Title & Venue */}
                    <div className="px-3.5 sm:px-4 pt-3 pb-1">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-sport-500 transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium truncate">
                        <MapPin className="w-3 h-3 text-sport-500 flex-shrink-0" />
                        <span className="truncate">{game.venueReference?.clubName} · {game.venueReference?.city}</span>
                      </p>
                    </div>

                    {/* 3. Sleek Sports Scoreboard */}
                    <div className="px-3.5 sm:px-4 py-2.5">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80 p-2.5 space-y-2">
                        
                        {/* Team A */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-[11px] border border-sky-500/20 flex-shrink-0">
                              A
                            </div>
                            <span className={`text-xs font-bold truncate ${teamAWon ? 'text-slate-900 dark:text-white font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                              Team A
                            </span>
                            {teamAWon && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex-shrink-0">
                                🏆 Winner
                              </span>
                            )}
                          </div>
                          <span className={`text-base sm:text-lg font-mono font-black px-2 py-0.5 rounded ${
                            teamAWon ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400'
                          }`}>
                            {displayScoreA}
                          </span>
                        </div>

                        <div className="border-t border-slate-200/60 dark:border-slate-800/60" />

                        {/* Team B */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-[11px] border border-rose-500/20 flex-shrink-0">
                              B
                            </div>
                            <span className={`text-xs font-bold truncate ${teamBWon ? 'text-slate-900 dark:text-white font-black' : 'text-slate-600 dark:text-slate-400'}`}>
                              Team B
                            </span>
                            {teamBWon && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex-shrink-0">
                                🏆 Winner
                              </span>
                            )}
                          </div>
                          <span className={`text-base sm:text-lg font-mono font-black px-2 py-0.5 rounded ${
                            teamBWon ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400'
                          }`}>
                            {displayScoreB}
                          </span>
                        </div>

                        {isDraw && (
                          <div className="pt-1 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                              🤝 Match Ended in a Draw
                            </span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* 4. Footer: Personal Result, Highlights & Players */}
                    <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50/60 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Only show personal outcome if user actually played */}
                        {currentUser && (result?.type === 'WON' || result?.type === 'LOST') ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${result.bgColor} ${result.textColor} border ${result.borderColor}`}>
                            {result.label}
                          </span>
                        ) : null}

                        {hasVideo ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            <span>Highlights Available</span>
                          </span>
                        ) : (!currentUser || (result?.type !== 'WON' && result?.type !== 'LOST')) && game.organizer?.name ? (
                          <span className="text-[11px] font-medium text-slate-400">
                            Host: <span className="font-bold text-slate-600 dark:text-slate-300">{game.organizer.name}</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {game.confirmedPlayers?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-1.5">
                              {game.confirmedPlayers.slice(0, 3).map(p => (
                                <Avatar key={p.id} src={p.avatar} name={p.name} size="xs" className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900" />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {game.confirmedPlayers.length}p
                            </span>
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-slate-500 group-hover:text-sport-500 flex items-center transition-colors">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MatchHistoryPage;
