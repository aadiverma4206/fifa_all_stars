import React from 'react';
import { getEloBadgeInfo } from '../../utils/eloCalculator';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export const LeaderboardRow = ({ user, rank }) => {
  const elo = user.eloRating || user.elo || 1000;
  const badgeInfo = getEloBadgeInfo(elo);

  const rankColor = rank === 1
    ? 'bg-amber-400 text-slate-950 font-black'
    : rank === 2
    ? 'bg-slate-300 text-slate-900 font-black'
    : rank === 3
    ? 'bg-amber-700 text-white font-black'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold';

  return (
    <div className="footy-card p-3 sm:p-4 flex items-center justify-between transition-all hover:scale-[1.01] gap-2">
      
      {/* Left: Rank & User */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs shadow-sm flex-shrink-0 ${rankColor}`}>
          {rank}
        </span>

        <Avatar src={user.profileImageUrl || user.avatar} name={user.name} size="md" status="active" className="flex-shrink-0" />

        <div className="min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{user.name}</h4>
            <Badge variant="emerald" size="sm" className="hidden xs:inline-flex">{user.skillLevel || 'Advanced'}</Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold truncate">{user.city || 'Raipur'} • {user.playingHand || 'Striker'}</p>
        </div>
      </div>

      {/* Right: Division Badge & Elo Score */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>{badgeInfo.icon}</span>
          <span>{badgeInfo.title}</span>
        </div>

        <div className="text-right">
          <span className="block text-lg font-black text-sport-500">
            {elo} <span className="text-xs font-bold text-slate-400 uppercase">Elo</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {user.badges?.slice(0, 2).join(' • ') || 'Verified Player'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardRow;
