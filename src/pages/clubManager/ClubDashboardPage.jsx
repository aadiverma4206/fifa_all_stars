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
    <div className="space-y-6 py-6 max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-10 overflow-x-hidden">
      {/* Header Banner */}
      <div className="admin-card p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img src={club.image} alt={club.name} className="w-16 h-16 rounded-md object-cover border border-slate-200 dark:border-slate-800" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{club.name}</h1>
              <Badge variant="emerald" size="sm" className="rounded-md">{club.status.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">{club.location} • Manager: {currentUser?.name}</p>
          </div>
        </div>

        <Link to="/manager/club">
          <Button variant="outline" size="sm" icon={Building2} className="rounded-md font-bold text-xs uppercase border-slate-300 dark:border-slate-700">
            Edit Club Info
          </Button>
        </Link>
      </div>

      {/* Overview Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-500">₹{totalRevenue.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 font-medium block">+14% increase from last month</span>
        </div>

        <div className="admin-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reservations</span>
            <div className="w-8 h-8 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{clubBookings.length}</span>
          <span className="text-[10px] text-slate-400 font-medium block">Active court bookings</span>
        </div>

        <div className="admin-card p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courts Managed</span>
            <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Settings className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{clubCourts.length}</span>
          <span className="text-[10px] text-slate-400 font-medium block">11v11 stadium pitches</span>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Recent Turf Reservations</h3>
          <Link to="/manager/bookings">
            <Button variant="ghost" size="sm" icon={ArrowRight} className="rounded-md font-semibold text-xs">View All Reservations</Button>
          </Link>
        </div>

        <div className="admin-card rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {clubBookings.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {clubBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs font-medium">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{b.userName} • {b.courtName}</h4>
                    <p className="text-slate-400 mt-0.5">{b.date} ({b.startTime} - {b.endTime})</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-500">₹{b.amountPaid?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              No recent reservations for your club.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ClubDashboardPage;
