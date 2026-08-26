import React from 'react';
import { Building2, Calendar, DollarSign, Plus, CheckCircle, Clock, Shield, MapPin } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import ManagerNav from '../../components/club/ManagerNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const ClubDashboardPage = () => {
  const { clubs, courts, bookings } = useDataStore();
  const { currentUser } = useAuthStore();

  // Scoped to manager ownership
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);
  const clubBookings = bookings.filter(b => b.clubId === myClub?.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = clubBookings.filter(b => b.date === todayStr || b.date === '2026-08-29');
  const thisMonthRevenue = clubBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  // Daily utilization data (Mon-Sun hours)
  const utilizationData = [
    { day: 'Mon', hours: 4.5, percent: 45 },
    { day: 'Tue', hours: 6.0, percent: 60 },
    { day: 'Wed', hours: 7.5, percent: 75 },
    { day: 'Thu', hours: 5.0, percent: 50 },
    { day: 'Fri', hours: 9.0, percent: 90 },
    { day: 'Sat', hours: 10.0, percent: 100 },
    { day: 'Sun', hours: 8.5, percent: 85 }
  ];

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <ManagerNav />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" size="sm">VENUE MANAGER PORTAL</Badge>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            {myClub?.name || 'Club Manager Dashboard'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-sport-500" />
            <span>{myClub?.address} ({myClub?.city})</span>
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="footy-card p-6 space-y-1">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Total Courts</span>
          <span className="text-3xl font-black text-sport-500">{myCourts.length} Pitches</span>
          <span className="block text-[10px] text-slate-500 font-semibold pt-1">Active turf & futsal courts</span>
        </div>

        <div className="footy-card p-6 space-y-1">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Today's Bookings</span>
          <span className="text-3xl font-black text-sky-500">{todayBookings.length} Slots</span>
          <span className="block text-[10px] text-slate-500 font-semibold pt-1">Confirmed player slots today</span>
        </div>

        <div className="footy-card p-6 space-y-1">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">This Month's Revenue</span>
          <span className="text-3xl font-black text-amber-500">₹{thisMonthRevenue.toFixed(2)}</span>
          <span className="block text-[10px] text-slate-500 font-semibold pt-1">Gross pitch booking revenue</span>
        </div>
      </div>

      {/* Simple Bar Chart of Daily Utilization */}
      <div className="footy-card p-6 space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Daily Pitch Utilization (Hours / Day)</h3>
          <p className="text-xs font-semibold text-slate-400">Weekly breakdown of court utilization hours across peak & off-peak windows</p>
        </div>

        <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          {utilizationData.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-black text-sport-500 group-hover:scale-110 transition-transform">
                {item.hours}h
              </span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl h-36 flex items-end p-1">
                <div
                  className="w-full bg-gradient-to-t from-sport-600 to-emerald-400 rounded-lg transition-all duration-500 group-hover:brightness-110"
                  style={{ height: `${item.percent}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Courts Overview */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Pitch Directory Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myCourts.map(crt => (
            <div key={crt.courtId || crt.id} className="footy-card p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{crt.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{crt.type} • {crt.surface}</p>
                </div>
                <Badge variant={crt.status === 'AVAILABLE' ? 'emerald' : 'danger'} size="sm">
                  {crt.status}
                </Badge>
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Base Price: <span className="text-sport-500 font-black">₹{crt.basePrice}/hr</span></span>
                <span className="text-amber-500">Peak {crt.peakMultiplier || 1.5}x</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubDashboardPage;
