import React, { useState } from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';

export const BookingsPage = () => {
  const { currentUser } = useAuthStore();
  const { clubs, bookings } = useDataStore();

  const club = clubs.find(c => c.id === currentUser?.clubId) || clubs[0];
  const clubBookings = bookings.filter(b => b.clubId === club.id);
  const [filterText, setFilterText] = useState('');

  const filtered = clubBookings.filter(b => 
    b.userName.toLowerCase().includes(filterText.toLowerCase()) ||
    b.courtName.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <CalendarCheck className="w-8 h-8 text-emerald-500" />
          <span>Court Reservations Log</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review player booking schedules and reservation revenue
        </p>
      </div>

      <div className="glass-card p-4 rounded-2xl border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by player or court..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="glass-card p-4 rounded-2xl border flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.userName}</h4>
                <Badge variant="emerald" size="sm">{b.courtName}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{b.date} ({b.startTime} - {b.endTime})</p>
            </div>

            <div className="text-right">
              <span className="block font-black text-base text-emerald-500">${b.amountPaid?.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{b.status.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;
