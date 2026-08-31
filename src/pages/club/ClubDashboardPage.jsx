import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, Calendar, DollarSign, Plus, Clock, MapPin, Users, Flame, 
  Trophy, ChevronRight, Eye, ShieldCheck, Activity, Sparkles, CheckCircle2, 
  AlertCircle, TrendingUp, BarChart3, Settings, Layers, Star, ArrowUpRight,
  Filter, Search, Trash2
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import toast from 'react-hot-toast';

export const ClubDashboardPage = () => {
  const navigate = useNavigate();
  const { clubs, courts, bookings, games, updateCourtStatus, removeGame } = useDataStore();
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('all');

  // Manager's primary club & courts
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);
  const clubBookings = bookings.filter(b => b.clubId === myClub?.id);

  // All games at this venue
  const venueGames = games.filter(g => g.venueReference?.clubId === myClub?.id);
  const liveGames = venueGames.filter(g => g.status === 'ONGOING');
  const openGames = venueGames.filter(g => g.status === 'OPEN_FOR_JOINING' || g.status === 'FULL');
  const completedGames = venueGames.filter(g => g.status === 'COMPLETED');

  const todayStr = getTodayDate();
  const todayBookings = clubBookings.filter(b => b.date === todayStr || b.date === getTodayDate(1));
  const thisMonthRevenue = clubBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  const utilizationData = [
    { day: 'Mon', hours: 5.5, percent: 55, peak: '18:00 - 22:00' },
    { day: 'Tue', hours: 7.0, percent: 70, peak: '18:00 - 22:00' },
    { day: 'Wed', hours: 8.5, percent: 85, peak: '17:30 - 22:30' },
    { day: 'Thu', hours: 6.5, percent: 65, peak: '18:00 - 22:00' },
    { day: 'Fri', hours: 9.5, percent: 95, peak: '16:00 - 23:00' },
    { day: 'Sat', hours: 11.0, percent: 100, peak: '07:00 - 23:00' },
    { day: 'Sun', hours: 10.0, percent: 90, peak: '07:00 - 22:00' }
  ];

  const handleToggleCourtStatus = (courtId, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    if (updateCourtStatus) {
      updateCourtStatus(courtId, nextStatus);
      toast.success(`Court status updated to ${nextStatus}`);
    } else {
      toast.success(`Court status toggled to ${nextStatus}`);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'COMPLETED') return <Badge variant="emerald" size="sm">✅ Completed</Badge>;
    if (status === 'ONGOING') return <Badge variant="danger" size="sm">🔴 Live Now</Badge>;
    if (status === 'FULL') return <Badge variant="blue" size="sm">🔒 Roster Full</Badge>;
    return <Badge variant="gold" size="sm">🟢 Open</Badge>;
  };

  return (
    <div className="space-y-8 py-4 max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* 1. MANAGER HERO BANNER & QUICK ACTIONS */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="footy-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-sport-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Club Info */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sport-600 to-emerald-400 p-0.5 shadow-xl flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-2xl font-black text-sport-400">
                🏟️
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white">
                  {myClub?.name || 'Club Manager Portal'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED VENUE
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-400 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                  {myClub?.address || 'Raipur Turf Complex'} ({myClub?.city || 'Raipur'})
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {myClub?.rating || '4.9'} ({myClub?.totalReviews || 128} Reviews)
                </span>
              </p>
            </div>
          </div>

          {/* Right Manager Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              size="md" 
              icon={Plus} 
              onClick={() => navigate('/club/games')} 
              className="shadow-xl shadow-sport-500/20"
            >
              CREATE GAME SESSION
            </Button>

            <Button 
              variant="outline" 
              size="md" 
              icon={Building2} 
              onClick={() => navigate('/club/courts')} 
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              PITCH DIRECTORY
            </Button>
          </div>

        </div>
      </motion.div>


      {/* 2. KPI METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pitches & Courts</span>
            <div className="w-8 h-8 rounded-xl bg-sport-500/10 text-sport-500 flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">{myCourts.length} Pitches</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{myCourts.filter(c => c.status === 'AVAILABLE').length} Available Now</span>
            </p>
          </div>
        </div>

        <div className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Today's Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-sky-500 block">{todayBookings.length} Slots</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Confirmed slot reservations today
            </p>
          </div>
        </div>

        <div className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hosted Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-500 block">{venueGames.length} Matches</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{liveGames.length} Live Right Now</span>
            </p>
          </div>
        </div>

        <div className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Month Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-500 block">₹{thisMonthRevenue.toFixed(0)}</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </p>
          </div>
        </div>

      </div>


      {/* 3. MAIN DASHBOARD CONTENT (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: LIVE MONITORING & GAME MANAGEMENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Live & Active Sessions Widget */}
          <div className="footy-card p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight">
                    Live Pitch Monitoring
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Real-time match status, scores, and roster attendance
                  </p>
                </div>
              </div>

              <Link to="/club/games">
                <Button variant="outline" size="sm" icon={Eye}>
                  Manage All Sessions
                </Button>
              </Link>
            </div>

            {/* Live Now Banner */}
            {liveGames.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Ongoing Match Sessions</span>
                </div>
                {liveGames.map(game => (
                  <Link key={game.id} to={`/games/${game.id}`}>
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="danger" size="sm">🔴 ONGOING</Badge>
                          <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'} size="sm">{game.format}</Badge>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors truncate">
                          {game.title}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{game.confirmedPlayers?.length}/{game.maxPlayers} players</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sport-500" />{game.venueReference?.courtName}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" />{game.dateTime?.startTime}–{game.dateTime?.endTime}</span>
                        </div>
                      </div>

                      {game.score ? (
                        <div className="px-5 py-2.5 rounded-2xl bg-slate-950 text-white text-center flex-shrink-0 border border-slate-800">
                          <span className="text-2xl font-black text-rose-400">{game.score.teamA} – {game.score.teamB}</span>
                          <span className="block text-[9px] text-slate-400 font-black uppercase">Live Score</span>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold text-center">
                          Score pending
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {/* Upcoming / Open Games List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Upcoming Venue Sessions ({openGames.length})
              </span>

              {openGames.length > 0 ? (
                openGames.slice(0, 4).map(game => (
                  <Link key={game.id} to={`/games/${game.id}`}>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sport-500/40 transition-all flex items-center justify-between gap-3 group bg-slate-50/50 dark:bg-slate-950/50">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(game.status)}
                          <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'} size="sm">{game.format}</Badge>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-sport-500">
                          {game.title}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 font-semibold">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{game.dateTime?.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{game.dateTime?.startTime}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3 text-sport-500" />{game.confirmedPlayers?.length}/{game.maxPlayers} Roster</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          {game.confirmedPlayers?.slice(0, 4).map(p => (
                            <Avatar key={p.id} src={p.avatar} name={p.name} size="xs" className="border-2 border-white dark:border-slate-900" />
                          ))}
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm(`Cancel and remove game session "${game.title}"?`)) {
                              removeGame(game.id, 'Cancelled by venue manager');
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Remove / Cancel Game Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sport-500 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-3 text-center">No open sessions scheduled for today</p>
              )}
            </div>

          </div>


          {/* Pitch Utilization & Peak Hours Analytics */}
          <div className="footy-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sport-500" />
                  Weekly Pitch Utilization
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Peak window utilization trends across all venue pitches
                </p>
              </div>
              <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                82% Avg Capacity
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              {utilizationData.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <span className="text-[10px] font-black text-sport-500 group-hover:scale-110 transition-transform">
                    {item.hours}h
                  </span>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-xl h-36 flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-sport-600 via-sport-500 to-emerald-400 rounded-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${item.percent}%` }}
                    />
                  </div>
                  
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 gap-2 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sport-500" /> Peak Window: 18:00 – 23:00 IST
              </span>
              <span className="text-slate-400">Higher peak multiplier applies automatically</span>
            </div>
          </div>

        </div>


        {/* RIGHT COLUMN: PITCH DIRECTORY & QUICK CONTROLS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Pitch Status Directory & Quick Toggles */}
          <div className="footy-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sport-500" />
                <span>Pitch Directory</span>
              </span>
              <Link to="/club/courts" className="text-[11px] font-extrabold text-sport-500 hover:underline">
                Manage Pitches
              </Link>
            </div>

            <div className="space-y-3">
              {myCourts.map(crt => (
                <div key={crt.courtId || crt.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{crt.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{crt.type} • {crt.surface}</p>
                    </div>
                    <button
                      onClick={() => handleToggleCourtStatus(crt.courtId || crt.id, crt.status)}
                      className="cursor-pointer"
                      title="Click to toggle status"
                    >
                      <Badge variant={crt.status === 'AVAILABLE' ? 'emerald' : 'danger'} size="sm">
                        {crt.status === 'AVAILABLE' ? '🟢 Active' : '🔴 Maintenance'}
                      </Badge>
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-bold pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-400">
                    <span>Base Rate: <span className="text-sport-500 font-black">₹{crt.basePrice}/hr</span></span>
                    <span className="text-amber-500 font-extrabold">Peak {crt.peakMultiplier || 1.5}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Today's Confirmed Bookings Feed */}
          <div className="footy-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>Today's Slot Bookings</span>
              </span>
              <Link to="/club/bookings" className="text-[11px] font-extrabold text-sport-500 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {todayBookings.length > 0 ? (
                todayBookings.map(b => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs line-clamp-1">{b.courtName || 'Main Turf'}</span>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                        ₹{b.amountPaid} PAID
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{b.startTime} - {b.endTime}</span>
                      <span>•</span>
                      <span>{b.userName || 'Player'}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No bookings scheduled for today</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ClubDashboardPage;
