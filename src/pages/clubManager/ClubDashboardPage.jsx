import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CalendarCheck, Settings, Building2, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const ClubDashboardPage = () => {
  const { currentUser } = useAuthStore();
  const { clubs, courts, bookings } = useDataStore();

  const club = clubs.find(c => c.id === currentUser?.clubId) || clubs[0];
  const clubCourts = courts.filter(crt => crt.clubId === club.id);
  const clubBookings = bookings.filter(b => b.clubId === club.id);

  const totalRevenue = clubBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img src={club.image} alt={club.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{club.name}</h1>
              <Badge variant="emerald">{club.status.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">{club.location} • Manager: {currentUser?.name}</p>
          </div>
        </div>

        <Link to="/manager/club">
          <Button variant="outline" size="sm" icon={Building2}>
            Edit Club Info
          </Button>
        </Link>
      </div>

      {/* Overview Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-emerald-500">${totalRevenue.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 block">+14% increase from last month</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Reservations</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white">{clubBookings.length}</span>
          <span className="text-[10px] text-slate-400 block">Active court bookings</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Courts Managed</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white">{clubCourts.length}</span>
          <span className="text-[10px] text-slate-400 block">5v5 & 7v7 pitches</span>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Turf Reservations</h3>
          <Link to="/manager/bookings">
            <Button variant="ghost" size="sm" icon={ArrowRight}>View All Reservations</Button>
          </Link>
        </div>

        <div className="glass-card p-4 rounded-2xl border space-y-3">
          {clubBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{b.userName} • {b.courtName}</h4>
                <p className="text-slate-400">{b.date} ({b.startTime} - {b.endTime})</p>
              </div>
              <span className="font-black text-emerald-500">${b.amountPaid?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ClubDashboardPage;
