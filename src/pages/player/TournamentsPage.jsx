import React from 'react';
import { Trophy, Award, Shield } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import TournamentCard from '../../components/player/TournamentCard';

export const TournamentsPage = () => {
  const { tournaments } = useDataStore();

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
          <span>Championships & Leagues</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Register your team for official FIFA All Stars knockout cups and cash tournaments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tournaments.map(trn => (
          <TournamentCard key={trn.id} tournament={trn} />
        ))}
      </div>
    </div>
  );
};

export default TournamentsPage;
