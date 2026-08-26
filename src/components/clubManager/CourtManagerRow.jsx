import React from 'react';
import { Edit, DollarSign, Zap } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const CourtManagerRow = ({ court, onEditPricing }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl glass-card gap-4">
      <div className="flex items-center space-x-4">
        <img
          src={court.image}
          alt={court.name}
          className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-500/20"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{court.name}</h4>
            <Badge variant="emerald" size="sm">{court.format}</Badge>
            {court.isIndoor && <Badge variant="blue" size="sm">Indoor</Badge>}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Surface: {court.surfaceType}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
        <div className="text-right">
          <div className="text-xs text-slate-400 font-semibold">
            Base: <span className="text-slate-900 dark:text-white font-bold">${court.basePricePerHour}/hr</span>
          </div>
          <div className="text-xs text-amber-500 font-bold flex items-center space-x-1">
            <Zap className="w-3 h-3 fill-amber-400" />
            <span>Peak (${court.peakHoursStart}-${court.peakHoursEnd}): ${court.peakPricePerHour}/hr</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Edit}
          onClick={() => onEditPricing(court)}
        >
          Edit Rates
        </Button>
      </div>
    </div>
  );
};

export default CourtManagerRow;
