import React, { useState } from 'react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export const PricingForm = ({ court, onSubmit, onCancel }) => {
  const [basePrice, setBasePrice] = useState(court?.basePricePerHour || 45);
  const [peakPrice, setPeakPrice] = useState(court?.peakPricePerHour || 65);
  const [peakStart, setPeakStart] = useState(court?.peakHoursStart || '18:00');
  const [peakEnd, setPeakEnd] = useState(court?.peakHoursEnd || '22:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      basePricePerHour: parseFloat(basePrice),
      peakPricePerHour: parseFloat(peakPrice),
      peakHoursStart: peakStart,
      peakHoursEnd: peakEnd
    });
    toast.success(`Updated pricing configuration for ${court?.name}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
      <div>
        <label className="block text-slate-700 dark:text-slate-300 mb-1">
          Base Hourly Rate ($)
        </label>
        <input
          type="number"
          step="0.5"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-slate-700 dark:text-slate-300 mb-1">
          Peak Hours Hourly Rate ($)
        </label>
        <input
          type="number"
          step="0.5"
          value={peakPrice}
          onChange={(e) => setPeakPrice(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak Start Time</label>
          <input
            type="time"
            value={peakStart}
            onChange={(e) => setPeakStart(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak End Time</label>
          <input
            type="time"
            value={peakEnd}
            onChange={(e) => setPeakEnd(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm">
          Save Pricing
        </Button>
      </div>
    </form>
  );
};

export default PricingForm;
