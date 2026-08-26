import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, Clock, Filter, Users, ShieldCheck, ArrowRight, RotateCcw, Lock, DollarSign, Check } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const FindGamesPage = () => {
  const { games, clubs, courts, createGame } = useDataStore();
  const { currentUser } = useAuthStore();

  const [selectedCity, setSelectedCity] = useState('Raipur, Chhattisgarh, India');
  const [activeDate, setActiveDate] = useState('Today 26');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  // Host Game Form (Matching Footy Addicts Screenshots 4 & 5)
  const [title, setTitle] = useState('');
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [format, setFormat] = useState('5v5');
  const [date, setDate] = useState('2026-08-28');
  const [startTime, setStartTime] = useState('16:00');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState('150');
  const [genderOption, setGenderOption] = useState('Co-ed');
  const [paymentType, setPaymentType] = useState('Free'); // Online | Cash | Free

  const dateTabs = [
    { label: 'Today 26', val: '26' },
    { label: 'Tomorrow 27', val: '27' },
    { label: 'Fri 28', val: '28' },
    { label: 'Sat 29', val: '29' },
    { label: 'Sun 30', val: '30' },
    { label: 'Mon 31', val: '31' },
    { label: 'Tue 1', val: '1' },
    { label: 'Wed 2', val: '2' },
    { label: 'Thu 3', val: '3' },
    { label: 'Fri 4', val: '4' }
  ];

  const filteredGames = games.filter(g => {
    const matchesFormat = selectedFormat === 'all' || g.format === selectedFormat;
    const matchesType = selectedType === 'all' || g.venueReference?.city?.toLowerCase() === selectedType.toLowerCase();
    return matchesFormat && matchesType;
  });

  const handleHostGame = (e) => {
    e.preventDefault();
    const club = clubs.find(c => c.id === clubId) || clubs[0];

    const feeVal = paymentType === 'Free' ? 0 : parseFloat(entryFee);

    createGame({
      title: title || `${club.name} ${format} Session`,
      organizer: {
        id: currentUser?.id || 'usr_player_demo',
        name: currentUser?.name || 'Arjun Mehta',
        avatar: currentUser?.profileImageUrl || currentUser?.avatar
      },
      venueReference: {
        clubId: club.id,
        clubName: club.name,
        courtId: 'crt_rp_101',
        courtName: 'Pitch Alpha',
        city: club.city || 'Raipur'
      },
      format,
      maxPlayers: format === '5v5' ? 10 : 14,
      entryFee: feeVal,
      skill: 'Intermediate',
      dateTime: {
        date,
        startTime,
        endTime: '17:00'
      },
      description
    });

    toast.success('New game created successfully!');
    setIsHostModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 py-2 max-w-6xl mx-auto">
      
      {/* 1. TOP HEADER RIBBON (Footy Addicts Screenshot 3 Match) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-extrabold text-xs text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-sport-500"
          >
            <option value="Raipur, Chhattisgarh, India">Nearby Raipur, Chhattisgarh, India</option>
            <option value="Bangalore, Karnataka, India">Nearby Bangalore, Karnataka, India</option>
            <option value="Mumbai, Maharashtra, India">Nearby Mumbai, Maharashtra, India</option>
            <option value="Delhi, NCR, India">Nearby Delhi, NCR, India</option>
            <option value="Pune, Maharashtra, India">Nearby Pune, Maharashtra, India</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" icon={MapPin}>
            Show map
          </Button>

          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsHostModalOpen(true)}>
            New game
          </Button>
        </div>
      </div>

      {/* 2. HORIZONTAL DATE SELECTOR RIBBON (Footy Addicts Screenshot 3 Match) */}
      <div className="footy-card p-2 flex items-center space-x-1.5 overflow-x-auto">
        {dateTabs.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveDate(tab.label)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeDate === tab.label
                ? 'bg-sport-500 text-white shadow-md'
                : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. FILTER CHIPS ROW (Footy Addicts Screenshot 3 Match) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-bold">
        {['5v5', '7v7', '6v6', 'Open Play'].map(fmt => (
          <button
            key={fmt}
            onClick={() => setSelectedFormat(selectedFormat === fmt ? 'all' : fmt)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedFormat === fmt
                ? 'bg-sport-500 text-white border-sport-500'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {fmt}
          </button>
        ))}

        <button
          onClick={() => { setSelectedFormat('all'); setSelectedType('all'); }}
          className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-600 flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* 4. FOOTY ADDICTS LIST VIEW (Screenshots 4 & 5 Match) */}
      {filteredGames.length > 0 ? (
        <div className="space-y-3">
          <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">
            {activeDate.toUpperCase()} 2026
          </span>

          {filteredGames.map((game) => {
            const confirmedCount = game.confirmedPlayers?.length || 0;
            const spotsLeft = game.maxPlayers - confirmedCount;
            const isFull = game.status === 'FULL' || spotsLeft <= 0;

            return (
              <div
                key={game.id}
                className="footy-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-sport-500/50 transition-all group"
              >
                {/* Left: Time & Match Details */}
                <div className="flex items-start space-x-4 flex-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight pt-1">
                    {game.dateTime?.startTime || '19:00'}
                  </span>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-sport-500 transition-colors">
                      {game.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Avatar src={game.organizer?.avatar} name={game.organizer?.name} size="xs" />
                      <span>@{game.organizer?.name?.toLowerCase()?.replace(/\s+/g, '') || 'organizer'}</span>
                    </div>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {game.format}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sport-500/10 text-sport-500">
                        #{game.venueReference?.city?.toLowerCase() || 'raipur'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                        #{game.skill?.toLowerCase() || 'intermediate'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Badge, Entry Fee in INR (₹) & Details Button */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <Badge variant={isFull ? 'waitlist' : (spotsLeft === 1 ? 'danger' : 'emerald')} size="sm">
                      {isFull ? 'Waiting list' : (spotsLeft === 1 ? 'Last spot!' : `${spotsLeft} spots open`)}
                    </Badge>
                    <span className="block text-lg font-black text-sport-500 mt-1">
                      ₹{game.entryFee}
                    </span>
                  </div>

                  <Link to={`/games/${game.id}`}>
                    <Button variant="primary" size="sm" icon={ArrowRight}>
                      View Game
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="footy-card p-12 text-center space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Unfortunately, no games found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-semibold">
            You can reset the filters or create a new game session.
          </p>
          <Button variant="primary" size="sm" onClick={() => { setSelectedFormat('all'); setSelectedType('all'); }}>
            Reset Filters
          </Button>
        </div>
      )}

      {/* FOOTY ADDICTS NEW GAME SPLIT FORM MODAL (Screenshots 4 & 5 Match) */}
      <Modal isOpen={isHostModalOpen} onClose={() => setIsHostModalOpen(false)} title="New game">
        <form onSubmit={handleHostGame} className="space-y-6 text-xs font-bold">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Form Inputs */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Where Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Where</span>
                <label className="block text-slate-700 dark:text-slate-300">Venue</label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.address}, {c.city})</option>
                  ))}
                </select>
              </div>

              {/* When Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 block">When</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Settings</span>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Match title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Team players limit</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="5v5">5 a side (10 players)</option>
                    <option value="7v7">7 a side (14 players)</option>
                    <option value="6v6">6 a side (12 players)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Gender options</label>
                  <div className="flex gap-4 pt-1">
                    {['Co-ed', 'Women', 'Men'].map(opt => (
                      <label key={opt} className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={genderOption === opt}
                          onChange={() => setGenderOption(opt)}
                          className="accent-sport-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Choices (Matching Screenshot 5) */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Payment</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('Online')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentType === 'Online' ? 'bg-sport-500 text-white border-sport-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    <Lock className="w-4 h-4 mx-auto mb-1" />
                    <span className="block text-xs font-black">Online</span>
                    <span className="text-[9px] font-semibold block opacity-80">Secure payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('Cash')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentType === 'Cash' ? 'bg-sport-500 text-white border-sport-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    <DollarSign className="w-4 h-4 mx-auto mb-1" />
                    <span className="block text-xs font-black">Cash</span>
                    <span className="text-[9px] font-semibold block opacity-80">At the game</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('Free')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentType === 'Free' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    <Check className="w-4 h-4 mx-auto mb-1" />
                    <span className="block text-xs font-black">Free</span>
                    <span className="text-[9px] font-semibold block opacity-80">Everybody join</span>
                  </button>
                </div>

                {paymentType !== 'Free' && (
                  <div className="pt-2">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Entry Fee per Player (₹)</label>
                    <input
                      type="number"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Right Map Preview (Matching Screenshots 4 & 5) */}
            <div className="md:col-span-5 h-[380px] md:h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-tr from-slate-900 to-slate-950 text-white space-y-3">
                <MapPin className="w-10 h-10 text-rose-500 animate-bounce" />
                <span className="font-extrabold text-sm">Venue Pitch Map Preview</span>
                <span className="text-xs font-semibold text-slate-400">
                  {clubs.find(c => c.id === clubId)?.name || 'Raipur Arena Turf'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {clubs.find(c => c.id === clubId)?.address}
                </span>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsHostModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="px-8">
              Submit & Host Game
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default FindGamesPage;
