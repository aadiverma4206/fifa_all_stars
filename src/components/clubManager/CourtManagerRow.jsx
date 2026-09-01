import React from 'react';
import { Edit, DollarSign, Zap } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const CourtManagerRow = ({ court, onEditPricing }) => {
  return (
    <div className="admin-card p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <img
          src={court.image}
          alt={court.name}
          className="w-14 h-14 rounded-md object-cover border border-slate-200 dark:border-slate-800"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{court.name}</h4>
            <Badge variant="emerald" size="sm" className="rounded-md">{court.format}</Badge>
            {court.isIndoor && <Badge variant="blue" size="sm" className="rounded-md">Indoor</Badge>}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Surface: {court.surfaceType}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">
            Base Rate: <span className="text-slate-900 dark:text-white font-mono font-bold">₹{court.basePricePerHour}/hr</span>
          </div>
          <div className="text-xs text-amber-500 font-bold flex items-center justify-end space-x-1 mt-0.5">
            <Zap className="w-3 h-3 fill-amber-400" />
            <span>Peak ({court.peakHoursStart}-{court.peakHoursEnd}): ₹{court.peakPricePerHour}/hr</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Edit}
          onClick={() => onEditPricing(court)}
          className="rounded-md font-semibold text-xs border-slate-300 dark:border-slate-700"
        >
          Edit Rates
        </Button>
      </div>
    </div>
  );
};

export default CourtManagerRow;
