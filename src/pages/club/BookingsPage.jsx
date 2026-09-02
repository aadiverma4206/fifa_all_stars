import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, MapPin, DollarSign, Search, Filter, RotateCcw,
  AlertTriangle, ShieldCheck, CheckCircle2, Clock, Building2,
  X, ChevronRight, Eye, Receipt, FileText, Sparkles, Phone, Mail,
  TrendingUp, Check, AlertCircle, Ban, RefreshCw
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';

export const BookingsPage = () => {
  const { clubs, courts, bookings } = useDataStore();
  const { currentUser } = useAuthStore();

  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);
  const clubBookings = bookings.filter(b => b.clubId === myClub?.id);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'tomorrow' | 'upcoming' | 'past' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [courtFilter, setCourtFilter] = useState('all');

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const todayStr = getTodayDate(0);
  const tomorrowStr = getTodayDate(1);

  // Stats Calculations
  const confirmedBookings = clubBookings.filter(b => b.status === 'CONFIRMED');
  const cancellationRequests = clubBookings.filter(b => b.status === 'CANCELLED' || b.status === 'REFUND_PENDING');
  const refundedBookings = clubBookings.filter(b => b.status === 'REFUNDED');
  const todayBookings = clubBookings.filter(b => b.date === todayStr);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (parseFloat(b.amountPaid) || 0), 0);

  // Filtered Bookings
  const filteredBookings = clubBookings.filter(b => {
    // 1. Status Filter
    let matchesStatus = true;
    if (statusFilter === 'CONFIRMED') matchesStatus = b.status === 'CONFIRMED';
    else if (statusFilter === 'CANCELLED') matchesStatus = b.status === 'CANCELLED' || b.status === 'REFUND_PENDING';
    else if (statusFilter === 'REFUNDED') matchesStatus = b.status === 'REFUNDED';

    // 2. Date Filter
    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = b.date === todayStr;
    else if (dateFilter === 'tomorrow') matchesDate = b.date === tomorrowStr;
    else if (dateFilter === 'upcoming') matchesDate = b.date >= todayStr;
    else if (dateFilter === 'past') matchesDate = b.date < todayStr;
    else if (dateFilter === 'custom' && customDate) matchesDate = b.date === customDate;

    // 3. Court Filter
    const matchesCourt = courtFilter === 'all' || b.courtId === courtFilter || b.courtName?.toLowerCase()?.includes(courtFilter.toLowerCase());

    // 4. Search Filter
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      b.userName?.toLowerCase()?.includes(searchLower) ||
      b.courtName?.toLowerCase()?.includes(searchLower) ||
      b.id?.toLowerCase()?.includes(searchLower) ||
      b.userEmail?.toLowerCase()?.includes(searchLower);

    return matchesStatus && matchesDate && matchesCourt && matchesSearch;
  });

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomDate('');
    setCourtFilter('all');
  };

  const handleOpenDetails = (b) => {
    setSelectedBooking(b);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 py-4 max-w-[1700px] w-full mx-auto px-2 sm:px-4">

      {/* ═══ TOP HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-sport-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{myClub?.name || 'Club Venue'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Court Bookings & Reservations Roster
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Monitor real-time player court reservations, track slot revenues, and view refund requests for your venue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-sport-500/10 border border-sport-500/20 text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Confirmed Revenue</span>
            <span className="text-xl font-mono font-black text-sport-500">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* ═══ KPI SUMMARY STATS CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Reservations', value: clubBookings.length, sub: 'All recorded bookings', color: 'text-sport-500', bg: 'bg-sport-500/10 border-sport-500/20', filter: 'all' },
          { label: 'Confirmed & Active', value: confirmedBookings.length, sub: 'Successful bookings', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', filter: 'CONFIRMED' },
          { label: 'Today\'s Bookings', value: todayBookings.length, sub: `For ${todayStr}`, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', filter: 'today' },
          { label: 'Refund Requests', value: cancellationRequests.length, sub: 'Pending admin review', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20', filter: 'CANCELLED' },
          { label: 'Refunded / Closed', value: refundedBookings.length, sub: 'Completed refunds', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700', filter: 'REFUNDED' },
        ].map(stat => (
          <div
            key={stat.label}
            onClick={() => {
              if (stat.filter === 'today') {
                setDateFilter('today');
              } else {
                setStatusFilter(stat.filter);
              }
            }}
            className="admin-card admin-card-hover p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className={`block text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">➔</span>
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">{stat.label}</span>
            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* ═══ FILTER & SEARCH TOOLBAR ═══ */}
      <div className="admin-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5">
        
        {/* Top Row: Search & Pick Date */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by player name, court/pitch name, or booking reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
            />
          </div>

          {/* Court Filter Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
            >
              <option value="all">All Courts / Pitches</option>
              {myCourts.map(c => (
                <option key={c.courtId || c.id} value={c.courtId || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Picker */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Pick Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setDateFilter('custom');
                else setDateFilter('all');
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            />
            {customDate && (
              <button
                onClick={() => { setCustomDate(''); setDateFilter('all'); }}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Status Buttons & Quick Date Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          
          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { key: 'all', label: `All Bookings (${clubBookings.length})` },
              { key: 'CONFIRMED', label: `✅ Confirmed (${confirmedBookings.length})` },
              { key: 'CANCELLED', label: `🔄 Refund Requests (${cancellationRequests.length})` },
              { key: 'REFUNDED', label: `💸 Refunded (${refundedBookings.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-sport-500 text-white shadow-xs font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Date Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Date:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: `⚡ Today` },
              { key: 'tomorrow', label: `🌅 Tomorrow` },
              { key: 'upcoming', label: '🔮 Future' },
              { key: 'past', label: '📜 Past' }
            ].map(d => (
              <button
                key={d.key}
                onClick={() => {
                  setDateFilter(d.key);
                  if (d.key !== 'custom') setCustomDate('');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  dateFilter === d.key
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}

            {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || customDate || courtFilter !== 'all') && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1 transition-all cursor-pointer ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ═══ CANCELLATION / REFUND ALERT BANNER (If any pending) ═══ */}
      {cancellationRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-black text-sm uppercase tracking-wide">
                Active Cancellation & Refund Requests ({cancellationRequests.length})
              </h3>
            </div>
            <Badge variant="gold" size="sm" className="font-black">Super Admin Review</Badge>
          </div>

          <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
            These bookings have been cancelled by players. Refund disbursements are processed securely by the Super Admin finance desk.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {cancellationRequests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-900 dark:text-white font-black">{req.userName}</span>
                  <span className="text-slate-400 font-medium block">{req.courtName} • {req.date} ({req.startTime}–{req.endTime})</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-rose-500 font-mono font-black text-sm">₹{parseFloat(req.amountPaid || 0).toFixed(2)}</span>
                  <span className="text-[10px] text-amber-500 font-black block uppercase">Pending Refund</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FULL-WIDTH BOOKINGS ROSTER TABLE ═══ */}
      <div className="admin-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Showing {filteredBookings.length} Reservation Record{filteredBookings.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Player Details</th>
                <th className="p-4">Pitch / Court</th>
                <th className="p-4">Slot Schedule</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isCancelled = b.status === 'CANCELLED' || b.status === 'REFUND_PENDING';
                  const isRefunded = b.status === 'REFUNDED';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      
                      {/* Player Details */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar name={b.userName} size="sm" className="rounded-lg" />
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block group-hover:text-sport-500 transition-colors">
                              {b.userName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {b.id?.slice(0, 12)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Court Name */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {b.courtName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {myClub?.name}
                        </span>
                      </td>

                      {/* Slot Schedule */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            <span>{b.date}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{b.startTime} – {b.endTime}</span>
                          </span>
                        </div>
                      </td>

                      {/* Amount Paid */}
                      <td className="p-4">
                        <span className="font-mono font-black text-sm text-sport-500 block">
                          ₹{parseFloat(b.amountPaid || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">Total Slot Fee</span>
                      </td>

                      {/* Payment Method */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
                          💳 {b.paymentMethod || 'Wallet / UPI'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isConfirmed ? (
                          <Badge variant="emerald" size="sm" className="font-black">
                            CONFIRMED
                          </Badge>
                        ) : isCancelled ? (
                          <Badge variant="danger" size="sm" className="font-black">
                            REFUND_PENDING
                          </Badge>
                        ) : isRefunded ? (
                          <Badge variant="gold" size="sm" className="font-black">
                            REFUNDED
                          </Badge>
                        ) : (
                          <Badge variant="blue" size="sm" className="font-black">
                            {b.status}
                          </Badge>
                        )}
                      </td>

                      {/* Action View */}
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleOpenDetails(b)}
                          className="text-xs font-bold"
                        >
                          View Details
                        </Button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400 space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-xl">📋</div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No reservations match your filters</p>
                    <p className="text-xs text-slate-400">Try changing status or clearing your date filters.</p>
                    <button
                      onClick={resetAllFilters}
                      className="px-3 py-1.5 rounded-lg bg-sport-500 text-white text-xs font-bold uppercase shadow-sm cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ═══ BOOKING DETAILS MODAL ═══ */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="🧾 Reservation Details" maxWidth="max-w-md">
        {selectedBooking && (
          <div className="space-y-4 text-xs font-semibold">
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Booking Reference</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedBooking.id}</span>
              </div>
              <Badge variant={selectedBooking.status === 'CONFIRMED' ? 'emerald' : 'danger'} size="sm" className="font-black">
                {selectedBooking.status}
              </Badge>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Player Name:</span>
                <span className="font-black text-slate-900 dark:text-white">{selectedBooking.userName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Venue & Pitch:</span>
                <span className="font-black text-slate-900 dark:text-white">{selectedBooking.courtName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-black text-slate-900 dark:text-white">{selectedBooking.date}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Slot Time:</span>
                <span className="font-black text-amber-500">{selectedBooking.startTime} – {selectedBooking.endTime}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-mono font-black text-base text-sport-500">₹{parseFloat(selectedBooking.amountPaid || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedBooking.paymentMethod || 'Online Wallet (FIFA Pay)'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setIsDetailsModalOpen(false)} className="w-full">
                Close
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default BookingsPage;
