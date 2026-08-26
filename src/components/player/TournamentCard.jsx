import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Award, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const TournamentCard = ({ tournament }) => {
  return (
    <Card className="flex flex-col justify-between h-full p-0">
      <div>
        {/* Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          {tournament.banner ? (
            <img
              src={tournament.banner}
              alt={tournament.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 p-4 text-center">
              <Trophy className="w-10 h-10 mb-2 text-amber-500" />
              <span className="text-sm font-black text-white">{tournament.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="gold" size="sm">
              {tournament.type || tournament.format}
            </Badge>
            <Badge variant="emerald" size="sm">
              {tournament.city || 'Raipur'}
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="font-black text-lg line-clamp-1">{tournament.title}</h3>
            <p className="text-xs text-amber-400 font-bold">{tournament.tagline}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400 font-semibold line-clamp-2">
            {tournament.description}
          </p>

          <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-sport-500" />
              <span>{tournament.startDate}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-sport-500" />
              <span>{tournament.registeredTeamsCount}/{tournament.maxTeams} Squads</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20">
            <Award className="w-4 h-4 flex-shrink-0" />
            <span>Prize: {tournament.prizePool}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Squad Entry</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">₹{tournament.entryFee}</span>
        </div>

        <Link to={`/tournaments/${tournament.id}`}>
          <Button variant="gold" size="sm" icon={ArrowRight}>
            Register Team
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default TournamentCard;
