import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Edit, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const ClubCard = ({ club }) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="relative h-48 w-full">
        <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3">
          <Badge variant={club.status === 'approved' ? 'emerald' : 'gold'}>
            {club.status === 'approved' ? 'VERIFIED VENUE' : 'PENDING APPROVAL'}
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-xl font-black">{club.name}</h3>
          <p className="text-xs text-slate-300 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{club.location}</span>
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">{club.description}</p>
        
        <div className="flex items-center justify-between text-xs font-semibold p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>{club.openingTime} - {club.closingTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{club.rating} ({club.reviewsCount} reviews)</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/manager/club" className="flex-1">
            <Button variant="outline" size="sm" icon={Edit} className="w-full">
              Edit Club Info
            </Button>
          </Link>
          <Link to="/manager/courts" className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Manage Courts
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ClubCard;
