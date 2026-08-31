import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, Search, Filter, ChevronRight, Clock, Users, ArrowLeft, Star } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';

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
    if (!game.score || game.score.teamA === null) return null;
    const { teamA, teamB } = game.score;
    if (teamA > teamB) return { label: 'Team A Won', color: 'emerald' };
    if (teamB > teamA) return { label: 'Team B Won', color: 'blue' };
    return { label: 'Draw', color: 'gold' };
  };

  const formats = ['all', '5v5', '7v7', '3v3', '1v1'];

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link to="/player/find-games" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-sport-500 mb-3 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Find Games</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500 flex-shrink-0" />
            Match History
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            View completed matches, final scores, and results
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="block text-xl font-black text-emerald-500">{completedGames.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Matches</span>
          </div>
          {currentUser && (
            <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="block text-xl font-black text-amber-500">{myCompletedGames.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">My Matches</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: All vs My Matches */}
      {currentUser && (
        <div className="flex gap-2">
          {[
            { key: 'mine', label: '⚡ My Match History' },
            { key: 'all', label: '🌐 All Completed Matches' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === tab.key
                  ? 'bg-sport-500 text-white shadow-md shadow-sport-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="footy-card p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by match title, venue or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
          />
        </div>

        {/* Format & Result Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase">Format:</span>
            {formats.map(f => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  formatFilter === f
                    ? 'bg-sport-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All Formats' : f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase">Score:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'with_score', label: '✅ With Score' },
              { key: 'no_score', label: '⏳ No Score Yet' }
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setResultFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  resultFilter === opt.key
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Match History List */}
      {filtered.length === 0 ? (
        <div className="footy-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-3xl">⚽</div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">No matches found</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              {activeTab === 'mine' ? "You haven't participated in any completed matches yet." : 'No completed matches match your filters.'}
            </p>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setFormatFilter('all'); setResultFilter('all'); }}
            className="px-4 py-2 rounded-xl bg-sport-500 text-white text-xs font-black"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link to={`/games/${game.id}`} className="block">
                  <div className={`footy-card p-4 sm:p-5 hover:border-sport-500/40 transition-all group ${isMyGame ? 'border-l-4 border-l-sport-500' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                      {/* Score Block */}
                      <div className={`flex-shrink-0 w-full sm:w-28 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 p-3 rounded-2xl ${
                        hasScore
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {hasScore ? (
                          <>
                            <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                              {game.score.teamA}
                            </span>
                            <span className="text-xs font-black text-slate-400 px-1">–</span>
                            <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                              {game.score.teamB}
                            </span>
                            <span className="hidden sm:block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                              FINAL SCORE
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-black uppercase tracking-wide text-slate-400">No Score</span>
                        )}
                      </div>

                      {/* Match Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'} size="sm">{game.format}</Badge>
                          {game.status === 'ONGOING' ? (
                            <Badge variant="danger" size="sm">🔴 LIVE / ONGOING</Badge>
                          ) : (
                            <Badge variant="emerald" size="sm">✅ COMPLETED</Badge>
                          )}
                          {result && (
                            <Badge variant={result.color} size="sm">🏆 {result.label}</Badge>
                          )}
                          {isMyGame && (
                            <Badge variant="gold" size="sm">⚡ My Match</Badge>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-sport-500 transition-colors">
                          {game.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                            <div className="flex -space-x-2">
                              {game.confirmedPlayers.slice(0, 6).map(p => (
                                <Avatar key={p.id} src={p.avatar} name={p.name} size="xs" className="border-2 border-white dark:border-slate-900" />
                              ))}
                              {game.confirmedPlayers.length > 6 && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-white border-2 border-white dark:border-slate-900">
                                  +{game.confirmedPlayers.length - 6}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">participants</span>
                          </div>
                        )}
                      </div>

                      {/* View Details Arrow */}
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-sport-500 transition-colors hidden sm:block flex-shrink-0" />
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
