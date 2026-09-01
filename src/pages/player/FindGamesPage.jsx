import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, Clock, Filter, Users, ShieldCheck, ArrowRight, RotateCcw, Lock, DollarSign, Check, Map, Eye, Shield, Trophy } from 'lucide-react';
import { useDataStore, MATCH_FORMAT_SLOTS } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate, generateDateTabs } from '../../utils/dateUtils';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const FindGamesPage = () => {
  const navigate = useNavigate();
  const { games, clubs, courts, createGame } = useDataStore();
  const { currentUser, updateWallet } = useAuthStore();

  const dynamicDateTabs = [{ label: 'All Dates', val: 'all' }, ...generateDateTabs(10)];

  const [selectedCity, setSelectedCity] = useState('Raipur, Chhattisgarh, India');
  const [activeDate, setActiveDate] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  // Host Game Form States
  const [title, setTitle] = useState('');
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [courtId, setCourtId] = useState('');
  const [format, setFormat] = useState('2v2');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [date, setDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState('0');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleOpenCreateGameModal = () => {
    const targetDate = (activeDate && activeDate !== 'all') ? activeDate : getTodayDate();
    setDate(targetDate);
    setIsHostModalOpen(true);
  };

  // Dynamic Courts filtering based on selected Club
  const availableCourts = courts.filter(c => c.clubId === clubId);

  useEffect(() => {
    if (availableCourts.length > 0) {
      setCourtId(availableCourts[0].courtId || availableCourts[0].id);
    } else {
      setCourtId('');
    }
  }, [clubId]);

  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
    if (MATCH_FORMAT_SLOTS[newFormat]) {
      setMaxPlayers(String(MATCH_FORMAT_SLOTS[newFormat]));
    }
  };

  const [viewTab, setViewTab] = useState('active');

  const dateTabs = dynamicDateTabs;

  const filteredGames = games.filter(g => {
    const matchesTab = viewTab === 'history' ? g.status === 'COMPLETED' : g.status !== 'COMPLETED';
    const matchesFormat = selectedFormat === 'all' || g.format === selectedFormat;
    const matchesType = selectedType === 'all' || g.venueReference?.city?.toLowerCase() === selectedType.toLowerCase();
    const matchesDate = activeDate === 'all' || g.dateTime?.date === activeDate;
    const matchesSearch = !searchQuery.trim() || 
      g.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) || 
      g.venueReference?.clubName?.toLowerCase()?.includes(searchQuery.toLowerCase());
    return matchesTab && matchesFormat && matchesType && matchesDate && matchesSearch;
  });

  const handleHostGame = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to host a new game session.');
      navigate('/login');
      return;
    }

    if (!title || !title.trim()) {
      toast.error('Game Session Title is required.');
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

    const club = clubs.find(c => c.id === clubId) || clubs[0];
    const court = courts.find(c => c.courtId === courtId || c.id === courtId) || availableCourts[0];
    const feeVal = parseFloat(entryFee) || 0;
    if (feeVal < 0) {
      toast.error('Entry fee cannot be negative.');
      return;
    }
    const computedSlots = parseInt(maxPlayers, 10) || MATCH_FORMAT_SLOTS[format] || 4;

    const isPlayerHost = currentUser.role === 'PLAYER';

    if (isPlayerHost && feeVal > 0) {
      if ((currentUser.walletBalance || 0) < feeVal) {
        toast.error(`Insufficient wallet balance! Hosting as a Player requires paying the entry fee (₹${feeVal}). Please top up in Profile.`);
        return;
      }
      updateWallet(-feeVal, `Host Entry Fee: ${title || club.name}`);
    }

    createGame({
      title: title || `${club.name} ${format} Session`,
      venueReference: {
        clubId: club.id,
        clubName: club.name,
        courtId: court?.courtId || court?.id || 'crt_rp_101',
        courtName: court?.name || 'Pitch Alpha',
        city: club.city || 'Raipur'
      },
      format,
      maxPlayers: computedSlots,
      entryFee: feeVal,
      skill: skillLevel,
      privacy: isPrivate ? 'PRIVATE' : 'PUBLIC',
      dateTime: {
        date,
        startTime,
        endTime
      },
      description
    }, currentUser);

    const roleNotice = isPlayerHost 
      ? `Game published! You are 1/${computedSlots} confirmed player (₹${feeVal} fee paid).` 
      : `Game published for ${club.name}! (0/${computedSlots} slots occupied).`;

    toast.success(roleNotice);
    setIsHostModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 py-2 w-full mx-auto">
      
      {/* 1. CONTROL BAR: SEARCH, LOCATION & ACTIONS */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search & City Select Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by game title, turf venue or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
            />
          </div>

          <div className="relative w-full sm:w-72">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sport-500" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
            >
              <option value="Raipur, Chhattisgarh, India">Raipur, Chhattisgarh, India</option>
              <option value="Bangalore, Karnataka, India">Bangalore, Karnataka, India</option>
              <option value="Mumbai, Maharashtra, India">Mumbai, Maharashtra, India</option>
              <option value="Delhi, NCR, India">Delhi, NCR, India</option>
              <option value="Pune, Maharashtra, India">Pune, Maharashtra, India</option>
            </select>
          </div>
        </div>

        {/* Action Buttons & History Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewTab('active')}
              className={`px-3 py-1.5 rounded-md text-xs font-black uppercase transition-all cursor-pointer ${
                viewTab === 'active' 
                  ? 'bg-sport-500 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🟢 Active Games ({games.filter(g => g.status !== 'COMPLETED').length})
            </button>

            <button
              type="button"
              onClick={() => setViewTab('history')}
              className={`px-3 py-1.5 rounded-md text-xs font-black uppercase transition-all cursor-pointer ${
                viewTab === 'history' 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🏆 Match History ({games.filter(g => g.status === 'COMPLETED').length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateGameModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all uppercase tracking-wide whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create a Game</span>
          </button>
        </div>

      </div>

      {/* 2. RECTANGULAR DATE SELECTION SECTION */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {dateTabs.map(tab => {
            const isActive = activeDate === tab.val;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveDate(tab.val)}
                className={`px-5 py-3 rounded-lg border text-xs font-black transition-all flex flex-col items-center justify-center min-w-[100px] flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-sport-500 text-white border-sport-500 shadow-md ring-2 ring-sport-500/30'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER BAR SECTION */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold">
        
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-2">Formats:</span>
          
          {['all', '1v1', '2v2', '3v3', '4v4', '5v5', '6v6', '7v7'].map(fmt => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg border transition-all uppercase cursor-pointer ${
                selectedFormat === fmt
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {fmt === 'all' ? 'All Formats' : fmt}
            </button>
          ))}
        </div>

        {/* Right Reset */}
        <button
          onClick={() => { setSelectedFormat('all'); setSelectedType('all'); setSearchQuery(''); setActiveDate('all'); }}
          className="px-3.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>

      </div>

      {/* 4. MAIN CONTENT AREA: GAME CARDS */}
      {filteredGames.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Available Sessions ({filteredGames.length} Matches Found)
            </span>
          </div>

          <div className="space-y-3">
            {filteredGames.map((game) => {
              const totalSlots = game.maxPlayers || MATCH_FORMAT_SLOTS[game.format] || 10;
              const confirmedCount = game.confirmedPlayers?.length || 0;
              const spotsLeft = totalSlots - confirmedCount;
              const isFull = game.status === 'FULL' || spotsLeft <= 0;

              return (
                <div
                  key={game.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-sport-500/50 transition-all shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 group"
                >
                  
                  {/* Section 1: Time & Format Badge */}
                  <div className="flex items-center space-x-4">
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[90px]">
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono block leading-none">
                        {game.dateTime?.startTime || '19:00'}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 block mt-1 uppercase">
                        {game.dateTime?.endTime ? `${game.dateTime.startTime}-${game.dateTime.endTime}` : '60 MINS'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={game.format === '2v2' || game.format === '5v5' ? 'emerald' : 'blue'}>{game.format}</Badge>
                        <Badge variant={game.privacy === 'PRIVATE' ? 'danger' : 'gold'}>
                          {game.privacy || 'PUBLIC'}
                        </Badge>
                        {game.score && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase flex items-center space-x-1">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            <span>Score: {game.score.teamA} - {game.score.teamB}</span>
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-400">
                          {game.venueReference?.city || 'Raipur'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-sport-500 transition-colors line-clamp-1">
                        {game.title}
                      </h3>

                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                        <span>{game.venueReference?.clubName} • {game.venueReference?.courtName || 'Pitch Alpha'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Organizer & Skill Level */}
                  <div className="flex items-center space-x-6 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-6">
                    <div className="flex items-center space-x-2.5">
                      <Avatar src={game.organizer?.avatar} name={game.organizer?.name} size="sm" />
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                          {game.organizer?.name || 'Arjun Mehta'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Organizer</span>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Skill Level</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        {game.skill || 'Intermediate'}
                      </span>
                    </div>
                  </div>

                  {/* Section 3: Spots Roster & Entry Fee */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 pt-3 lg:pt-0">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={isFull ? 'waitlist' : (spotsLeft === 1 ? 'danger' : 'emerald')} size="sm">
                          {isFull ? 'Roster Full' : (spotsLeft === 1 ? 'Last slot left!' : `${spotsLeft} slots open`)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-slate-400">Roster:</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {confirmedCount} / {totalSlots} Players
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Match Fee</span>
                      <span className="text-xl font-black text-sport-500">
                        ₹{game.entryFee}
                      </span>
                    </div>

                    <Link to={`/games/${game.id}`}>
                      <Button variant="primary" size="md" icon={ArrowRight} className="px-5">
                        View Game
                      </Button>
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 sm:p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            ⚽
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              No matching games found
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No matching pick-up sessions found for your selected filters. Reset filters or create a new game session.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setSelectedFormat('all'); setSelectedType('all'); setSearchQuery(''); setActiveDate('all'); }}>
              Reset Filters
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateGameModal}>
              Create a Game
            </Button>
          </div>
        </div>
      )}

      {/* CREATE A GAME MODAL (MATCHING SCREENSHOT DESIGN 100%) */}
      <Modal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        title="Create a Game"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleHostGame} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
          
          <p className="text-slate-500 dark:text-slate-400 -mt-3 text-[11px]">
            Set up a game and invite players to join.
          </p>

          {/* Game Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Game Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Evening Doubles Fun"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Club & Court (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Club <span className="text-rose-500">*</span>
              </label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                required
              >
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Court <span className="text-rose-500">*</span>
              </label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                required
              >
                {availableCourts.length > 0 ? (
                  availableCourts.map(c => (
                    <option key={c.courtId || c.id} value={c.courtId || c.id}>
                      {c.name} ({c.type} • {c.surface})
                    </option>
                  ))
                ) : (
                  <option value="">Select court</option>
                )}
              </select>
            </div>
          </div>

          {/* Date, Start Time, End Time (3 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Game Type & Skill Level (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Game Type / Format <span className="text-rose-500">*</span>
              </label>
              <select
                value={format}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                required
              >
                <option value="1v1">1v1 (2 Players - Singles)</option>
                <option value="2v2">2v2 (4 Players - Doubles)</option>
                <option value="3v3">3v3 (6 Players)</option>
                <option value="4v4">4v4 (8 Players)</option>
                <option value="5v5">5v5 (10 Players)</option>
                <option value="6v6">6v6 (12 Players)</option>
                <option value="7v7">7v7 (14 Players)</option>
                <option value="8v8">8v8 (16 Players)</option>
                <option value="11v11">11v11 (22 Players)</option>
                <option value="custom">Custom Format</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner Friendly</option>
                <option value="Advanced">Advanced / Competitive</option>
                <option value="All Levels">All Levels Welcome</option>
              </select>
            </div>
          </div>

          {/* Maximum Players & Entry Fee (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Maximum Players <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Entry Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Any details players should know..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Checkbox for Private Game */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="privateGameCheck"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="privateGameCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Make this a private game (invite only)
            </label>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsHostModalOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              Publish Game
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default FindGamesPage;
