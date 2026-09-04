import React from 'react';
import { Edit, Zap } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const CourtManagerRow = ({ court = {}, onEditPricing }) => {
  const isIndoor = court.isIndoor || court.type === 'Indoor';
  const format = court.format || court.name?.match(/\((\d+v\d+)\)/)?.[1] || '5v5';
  const surface = court.surface || court.surfaceType || '3G Turf';
  const baseRate = court.basePricePerHour ?? court.basePrice ?? 500;
  const peakMultiplier = court.peakMultiplier ?? 1.5;
  const peakRate = court.peakPricePerHour ?? Math.round(baseRate * peakMultiplier);
  const peakWindow = court.peakWindow || (court.peakHoursStart && court.peakHoursEnd ? `${court.peakHoursStart}-${court.peakHoursEnd}` : '17:00-21:00');
  const imageUrl = court.image || '/assets/images/courts/court-1.jpg';

  return (
    <div className="admin-card p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <img
          src={imageUrl}
          alt={court.name || 'Court'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/assets/images/courts/court-1.jpg';
          }}
          className="w-14 h-14 rounded-md object-cover border border-slate-200 dark:border-slate-800"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{court.name || 'Pitch'}</h4>
            <Badge variant="emerald" size="sm" className="rounded-md">{format}</Badge>
            {isIndoor && <Badge variant="blue" size="sm" className="rounded-md">Indoor</Badge>}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Surface: {surface}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">
            Base Rate: <span className="text-slate-900 dark:text-white font-mono font-bold">₹{baseRate}/hr</span>
          </div>
          <div className="text-xs text-amber-500 font-bold flex items-center justify-end space-x-1 mt-0.5">
            <Zap className="w-3 h-3 fill-amber-400" />
            <span>Peak ({peakWindow}): ₹{peakRate}/hr</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Edit}
          onClick={() => onEditPricing && onEditPricing(court)}
          className="rounded-md font-semibold text-xs border-slate-300 dark:border-slate-700"
        >
          Edit Rates
        </Button>
      </div>
    </div>
  );
};

export default CourtManagerRow;
