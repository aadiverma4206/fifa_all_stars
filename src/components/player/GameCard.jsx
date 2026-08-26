import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export const GameCard = ({ game }) => {
  const isFull = game.status === 'FULL' || (game.confirmedPlayers?.length || 0) >= game.maxPlayers;
  const confirmedCount = game.confirmedPlayers?.length || 0;
  const spotsLeft = game.maxPlayers - confirmedCount;

  const getStatusBadge = () => {
    if (game.status === 'COMPLETED') return <Badge variant="default" size="sm">COMPLETED</Badge>;
    if (game.status === 'IN_PROGRESS') return <Badge variant="emerald" size="sm">LIVE MATCH</Badge>;
    if (isFull) return <Badge variant="danger" size="sm">FULL</Badge>;
    if (spotsLeft <= 2) return <Badge variant="waitlist" size="sm">{spotsLeft} SPOTS LEFT</Badge>;
    return <Badge variant="emerald" size="sm">OPEN ({spotsLeft} SPOTS)</Badge>;
  };

  return (
    <Card className="flex flex-col justify-between h-full space-y-4">
      <div className="space-y-3">
        {/* Format & Status Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'} size="sm">
            {game.format}
          </Badge>
          {getStatusBadge()}
        </div>

        {/* Game Title */}
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sport-500 transition-colors">
          {game.title}
        </h3>

        {/* Venue Info */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
          <span className="truncate">{game.venueReference?.clubName || 'Bernabeu Arena'} • {game.venueReference?.city || 'Raipur'}</span>
        </div>

        {/* Date & Time Slot Pill */}
        <div className="grid grid-cols-2 gap-2 text-xs font-bold p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-sport-500" />
            <span>{game.dateTime?.date}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-sport-500" />
            <span>{game.dateTime?.startTime} - {game.dateTime?.endTime}</span>
          </div>
        </div>

        {/* Host Avatar & Confirmed Players List */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Avatar src={game.organizer?.avatar} name={game.organizer?.name} size="sm" />
            <div className="text-xs">
              <span className="block font-bold text-slate-900 dark:text-slate-100">{game.organizer?.name}</span>
              <span className="text-[10px] text-slate-400 font-semibold">Host</span>
            </div>
          </div>
          
          <div className="flex items-center -space-x-2">
            {game.confirmedPlayers?.slice(0, 4).map((p, idx) => (
              <Avatar key={idx} src={p.avatar} name={p.name} size="sm" className="ring-2 ring-white dark:ring-slate-900" />
            ))}
            {game.confirmedPlayers?.length > 4 && (
              <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black flex items-center justify-center text-slate-700 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
                +{game.confirmedPlayers.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Entry Fee</span>
          <span className="text-lg font-black text-sport-500">₹{game.entryFee}</span>
        </div>

        <Link to={`/games/${game.id}`}>
          <Button variant="primary" size="sm" icon={ArrowRight}>
            Match Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default GameCard;
