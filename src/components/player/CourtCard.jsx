import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const CourtCard = ({ club, court }) => {
  return (
    <Card className="flex flex-col justify-between h-full p-0">
      <div>
        {/* Cover Image Placeholder */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          {(court?.image || club?.clubImageUrl) ? (
            <img
              src={court?.image || club?.clubImageUrl}
              alt={court?.name || club?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-900 text-slate-400 p-4 text-center">
              <span className="text-3xl font-black text-sport-500 mb-1">⚽</span>
              <span className="text-xs font-bold text-slate-300">{club?.name || 'Turf Venue'}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{court?.name}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="emerald" size="sm">
              {court?.type || 'Outdoor'}
            </Badge>
            {court?.surface && (
              <Badge variant="blue" size="sm">
                {court.surface}
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900/80 text-amber-400 text-xs font-black backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{club?.rating || '4.9'}</span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="font-extrabold text-lg line-clamp-1">{court?.name || club?.name}</h3>
            <p className="text-xs text-slate-300 flex items-center space-x-1 font-semibold">
              <MapPin className="w-3 h-3 text-sport-500 flex-shrink-0" />
              <span className="truncate">{club?.name} • {club?.city || 'Raipur'}</span>
            </p>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-2">
            {club?.description}
          </p>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {club?.amenities?.slice(0, 3).map((amenity, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold">
                {amenity}
              </span>
            ))}
            {club?.amenities?.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-black">
                +{club.amenities.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Starting From</span>
          <span className="text-lg font-black text-sport-500">
            ₹{court?.basePrice || 500}/hr
          </span>
        </div>

        <Link to={`/courts/book?courtId=${court?.courtId || court?.id || 'crt_rp_101'}`}>
          <Button variant="primary" size="sm" icon={ArrowRight}>
            Book Court
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default CourtCard;
