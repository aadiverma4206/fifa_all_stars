import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, Clock, Sparkles, Save, HelpCircle, Building2,
  TrendingUp, CheckCircle2, Calculator, Sliders, Calendar,
  RotateCcw, Check, Layers, ChevronRight, Info, Zap, Flame
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { validateTimeRange, validateNumericRange, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import toast from 'react-hot-toast';

export const PricingSettingsPage = () => {
  const { clubs, courts, updatePricingSettings } = useDataStore();
  const { currentUser } = useAuthStore();

  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);

  // Selected Court for customization
  const [selectedCourtId, setSelectedCourtId] = useState(myCourts[0]?.courtId || myCourts[0]?.id || '');
  const activeCourt = myCourts.find(c => (c.courtId || c.id) === selectedCourtId) || myCourts[0];

  // Pricing Rule States (Synced with activeCourt)
  const [peakStart, setPeakStart] = useState('17:00');
  const [peakEnd, setPeakEnd] = useState('21:00');
  const [peakMultiplier, setPeakMultiplier] = useState(1.5);
  const [weekendMultiplier, setWeekendMultiplier] = useState(1.75);
  const [applyToAll, setApplyToAll] = useState(false);

  // Async Mutation Loading State
  const [isSaving, setIsSaving] = useState(false);

  // Test Calculator State
  const [testDay, setTestDay] = useState('weekday_peak');
  const [testHours, setTestHours] = useState(1);

  // Sync state whenever selected court changes
  useEffect(() => {
    if (activeCourt) {
      if (activeCourt.pricingSettings?.peakWindow) {
        const [start, end] = activeCourt.pricingSettings.peakWindow.split('-');
        setPeakStart(start || '17:00');
        setPeakEnd(end || '21:00');
      } else {
        setPeakStart('17:00');
        setPeakEnd('21:00');
      }

      setPeakMultiplier(activeCourt.pricingSettings?.peakMultiplier || 1.5);
      setWeekendMultiplier(activeCourt.pricingSettings?.weekendMultiplier || 1.75);
    }
  }, [selectedCourtId]);

  const currentWindow = activeCourt?.pricingSettings?.peakWindow || '17:00-21:00';
  const currentPMult = activeCourt?.pricingSettings?.peakMultiplier || 1.5;
  const currentWMult = activeCourt?.pricingSettings?.weekendMultiplier || 1.75;
  const peakWindowStr = `${peakStart}-${peakEnd}`;
  const pMult = parseFloat(peakMultiplier);
  const wMult = parseFloat(weekendMultiplier);

  const hasUnsavedPricingChanges = Boolean(
    activeCourt && (
      peakWindowStr !== currentWindow ||
      pMult !== currentPMult ||
      wMult !== currentWMult ||
      applyToAll
    )
  );

  useUnsavedChanges(hasUnsavedPricingChanges, 'You have unsaved pitch pricing adjustments. Are you sure you want to leave without saving?');

  const basePrice = activeCourt ? parseFloat(activeCourt.basePrice) || 500 : 500;
  const peakPricePreview = (basePrice * (parseFloat(peakMultiplier) || 1.0)).toFixed(2);
  const weekendPricePreview = (basePrice * (parseFloat(weekendMultiplier) || 1.0)).toFixed(2);

  // Calculate live test quote
  const calculateTestTotal = () => {
    let rate = basePrice;
    if (testDay === 'weekday_peak') rate = basePrice * peakMultiplier;
    else if (testDay === 'weekend_offpeak') rate = basePrice * weekendMultiplier;
    else if (testDay === 'weekend_peak') rate = basePrice * peakMultiplier * (weekendMultiplier > 1.2 ? 1.15 : 1.0);
    return (rate * testHours).toFixed(2);
  };

  const isSavingRef = useRef(false);

  const handleSavePricing = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSaving || isSavingRef.current || !activeCourt) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e || document, [
      { check: () => validateTimeRange(peakStart, peakEnd), field: 'peakStart' },
      { check: () => validateNumericRange(peakMultiplier, 1.0, 5.0, 'Peak Surge Multiplier'), field: 'peakMultiplier' },
      { check: () => validateNumericRange(weekendMultiplier, 1.0, 5.0, 'Weekend Multiplier'), field: 'weekendMultiplier' }
    ]);

    if (!isValid) return;

    const pMult = parseFloat(peakMultiplier);
    const wMult = parseFloat(weekendMultiplier);
    const peakWindowStr = `${peakStart}-${peakEnd}`;

    // Detect whether anything actually changed
    const currentWindow = activeCourt.pricingSettings?.peakWindow || '17:00-21:00';
    const currentPMult = activeCourt.pricingSettings?.peakMultiplier || 1.5;
    const currentWMult = activeCourt.pricingSettings?.weekendMultiplier || 1.75;

    const hasChanges =
      peakWindowStr !== currentWindow ||
      pMult !== currentPMult ||
      wMult !== currentWMult ||
      applyToAll;

    if (!hasChanges) {
      toast('Pricing rules are already up to date.', { icon: 'ℹ️' });
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const pricingData = {
        peakWindow: peakWindowStr,
        peakMultiplier: pMult,
        weekendMultiplier: wMult
      };

      if (applyToAll && myCourts.length > 0) {
        myCourts.forEach(c => {
          updatePricingSettings(c.courtId || c.id, pricingData);
        });
        toast.success(`Pricing rules applied to all ${myCourts.length} pitches at ${myClub?.name || 'venue'}!`);
      } else {
        updatePricingSettings(activeCourt.courtId || activeCourt.id, pricingData);
        toast.success(`Pricing settings saved for ${activeCourt.name}!`);
      }
    } catch (err) {
      logActionError('handleSavePricing', err);
      toast.error(getErrorMessage(err, 'saving pricing rules'));
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 400);
    }
  };

  const handleResetToDefaults = () => {
    setPeakStart('17:00');
    setPeakEnd('21:00');
    setPeakMultiplier(1.5);
    setWeekendMultiplier(1.75);
    toast.success('Reset to standard recommended surge rules.');
  };

  return (
    <div className="space-y-6 py-4 max-w-[1700px] w-full mx-auto px-2 sm:px-4">

      {/* ═══ TOP HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-sport-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{myClub?.name || 'Club Venue'}</span>
            <Badge variant="gold" size="sm" className="rounded-md">⚡ SURGE ENGINE</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Peak & Dynamic Pricing Rules
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Configure evening peak hour multipliers and weekend surcharge rates to maximize venue yield and court utilization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="md"
            icon={RotateCcw}
            onClick={handleResetToDefaults}
            className="border-slate-300 dark:border-slate-700 text-xs font-bold"
          >
            Recommended Defaults
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            icon={Save}
            isLoading={isSaving}
            disabled={isSaving}
            onClick={handleSavePricing}
            className="shadow-lg shadow-sport-500/20 text-xs font-black"
          >
            {isSaving ? 'Saving Rules...' : 'Save Pricing Rules'}
          </Button>
        </div>
      </div>

      {/* ═══ KPI SUMMARY STATS CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card p-4 rounded-xl border bg-sport-500/10 border-sport-500/20">
          <div className="flex items-center justify-between">
            <span className="block text-2xl sm:text-3xl font-black text-sport-500">{myCourts.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pitches</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Pitches Configured</span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Active at venue</span>
        </div>

        <div className="admin-card p-4 rounded-xl border bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="block text-2xl sm:text-3xl font-black text-amber-500">{peakMultiplier}x</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">{peakStart}–{peakEnd}</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Evening Peak Surge</span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">₹{(basePrice * peakMultiplier).toFixed(0)}/hr current</span>
        </div>

        <div className="admin-card p-4 rounded-xl border bg-rose-500/10 border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="block text-2xl sm:text-3xl font-black text-rose-500">{weekendMultiplier}x</span>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Sat – Sun</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Weekend Multiplier</span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Prime weekend bookings</span>
        </div>

        <div className="admin-card p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="block text-2xl sm:text-3xl font-black text-emerald-500">+35%</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Estimated</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">Revenue Optimization</span>
          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Higher yield during peak hours</span>
        </div>
      </div>

      {/* ═══ PITCH SELECTOR RIBBON ═══ */}
      <div className="admin-card p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">Select Pitch:</span>
          {myCourts.map(c => {
            const isSelected = (c.courtId || c.id) === (activeCourt?.courtId || activeCourt?.id);
            return (
              <button
                key={c.courtId || c.id}
                type="button"
                onClick={() => setSelectedCourtId(c.courtId || c.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${isSelected ? 'bg-sport-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  ₹{c.basePrice}/hr
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="w-4 h-4 rounded text-sport-500 accent-sport-500 cursor-pointer"
            />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">Apply rules to all {myCourts.length} pitches</span>
          </label>
        </div>
      </div>

      {/* ═══ 2-COLUMN FULL-SCREEN WORKSPACE ═══ */}
      <form onSubmit={handleSavePricing}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═══════════════════════════════════════════
              LEFT / FORM COLUMN (7 Columns)
             ═══════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SECTION 1: EVENING PEAK WINDOW */}
            <div className="admin-card p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Evening Peak Time Window
                  </h3>
                </div>
                <Badge variant="gold" size="sm" className="rounded-md">Surge Hours</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Peak Start Time
                  </label>
                  <input
                    name="peakStart"
                    type="time"
                    value={peakStart}
                    onChange={(e) => setPeakStart(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Peak End Time
                  </label>
                  <input
                    name="peakEnd"
                    type="time"
                    value={peakEnd}
                    onChange={(e) => setPeakEnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Peak Multiplier Slider & Presets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                    Evening Surge Multiplier
                  </label>
                  <span className="text-base font-mono font-black text-amber-500 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                    {peakMultiplier}x ({Math.round((peakMultiplier - 1) * 100)}% Surge)
                  </span>
                </div>

                <input
                  name="peakMultiplier"
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.05"
                  value={peakMultiplier}
                  onChange={(e) => setPeakMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Quick Presets:</span>
                  {[
                    { label: '1.25x (+25%)', val: 1.25 },
                    { label: '1.50x (+50%)', val: 1.5 },
                    { label: '1.75x (+75%)', val: 1.75 },
                    { label: '2.00x (+100%)', val: 2.0 }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPeakMultiplier(p.val)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        peakMultiplier === p.val
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: WEEKEND & HOLIDAY SURCHARGE */}
            <div className="admin-card p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Weekend & Prime Day Surcharge
                  </h3>
                </div>
                <Badge variant="danger" size="sm" className="rounded-md">Saturday – Sunday</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                    Weekend Multiplier Rate
                  </label>
                  <span className="text-base font-mono font-black text-rose-500 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30">
                    {weekendMultiplier}x ({Math.round((weekendMultiplier - 1) * 100)}% Surge)
                  </span>
                </div>

                <input
                  name="weekendMultiplier"
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.05"
                  value={weekendMultiplier}
                  onChange={(e) => setWeekendMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Quick Presets:</span>
                  {[
                    { label: '1.25x (+25%)', val: 1.25 },
                    { label: '1.50x (+50%)', val: 1.5 },
                    { label: '1.75x (+75%)', val: 1.75 },
                    { label: '2.00x (Double Rate)', val: 2.0 }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setWeekendMultiplier(p.val)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        weekendMultiplier === p.val
                          ? 'bg-rose-500 text-white font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-sport-500 flex-shrink-0" />
                <span>When a booking falls on both a Weekend AND Evening Peak hours, a compounded prime multiplier applies automatically.</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="md" onClick={handleResetToDefaults}>
                Reset Defaults
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
                isLoading={isSaving}
                disabled={isSaving}
                className="shadow-lg shadow-sport-500/25"
              >
                {isSaving ? 'Applying...' : 'Save & Apply Pricing Rules'}
              </Button>
            </div>

          </div>

          {/* ═══════════════════════════════════════════
              RIGHT / SIMULATOR COLUMN (5 Columns)
             ═══════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6">

            {/* LIVE PRICING CALCULATOR & SIMULATOR */}
            <div className="admin-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Sparkles className="w-5 h-5 fill-amber-400/20" />
                  <h3 className="font-black text-sm uppercase tracking-wider">Live Pricing Calculator</h3>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400">{activeCourt?.name || 'Pitch'}</span>
              </div>

              {/* Price Tier Cards */}
              <div className="space-y-3">
                
                {/* 1. Base Off-Peak */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Base Off-Peak Slot Rate</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">1.0x</span>
                  </div>
                  <span className="text-2xl font-mono font-black text-white">₹{basePrice.toFixed(2)}<span className="text-xs text-slate-400 font-semibold">/hr</span></span>
                  <span className="block text-[11px] text-slate-400">Standard rate outside peak surge hours</span>
                </div>

                {/* 2. Evening Peak */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider block">Evening Peak Slot ({peakStart} – {peakEnd})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{peakMultiplier}x</span>
                  </div>
                  <span className="text-2xl font-mono font-black text-amber-300">₹{peakPricePreview}<span className="text-xs text-amber-400 font-semibold">/hr</span></span>
                  <p className="text-[11px] font-bold text-amber-300/80">
                    Calculated: ₹{basePrice} × {peakMultiplier} = ₹{peakPricePreview}/hr
                  </p>
                </div>

                {/* 3. Weekend Prime */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider block">Weekend Prime Slot (Sat / Sun)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">{weekendMultiplier}x</span>
                  </div>
                  <span className="text-2xl font-mono font-black text-rose-300">₹{weekendPricePreview}<span className="text-xs text-rose-400 font-semibold">/hr</span></span>
                  <p className="text-[11px] font-bold text-rose-300/80">
                    Calculated: ₹{basePrice} × {weekendMultiplier} = ₹{weekendPricePreview}/hr
                  </p>
                </div>

              </div>

              {/* Interactive Booking Simulator */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">
                  Test Player Booking Quote:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'weekday_offpeak', label: 'Weekday Morning (10 AM)' },
                    { key: 'weekday_peak', label: 'Weekday Peak (7 PM)' },
                    { key: 'weekend_offpeak', label: 'Weekend Day (2 PM)' },
                    { key: 'weekend_peak', label: 'Weekend Peak (8 PM)' }
                  ].map(slot => (
                    <button
                      key={slot.key}
                      type="button"
                      onClick={() => setTestDay(slot.key)}
                      className={`p-2.5 rounded-xl border text-left font-bold text-[11px] transition-all cursor-pointer ${
                        testDay === slot.key
                          ? 'bg-sport-500/20 border-sport-500 text-white font-black shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-400">Duration:</span>
                  <div className="flex items-center gap-2">
                    {[1, 1.5, 2].map(hrs => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setTestHours(hrs)}
                        className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                          testHours === hrs ? 'bg-sport-500 text-white font-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {hrs} hr{hrs > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-sport-500/20 border border-sport-500/40 flex items-center justify-between text-white">
                  <div>
                    <span className="text-[10px] font-black uppercase text-sport-400 block">Calculated Player Total:</span>
                    <span className="text-2xl font-mono font-black text-white">₹{calculateTestTotal()}</span>
                  </div>
                  <Badge variant="emerald" size="sm" className="font-black">Auto-Applied</Badge>
                </div>
              </div>

            </div>

            {/* QUICK SHORTCUTS */}
            <div className="admin-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Manager Quick Links
              </h4>

              <div className="space-y-2">
                <Link to="/club/courts" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Building2 className="w-4 h-4 text-sport-500" />
                    <span>Manage Pitches & Courts ({myCourts.length})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link to="/club/manage" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>Manage Venue Details & Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link to="/club/games" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Active Game Sessions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </form>

    </div>
  );
};

export default PricingSettingsPage;
