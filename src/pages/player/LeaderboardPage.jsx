import React, { useState } from 'react';
import { Shield, Search } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import LeaderboardRow from '../../components/player/LeaderboardRow';

export const LeaderboardPage = () => {
  const { usersList } = useAuthStore();
  const [cityFilter, setCityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const playersOnly = usersList.filter(u => u.role === 'PLAYER' || u.role === 'player');
  const getPlayerPoints = (u) => u.stats?.points ?? ((u.stats?.wins || 0) * 3 + (u.stats?.draws || 0));
  const sortedPlayers = [...playersOnly].sort((a, b) => getPlayerPoints(b) - getPlayerPoints(a));

  const filteredPlayers = sortedPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || (p.city && p.city.toLowerCase() === cityFilter.toLowerCase());
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-sport-500" />
          <span>Player Rankings & Leaderboard</span>
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Top grassroots football players ranked by match points, victories, and performance across Indian cities
        </p>
      </div>

      {/* Filter Ribbon */}
      <div className="footy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search player by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'Raipur', 'Bangalore', 'Mumbai', 'Delhi', 'Pune'].map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all uppercase whitespace-nowrap ${
                cityFilter === city
                  ? 'bg-sport-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-3">
        {filteredPlayers.map((player, idx) => (
          <LeaderboardRow key={player.id} user={player} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPage;
