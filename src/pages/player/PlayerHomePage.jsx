import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Flame, MapPin, Search, ArrowRight, Play, Compass, Sparkles, 
  Wallet, Award, CheckCircle, ShieldCheck, UserCheck, Bell, 
  Trophy, Calendar, Clock, ChevronRight, Plus, Filter, Users
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getEloBadgeInfo } from '../../utils/eloCalculator';
import GameCard from '../../components/player/GameCard';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import FootballScene from '../../components/football3d/FootballScene';

export const PlayerHomePage = () => {
  const { games, clubs, courts, notifications, markNotificationRead } = useDataStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeedTab, setActiveFeedTab] = useState('all');

  const eloRating = currentUser?.eloRating || currentUser?.elo || 1840;
  const eloBadge = getEloBadgeInfo(eloRating);

  // Filter games based on privacy & player affiliation
  const accessibleGames = games.filter(g => {
    if (g.privacy === 'PRIVATE') {
      const isMember = currentUser?.clubsJoined?.includes(g.venueReference?.clubId);
      const isParticipant = g.confirmedPlayers?.some(p => p.id === currentUser?.id);
      const isOrganizer = g.organizer?.id === currentUser?.id;
      return isMember || isParticipant || isOrganizer;
    }
    return true; // PUBLIC games visible to all
  });

  const myJoinedGames = accessibleGames.filter(g => 
    g.confirmedPlayers?.some(p => p.id === currentUser?.id)
  );

  const myClubGames = accessibleGames.filter(g => 
    currentUser?.clubsJoined?.includes(g.venueReference?.clubId)
  );

  const completedGames = accessibleGames.filter(g => g.status === 'COMPLETED');
  
  // Next upcoming match for current user
  const nextMatch = myJoinedGames.find(g => g.status !== 'COMPLETED');

  // Filter feed according to active tab, selected city, and search query
  let baseTabGames = accessibleGames;
  if (activeFeedTab === 'my_club') baseTabGames = myClubGames;
  if (activeFeedTab === 'joined') baseTabGames = myJoinedGames;
  if (activeFeedTab === 'completed') baseTabGames = completedGames;

  const displayedGames = baseTabGames.filter(g => {
    const matchesCity = !selectedCity || (g.venueReference?.city?.toLowerCase() === selectedCity.toLowerCase());
    const matchesQuery = !searchQuery || 
      g.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.venueReference?.clubName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  // Recent notifications for current user
  const userNotifs = notifications.filter(n => 
    !n.userId || n.userId === currentUser?.id || (n.clubId && currentUser?.clubsJoined?.includes(n.clubId))
  ).slice(0, 4);

  // Top featured venues for sidebar
  const topClubs = clubs.slice(0, 3);

  const citiesList = ['Raipur', 'Bangalore', 'Mumbai', 'Delhi', 'Pune'];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedCity || searchQuery) {
      navigate(`/games?city=${encodeURIComponent(selectedCity)}&query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/games');
    }
  };

  return (
    <div className="w-full space-y-6 py-4 overflow-x-hidden">
      
      {/* 1. TOP PLAYER WELCOME & QUICK STATS BAR */}
      <motion.div 
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-lg bg-slate-950 text-white border border-slate-800 shadow-md relative overflow-hidden"
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          
          {/* Welcome User Info */}
          <div className="flex items-center space-x-4">
            <Avatar 
              src={currentUser?.profileImageUrl || currentUser?.avatar} 
              name={currentUser?.name} 
              size="lg" 
              status="active" 
              className="rounded-md ring-2 ring-sport-500 shadow-xs"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-white">
                  Welcome, {currentUser?.name || 'Player'}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-sport-500/20 text-sport-400 border border-sport-500/30 text-[10px] font-bold uppercase">
                  {eloBadge.title}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400 flex items-center space-x-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                <span>{currentUser?.city || 'Raipur'}, India</span>
                <span className="text-slate-700">•</span>
                <span className="text-slate-300 font-semibold">@{currentUser?.name?.toLowerCase()?.replace(/\s+/g, '') || 'player'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full xl:w-auto">
            
            <div className="bg-slate-900/90 p-3 rounded-md border border-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                ⚡
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block leading-tight">Elo Rating</span>
                <span className="text-sm font-mono font-bold text-amber-400">{eloRating}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-md border border-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-sport-500/10 border border-sport-500/30 flex items-center justify-center text-sport-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block leading-tight">Joined</span>
                <span className="text-sm font-bold text-white">{myJoinedGames.length} Matches</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-md border border-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block leading-tight">Clubs</span>
                <span className="text-sm font-bold text-white">{currentUser?.clubsJoined?.length || 1}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-md border border-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block leading-tight">Wallet</span>
                <span className="text-sm font-mono font-bold text-emerald-400">₹{currentUser?.walletBalance?.toFixed(0) || '250'}</span>
              </div>
            </div>

          </div>

        </div>
      </motion.div>


      {/* 2. CINEMATIC HERO & SEARCH BAR */}
      <section className="relative rounded-lg overflow-hidden min-h-[380px] lg:min-h-[420px] flex items-center p-6 sm:p-8 border border-slate-800 shadow-md bg-slate-950 text-white">
        <div className="absolute inset-0 bg-radial from-sport-500/20 via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Interactive Search */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-sport-500/10 border border-sport-500/30 text-sport-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FIFA ALL STARS MATCHMAKING</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight uppercase leading-none text-white">
                PLAY. CONNECT. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sport-400 via-amber-400 to-sky-400">
                  DOMINATE THE PITCH.
                </span>
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl">
                Join verified grassroots football matches near you, confirm your roster spot, and rise through the Division Leaderboard.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link to="/games">
                <Button variant="primary" size="md" icon={Play} rainbowBorder={false} className="rounded-md font-bold text-xs uppercase px-5 py-2.5 shadow-sm">
                  FIND A GAME
                </Button>
              </Link>

              <Link to="/courts">
                <Button variant="outline" size="md" icon={Compass} className="rounded-md font-bold text-xs uppercase px-5 py-2.5 border-slate-700 text-white hover:bg-slate-800">
                  EXPLORE TURFS
                </Button>
              </Link>
            </div>

            {/* Integrated Search Box */}
            <form onSubmit={handleSearchSubmit} className="bg-slate-900/90 p-3.5 sm:p-4 rounded-md border border-slate-800 shadow-md space-y-3 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-sport-400" />
                <span>Search Grassroots Matches Near You</span>
              </span>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-800 bg-slate-950 text-slate-100 font-medium text-xs focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  >
                    <option value="">All Cities</option>
                    {citiesList.map((city, idx) => (
                      <option key={idx} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search match or venue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 font-medium text-xs focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-sport-500 hover:bg-sport-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

          </div>

          {/* Right 3D Football Scene */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[260px] sm:min-h-[300px]">
            <FootballScene />
          </div>

        </div>
      </section>


      {/* 3. MAIN DASHBOARD CONTENT (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER COLUMN: MATCH DISCOVERY FEED (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Feed Filter Header & Tabs */}
          <div className="admin-card p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-md bg-sport-500/10 text-sport-500 flex items-center justify-center font-bold border border-sport-500/20">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                    Match Discovery Feed
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Showing {displayedGames.length} active pitch sessions
                  </p>
                </div>
              </div>

              <Link to="/games" className="text-xs font-bold text-sport-500 hover:underline flex items-center space-x-1">
                <span>View All Games</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Filter Tabs Ribbon */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto">
              {[
                { id: 'all', label: 'All Open Games', count: accessibleGames.length, icon: Flame },
                { id: 'my_club', label: 'My Club Games', count: myClubGames.length, icon: ShieldCheck },
                { id: 'joined', label: 'My Joined', count: myJoinedGames.length, icon: UserCheck },
                { id: 'completed', label: 'Completed Scores', count: completedGames.length, icon: CheckCircle }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeFeedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeedTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-sm text-xs font-bold transition-all uppercase whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-xs text-[10px] ${
                      isActive ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matches Cards Grid */}
          {displayedGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="admin-card p-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  No Matches Found
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  There are no matches matching your active filters or search query.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => { setActiveFeedTab('all'); setSelectedCity(''); setSearchQuery(''); }}
                  className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase cursor-pointer"
                >
                  Reset Filters
                </button>
                <Link to="/games">
                  <Button variant="primary" size="sm" className="rounded-md font-bold text-xs uppercase">Explore All Matches</Button>
                </Link>
              </div>
            </div>
          )}

        </div>


        {/* RIGHT COLUMN: PLAYER PROFILE & SIDEBAR WIDGETS (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. PLAYER PROFILE CARD WIDGET */}
          <div className="admin-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center space-x-3.5">
              <Avatar 
                src={currentUser?.profileImageUrl || currentUser?.avatar} 
                name={currentUser?.name} 
                size="lg" 
                status="active" 
                className="rounded-md"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight truncate">
                  {currentUser?.name}
                </h3>
                <span className="text-xs font-medium text-slate-400 block truncate">
                  @{currentUser?.name?.toLowerCase()?.replace(/\s+/g, '') || 'player'}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase">
                  {eloBadge.title} ({eloRating} ELO)
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-medium">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>📍 Location</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentUser?.city || 'Raipur'}, India</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>⚽ Games Joined</span>
                <span className="font-bold text-sport-500">{myJoinedGames.length}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>🛡️ Clubs Joined</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentUser?.clubsJoined?.length || 1}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Wallet Balance</span>
                <span className="text-lg font-mono font-bold text-amber-500">₹{currentUser?.walletBalance?.toFixed(2) || '250.00'}</span>
              </div>
              <Link to="/profile">
                <Button variant="gold" size="sm" className="rounded-md font-bold text-xs uppercase">Profile & Wallet</Button>
              </Link>
            </div>
          </div>

          {/* 2. UPCOMING MATCH REMINDER WIDGET */}
          {nextMatch && (
            <div className="admin-card p-5 rounded-lg border border-slate-800 bg-slate-950 text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-sport-400 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-sport-400" />
                  <span>Next Upcoming Match</span>
                </span>
                <Badge variant="emerald" size="sm" className="rounded-md">
                  CONFIRMED
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white truncate">
                  {nextMatch.title}
                </h4>
                <p className="text-xs font-medium text-slate-300 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-sport-400 flex-shrink-0" />
                  <span className="truncate">{nextMatch.venueReference?.clubName || 'Bernabeu Arena'}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-slate-800 text-slate-300">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-sport-400" />
                  <span>{nextMatch.dateTime?.date} • {nextMatch.dateTime?.startTime}</span>
                </div>
                <Link to={`/games/${nextMatch.id}`} className="text-sport-400 hover:underline text-xs font-bold">
                  Match Details →
                </Link>
              </div>
            </div>
          )}

          {/* 3. RECENT NOTIFICATIONS WIDGET */}
          <div className="admin-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Bell className="w-4 h-4 text-sport-500" />
                <span>Recent Activity</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {userNotifs.length} Alerts
              </span>
            </div>

            <div className="space-y-2">
              {userNotifs.length > 0 ? (
                userNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { markNotificationRead(n.id); if (n.linkUrl) navigate(n.linkUrl); }}
                    className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sport-500/50 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{n.title}</span>
                      <span className="text-[9px] font-medium text-slate-400 flex-shrink-0">{n.date}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-medium italic text-center py-4">No recent notifications</p>
              )}
            </div>
          </div>

          {/* 4. NEARBY FEATURED PITCH TURFS */}
          <div className="admin-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-sport-500" />
                <span>Top Nearby Turfs</span>
              </span>
              <Link to="/courts" className="text-[11px] font-bold text-sport-500 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {topClubs.map(club => (
                <div key={club.id} className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {club.name}
                    </h5>
                    <p className="text-[10px] font-medium text-slate-400 flex items-center space-x-1 truncate">
                      <MapPin className="w-3 h-3 text-sport-500 flex-shrink-0" />
                      <span>{club.city || 'Raipur'}</span>
                      <span>•</span>
                      <span>⭐ {club.rating || '4.9'}</span>
                    </p>
                  </div>
                  <Link to={`/courts/book/${club.id || 'crt_rp_101'}`}>
                    <Button variant="outline" size="sm" className="rounded-md text-[11px] px-2.5 py-1 border-slate-300 dark:border-slate-700">
                      Book
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PlayerHomePage;
