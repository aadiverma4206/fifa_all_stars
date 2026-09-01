import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, Search, Filter, ChevronRight, Clock, Users, ArrowLeft, Star, Sparkles, TrendingDown, Zap, XCircle, Award } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import BackButton from '../../components/common/BackButton';

export const MatchHistoryPage = () => {
  const { games } = useDataStore();
  const { currentUser } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  // All COMPLETED or ONGOING games (publicly visible match history)
  const completedGames = games.filter(g => g.status === 'COMPLETED' || g.status === 'ONGOING');

  // My games: matches I participated in (if logged in)
  const myCompletedGames = currentUser
    ? completedGames.filter(g =>
        g.confirmedPlayers?.some(p => p.id === currentUser.id) ||
        g.organizer?.id === currentUser.id
      )
    : [];

  const [activeTab, setActiveTab] = useState(currentUser ? 'mine' : 'all');

  const sourceGames = activeTab === 'mine' ? myCompletedGames : completedGames;

  const filtered = sourceGames.filter(g => {
    const search = searchTerm.toLowerCase();
    const matchTitle = g.title?.toLowerCase().includes(search);
    const matchVenue = g.venueReference?.clubName?.toLowerCase().includes(search);
    const matchCity = g.venueReference?.city?.toLowerCase().includes(search);
    const matchesSearch = matchTitle || matchVenue || matchCity || !searchTerm;

    const matchesFormat = formatFilter === 'all' || g.format === formatFilter;

    const hasScore = g.score && (g.score.teamA !== null || g.score.teamB !== null);
    const matchesResult = resultFilter === 'all' || (resultFilter === 'with_score' && hasScore) || (resultFilter === 'no_score' && !hasScore);

    return matchesSearch && matchesFormat && matchesResult;
  });

  const getResultLabel = (game) => {
    if (!game.score || game.score.teamA === undefined || game.score.teamA === null) return null;
    const teamA = parseInt(game.score.teamA, 10);
    const teamB = parseInt(game.score.teamB, 10);

    const isDraw = teamA === teamB;
    const teamAWon = teamA > teamB;

    const confirmed = game.confirmedPlayers || [];
    const playerIndex = confirmed.findIndex(p => p.id === currentUser?.id);

    if (currentUser && playerIndex !== -1) {
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
          subtitle: 'MATCH TIED',
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

  const formats = ['all', '5v5', '7v7', '3v3', '1v1'];

  return (
    <div className="space-y-6 py-6 max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-10 overflow-x-hidden">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <BackButton fallback="/player/find-games" label="Back to Find Games" className="mb-2 text-xs font-semibold" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <span>Match History & Results</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            View completed pick-up matches, final scores, Elo ratings, and competitive results.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <span className="block text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">{completedGames.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Matches</span>
          </div>
          {currentUser && (
            <div className="px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <span className="block text-lg font-mono font-bold text-amber-500">{myCompletedGames.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Matches</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Workspace Control Toolbar */}
      <div className="space-y-3">
        
        {/* Source Tab Segmented Ribbon */}
        {currentUser && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto w-full sm:w-auto inline-flex">
            {[
              { key: 'mine', label: '⚡ My Match History' },
              { key: 'all', label: '🌐 All Completed Matches' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="admin-card p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by match title, venue or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
          </div>

          {/* Format & Result Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format:</span>
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => setFormatFilter(f)}
                  className={`px-3 py-1 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
                    formatFilter === f
                      ? 'bg-sport-500 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All Formats' : f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'with_score', label: '✅ With Score' },
                { key: 'no_score', label: '⏳ No Score Yet' }
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setResultFilter(opt.key)}
                  className={`px-3 py-1 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
                    resultFilter === opt.key
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Match History List */}
      {filtered.length === 0 ? (
        <div className="admin-card p-12 text-center space-y-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-xl">⚽</div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">No matches found</h3>
            <p className="text-xs font-medium text-slate-400 mt-1">
              {activeTab === 'mine' ? "You haven't participated in any completed matches yet." : 'No completed matches match your filters.'}
            </p>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setFormatFilter('all'); setResultFilter('all'); }}
            className="px-4 py-2 rounded-md bg-sport-500 hover:bg-sport-600 text-white text-xs font-bold uppercase shadow-sm cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((game, idx) => {
            const result = getResultLabel(game);
            const hasScore = game.score && game.score.teamA !== null;
            const isMyGame = currentUser && (
              game.confirmedPlayers?.some(p => p.id === currentUser.id) ||
              game.organizer?.id === currentUser.id
            );

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
              >
                <Link to={`/games/${game.id}`} className="block">
                  <div className={`admin-card admin-card-hover p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all group ${isMyGame ? 'border-l-4 border-l-sport-500' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                      {/* Score Block */}
                      <div className={`flex-shrink-0 w-full sm:w-28 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 p-3 rounded-md border ${
                        hasScore
                          ? 'bg-slate-950 text-white border-slate-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        {hasScore ? (
                          <>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xl sm:text-2xl font-mono font-bold text-white leading-none">
                                {game.score.teamA}
                              </span>
                              <span className="text-xs font-bold text-slate-400">–</span>
                              <span className="text-xl sm:text-2xl font-mono font-bold text-white leading-none">
                                {game.score.teamB}
                              </span>
                            </div>
                            <span className="hidden sm:block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              FINAL SCORE
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">No Score</span>
                        )}
                      </div>

                      {/* Match Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'} size="sm" className="rounded-md">{game.format}</Badge>
                          {game.status === 'ONGOING' ? (
                            <Badge variant="danger" size="sm" className="rounded-md">🔴 LIVE / ONGOING</Badge>
                          ) : (
                            <Badge variant="emerald" size="sm" className="rounded-md">✅ COMPLETED</Badge>
                          )}
                          {result && (
                            <Badge variant={result.color} size="sm" className="rounded-md">🏆 {result.label}</Badge>
                          )}
                          {isMyGame && (
                            <Badge variant="gold" size="sm" className="rounded-md">⚡ My Match</Badge>
                          )}
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-sport-500 transition-colors">
                          {game.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                            {game.venueReference?.clubName} • {game.venueReference?.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            {game.dateTime?.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            {game.dateTime?.startTime} – {game.dateTime?.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 flex-shrink-0" />
                            {game.confirmedPlayers?.length || 0} / {game.maxPlayers} Players
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
                                <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-900">
                                  +{game.confirmedPlayers.length - 6}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">participants</span>
                          </div>
                        )}
                      </div>

                      {/* RIGHT SIDE SLEEK FLOATING ANIMATED RESULT */}
                      {result && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.15 }}
                          className="flex-shrink-0 px-2 sm:px-4 py-2 flex flex-col items-center justify-center text-center bg-transparent border-0 shadow-none select-none cursor-pointer"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            {result.type === 'WON' ? (
                              <motion.div
                                animate={{ rotate: [0, -8, 8, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="flex items-center space-x-1"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <Trophy className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                              </motion.div>
                            ) : result.type === 'LOST' ? (
                              <motion.div
                                animate={{ y: [0, -2, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="flex items-center space-x-1"
                              >
                                <XCircle className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                              </motion.div>
                            ) : (
                              <div>
                                <Award className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                              </div>
                            )}

                            <span className={`text-sm sm:text-base font-bold uppercase tracking-wider block leading-none ${result.textColor}`}>
                              {result.title}
                            </span>

                            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-widest pt-0.5">
                              {result.subtitle}
                            </span>

                            {result.type === 'WON' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] uppercase mt-1 border border-emerald-500/20">
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                                <span>+32 ELO</span>
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
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
