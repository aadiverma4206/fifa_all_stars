import React, { useState } from 'react';
import { Calendar, User, MapPin, DollarSign, Search, Filter, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import ManagerNav from '../../components/club/ManagerNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const BookingsPage = () => {
  const { clubs, bookings } = useDataStore();
  const { currentUser } = useAuthStore();

  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const clubBookings = bookings.filter(b => b.clubId === myClub?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = clubBookings.filter(b => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = b.userName?.toLowerCase()?.includes(searchLower);
    const courtMatch = b.courtName?.toLowerCase()?.includes(searchLower);
    const matchesSearch = nameMatch || courtMatch;

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cancellationRequests = clubBookings.filter(b => b.status === 'CANCELLED');

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <ManagerNav />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Court Bookings & Refund Requests
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Reservations roster for {myClub?.name} ({myClub?.city})
          </p>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="footy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search player name or court..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['all', 'CONFIRMED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all uppercase ${
                statusFilter === st
                  ? 'bg-sport-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Bookings' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Cancellation / Refund Requests (Read-Only Section) */}
      {cancellationRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-black text-sm uppercase tracking-wide">
              Cancellation / Refund Requests ({cancellationRequests.length})
            </h3>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">
            Below bookings have requested cancellation. Read-only status (actual refund approval is processed by Super Admin).
          </p>

          <div className="space-y-2">
            {cancellationRequests.map((req) => (
              <div key={req.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 flex justify-between items-center text-xs font-bold">
                <div>
                  <span className="text-slate-900 dark:text-white font-black">{req.userName}</span>
                  <span className="text-slate-400 font-semibold block">{req.courtName} • {req.date} ({req.startTime})</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-500 font-black">₹{req.amountPaid?.toFixed(2)}</span>
                  <span className="text-[10px] text-amber-500 font-extrabold block">Pending Admin Refund</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Roster Table */}
      <div className="footy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Player Name</th>
                <th className="p-4">Court / Pitch</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Amount (INR)</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {b.userName}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-bold">
                      {b.courtName}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {b.date} ({b.startTime} - {b.endTime})
                    </td>
                    <td className="p-4 font-black text-sport-500">
                      ₹{b.amountPaid?.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <Badge variant={b.status === 'CONFIRMED' ? 'emerald' : 'danger'} size="sm">
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-bold">
                    No court bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default BookingsPage;
