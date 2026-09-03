import React, { useState } from 'react';
import { DollarSign, Zap, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import { validateTimeRange, validateNumericRange, validateFormAndFocus } from '../../utils/validationUtils';
import toast from 'react-hot-toast';

export const PricingSettingsPage = () => {
  const [peakStart, setPeakStart] = useState('18:00');
  const [peakEnd, setPeakEnd] = useState('22:00');
  const [weekendMultiplier, setWeekendMultiplier] = useState('1.15');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTimeRange(peakStart, peakEnd), field: 'peakStart' },
      { check: () => validateNumericRange(weekendMultiplier, 1.0, 5.0, 'Weekend Surcharge Multiplier'), field: 'weekendMultiplier' }
    ]);

    if (!isValid) return;

    setIsSaving(true);
    try {
      toast.success('Peak pricing hours and weekend rates saved!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <Zap className="w-8 h-8 text-amber-500" />
          <span>Peak Pricing & Surcharge Rules</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure peak hour slot ranges and weekend surcharge multipliers
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="glass-card p-6 rounded-3xl border space-y-6 text-xs font-semibold">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak Hours Start</label>
            <input
              name="peakStart"
              type="time"
              value={peakStart}
              onChange={(e) => setPeakStart(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak Hours End</label>
            <input
              name="peakEnd"
              type="time"
              value={peakEnd}
              onChange={(e) => setPeakEnd(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Weekend Surcharge Multiplier</label>
          <input
            name="weekendMultiplier"
            type="number"
            step="0.05"
            value={weekendMultiplier}
            onChange={(e) => setWeekendMultiplier(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">1.15 = 15% rate increase for Saturday & Sunday bookings</p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="gold"
            size="md"
            icon={Save}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save Rate Rules
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PricingSettingsPage;
