import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, MapPin, Search, ArrowRight, Play, Compass, Sparkles, Wallet, Award, CheckCircle, Camera, ShieldCheck, UserCheck } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getEloBadgeInfo } from '../../utils/eloCalculator';
import GameCard from '../../components/player/GameCard';
import CourtCard from '../../components/player/CourtCard';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import FootballScene from '../../components/football3d/FootballScene';

export const PlayerHomePage = () => {
  const { games, clubs, courts } = useDataStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [selectedArea, setSelectedArea] = useState('');
  const [activeDateTab, setActiveDateTab] = useState('all');

  const eloBadge = getEloBadgeInfo(currentUser?.eloRating || currentUser?.elo || 1840);
  const myJoinedGames = games.filter(g => g.confirmedPlayers?.some(p => p.id === currentUser?.id));
  const featuredGames = games.slice(0, 3);

  const areasList = [
    'Raipur',
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Pune',
    'VIP Road, Raipur',
    'Indiranagar, Bangalore',
    'Deccan Gymkhana, Pune',
    'Marine Drive, Mumbai'
  ];

  const handleSearchGames = (e) => {
    e.preventDefault();
    if (selectedArea) {
      navigate(`/games?city=${encodeURIComponent(selectedArea)}`);
    } else {
      navigate('/games');
    }
  };

  const dateTabs = [
    { label: 'All Dates', value: 'all' },
    { label: 'Today 26', value: '2026-08-26' },
    { label: 'Thu 27', value: '2026-08-27' },
    { label: 'Fri 28', value: '2026-08-28' },
    { label: 'Sat 29', value: '2026-08-29' },
    { label: 'Sun 30', value: '2026-08-30' },
  ];

  return (
    <div className="space-y-12 py-2">
      
      {/* 3-COLUMN DASHBOARD GRID (FOOTY ADDICTS DASHBOARD SCREENSHOT 1 MATCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FOOTY ADDICTS PROFILE & WALLET SIDEBAR (Screenshot 1 Match) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="footy-card p-6 space-y-5">
            <div className="flex items-center space-x-4">
              <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="lg" status="active" />
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-400 block">@{currentUser?.name?.toLowerCase()?.replace(/\s+/g, '') || 'player'}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{currentUser?.name}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs font-bold pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                <span>{currentUser?.city || 'Raipur'}, Chhattisgarh, India</span>
              </p>

              <Link to="/profile" className="text-sport-500 hover:underline block text-[11px] font-extrabold">
                ✍️ Edit Profile
              </Link>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>✓ Games Played</span>
                <span className="font-extrabold text-slate-900 dark:text-white">42</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>🏅 Division Tier</span>
                <span className="font-extrabold text-sport-500">{eloBadge.title}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>⚡ Elo Rating</span>
                <span className="font-extrabold text-amber-500">{currentUser?.eloRating || currentUser?.elo || 1840}</span>
              </div>
            </div>

            {/* Wallet Balance Widget */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Wallet Balance</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-amber-500">₹{currentUser?.walletBalance?.toFixed(2)}</span>
                <Link to="/profile">
                  <Button variant="gold" size="sm">Top-Up</Button>
                </Link>
              </div>
            </div>

            {/* Instagram / Community Promo Widget (Screenshot 1 Match) */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white space-y-2 border border-slate-800">
              <span className="text-[10px] font-black uppercase text-rose-400 block tracking-widest">FOLLOW FOOTBALL FOR ALL</span>
              <p className="text-[11px] font-semibold text-slate-300">
                Community news, giveaways, grassroots updates and your goals. Everything's on Insta.
              </p>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-block pt-1">
                <Button variant="primary" size="sm" icon={Camera}>Check It</Button>
              </a>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: 3D HERO ANIMATION & MAIN CONTENT */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* CINEMATIC 3D FOOTBALL HERO */}
          <section className="relative rounded-3xl overflow-hidden min-h-[520px] flex items-center p-6 sm:p-10 border border-slate-800 shadow-2xl bg-slate-950 text-white">
            <div className="absolute inset-0 bg-radial from-sport-500/15 via-slate-950/80 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

            <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-7 space-y-5 text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sport-500/10 border border-sport-500/30 text-sport-500 text-xs font-black uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FIFA ALL STARS 3D PLATFORM</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-none text-white">
                    PLAY. CONNECT. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sport-500 via-amber-400 to-sky-400">
                      DOMINATE.
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-slate-300 max-w-lg">
                    Find grassroots football games. Join local players. Build your football community across Indian turf venues.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Link to="/games">
                    <Button variant="primary" size="md" icon={Play} className="px-6 shadow-xl shadow-sport-500/20">
                      FIND A GAME
                    </Button>
                  </Link>

                  <Link to="/courts">
                    <Button variant="outline" size="md" icon={Compass} className="px-6 border-slate-700 text-white hover:bg-slate-800">
                      EXPLORE CLUBS
                    </Button>
                  </Link>
                </div>

                {/* Floating Search Bar */}
                <div className="pt-2">
                  <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2 max-w-md">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Find a game near you
                    </span>

                    <form onSubmit={handleSearchGames} className="flex gap-2">
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-bold text-xs focus:ring-2 focus:ring-sport-500"
                      >
                        <option value="">Select city or area</option>
                        {areasList.map((area, idx) => (
                          <option key={idx} value={area}>{area}</option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-sport-500 hover:bg-sport-600 text-white font-black text-xs tracking-wide transition-all shadow-md shadow-sport-500/30 whitespace-nowrap"
                      >
                        Search
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* 3D Scene Container */}
              <div className="lg:col-span-5 flex items-center justify-center relative min-h-[320px]">
                <FootballScene />
              </div>

            </div>
          </section>

          {/* MY JOINED UPCOMING GAMES SECTION */}
          {myJoinedGames.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-sport-500" />
                  <span>My Joined Upcoming Games ({myJoinedGames.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myJoinedGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {/* OPEN PICK-UP MATCHES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2">
                <Flame className="w-5 h-5 text-sport-500" />
                <span>Open Pick-Up Football Matches</span>
              </h3>
              <Link to="/games">
                <Button variant="ghost" size="sm" icon={ArrowRight}>View All Games</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PlayerHomePage;
