import React, { useState } from 'react';
import { DollarSign, Clock, Sparkles, Save, HelpCircle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import ManagerNav from '../../components/club/ManagerNav';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const PricingSettingsPage = () => {
  const { clubs, courts, updatePricingSettings } = useDataStore();
  const { currentUser } = useAuthStore();

  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);

  const [selectedCourtId, setSelectedCourtId] = useState(myCourts[0]?.courtId || myCourts[0]?.id || '');
  const activeCourt = myCourts.find(c => (c.courtId || c.id) === selectedCourtId) || myCourts[0];

  const [peakStart, setPeakStart] = useState(activeCourt?.peakWindow?.split('-')[0] || '17:00');
  const [peakEnd, setPeakEnd] = useState(activeCourt?.peakWindow?.split('-')[1] || '21:00');
  const [peakMultiplier, setPeakMultiplier] = useState(activeCourt?.peakMultiplier || 1.5);
  const [weekendMultiplier, setWeekendMultiplier] = useState(activeCourt?.weekendMultiplier || 1.75);

  const basePrice = activeCourt?.basePrice || 400;
  const peakPricePreview = (basePrice * peakMultiplier).toFixed(2);
  const weekendPricePreview = (basePrice * weekendMultiplier).toFixed(2);

  const handleSavePricing = (e) => {
    e.preventDefault();
    if (!activeCourt) return;

    updatePricingSettings(activeCourt.courtId || activeCourt.id, {
      peakWindow: `${peakStart}-${peakEnd}`,
      peakMultiplier: parseFloat(peakMultiplier),
      weekendMultiplier: parseFloat(weekendMultiplier)
    });
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      <ManagerNav />

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Peak & Dynamic Pricing Rules
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Configure evening peak hour multipliers and weekend surcharge rates per pitch
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form */}
        <form onSubmit={handleSavePricing} className="lg:col-span-7 footy-card p-6 sm:p-8 space-y-6">
          
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase text-slate-400">Select Pitch</label>
            <select
              value={selectedCourtId}
              onChange={(e) => {
                const cId = e.target.value;
                setSelectedCourtId(cId);
                const crt = myCourts.find(c => (c.courtId || c.id) === cId);
                if (crt) {
                  setPeakStart(crt.peakWindow?.split('-')[0] || '17:00');
                  setPeakEnd(crt.peakWindow?.split('-')[1] || '21:00');
                  setPeakMultiplier(crt.peakMultiplier || 1.5);
                  setWeekendMultiplier(crt.weekendMultiplier || 1.75);
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-extrabold text-xs text-slate-900 dark:text-white"
            >
              {myCourts.map(c => (
                <option key={c.courtId || c.id} value={c.courtId || c.id}>
                  {c.name} (Base: ₹{c.basePrice}/hr)
                </option>
              ))}
            </select>
          </div>

          {/* Peak Window Picker */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Evening Peak Time Window</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak Start Time</label>
                <input
                  type="time"
                  value={peakStart}
                  onChange={(e) => setPeakStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Peak End Time</label>
                <input
                  type="time"
                  value={peakEnd}
                  onChange={(e) => setPeakEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Multipliers */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-700 dark:text-slate-300">Peak Window Multiplier</label>
                <span className="text-amber-500 font-black">{peakMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={peakMultiplier}
                onChange={(e) => setPeakMultiplier(parseFloat(e.target.value))}
                className="w-full accent-sport-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-700 dark:text-slate-300">Weekend Multiplier (Sat - Sun)</label>
                <span className="text-rose-500 font-black">{weekendMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={weekendMultiplier}
                onChange={(e) => setWeekendMultiplier(parseFloat(e.target.value))}
                className="w-full accent-sport-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button type="submit" variant="primary" size="md" icon={Save}>
              Save Pricing Rules
            </Button>
          </div>

        </form>

        {/* Right Live Calculator Preview */}
        <div className="lg:col-span-5 footy-card p-6 sm:p-8 space-y-5 bg-gradient-to-tr from-slate-900 to-slate-950 text-white border border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Live Pricing Calculator</h3>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Base Off-Peak Slot Rate</span>
              <span className="text-2xl font-black text-white">₹{basePrice.toFixed(2)}/hr</span>
              <span className="block text-[11px] text-slate-400">Standard rate outside peak hours</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider block">Evening Peak Slot ({peakStart} - {peakEnd})</span>
              <span className="text-2xl font-black">₹{peakPricePreview}</span>
              <p className="text-[11px] font-bold text-amber-300 pt-1">
                Example: 6 PM booking = ₹{basePrice} x {peakMultiplier} = ₹{peakPricePreview}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider block">Weekend Prime Slot (Sat/Sun)</span>
              <span className="text-2xl font-black">₹{weekendPricePreview}</span>
              <p className="text-[11px] font-bold text-rose-300 pt-1">
                Example: Saturday 8 PM booking = ₹{basePrice} x {weekendMultiplier} = ₹{weekendPricePreview}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingSettingsPage;
