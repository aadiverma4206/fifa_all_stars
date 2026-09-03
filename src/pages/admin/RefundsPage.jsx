import React, { useState, useMemo, useRef } from 'react';
import { 
  RotateCcw, CheckCircle2, XCircle, DollarSign, Calendar, AlertTriangle, 
  Search, Filter, Clock, ArrowUpDown, ChevronRight, User, Building2, 
  Layers, ShieldCheck, Eye, CreditCard, Sparkles, Check, FileText, ArrowRight
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { validatePositiveAmount, validateNonEmpty, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import toast from 'react-hot-toast';

export const RefundsPage = () => {
  const { bookings, approveRefund, rejectRefund } = useDataStore();
  const { usersList } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'REFUNDED' | 'REFUND_REJECTED'
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedTier, setSelectedTier] = useState('100%');
  const [customAmount, setCustomAmount] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const [rejectReason, setRejectReason] = useState('Cancellation submitted within locked 2-hour window');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const isApprovingRef = useRef(false);
  const isRejectingRef = useRef(false);

  const refundRequests = useMemo(() => {
    return bookings.filter(b => 
      b.status === 'CANCELLED' || 
      b.status === 'REFUNDED' || 
      b.status === 'REFUND_REJECTED' ||
      b.refundRequestedAt
    );
  }, [bookings]);

  const stats = useMemo(() => {
    const total = refundRequests.length;
    const pendingList = refundRequests.filter(b => b.status === 'REFUND_PENDING' || b.status === 'CANCELLED');
    const pendingCount = pendingList.length;
    const pendingAmount = pendingList.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    const approvedList = refundRequests.filter(b => b.status === 'REFUNDED');
    const approvedCount = approvedList.length;
    const approvedAmount = approvedList.reduce((sum, b) => sum + (b.refundAmount || b.amountPaid || 0), 0);

    const rejectedCount = refundRequests.filter(b => b.status === 'REFUND_REJECTED').length;

    return { total, pendingCount, pendingAmount, approvedCount, approvedAmount, rejectedCount };
  }, [refundRequests]);

  const filteredRequests = useMemo(() => {
    return refundRequests
      .filter(b => {
        // Search Filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = b.id?.toLowerCase().includes(q);
          const matchUser = b.userName?.toLowerCase().includes(q);
          const matchClub = b.clubName?.toLowerCase().includes(q);
          const matchCourt = b.courtName?.toLowerCase().includes(q);
          if (!matchId && !matchUser && !matchClub && !matchCourt) return false;
        }

        // Status Filter
        if (statusFilter === 'PENDING') {
          if (b.status !== 'REFUND_PENDING' && b.status !== 'CANCELLED') return false;
        } else if (statusFilter === 'REFUNDED') {
          if (b.status !== 'REFUNDED') return false;
        } else if (statusFilter === 'REJECTED') {
          if (b.status !== 'REFUND_REJECTED') return false;
        }

        if (tierFilter !== 'ALL') {
          const tier = b.refundTier || '100%';
          if (!tier.includes(tierFilter)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return (b.id || '').localeCompare(a.id || '');
        if (sortBy === 'AMOUNT_HIGH') return (b.amountPaid || 0) - (a.amountPaid || 0);
        if (sortBy === 'AMOUNT_LOW') return (a.amountPaid || 0) - (b.amountPaid || 0);
        if (sortBy === 'PLAYER') return (a.userName || '').localeCompare(b.userName || '');
        return 0;
      });
  }, [refundRequests, searchTerm, statusFilter, tierFilter, sortBy]);

  const handleOpenApprove = (booking) => {
    setSelectedBooking(booking);
    const tier = booking.refundTier || '100%';
    setSelectedTier(tier.includes('50') ? '50%' : '100%');
    const baseAmt = booking.amountPaid || 0;
    const calcAmt = tier.includes('50') ? (baseAmt * 0.5) : baseAmt;
    setCustomAmount(calcAmt.toString());
    setAdminNote('Approved by Super Admin — Immediate wallet credit issued.');
    setIsApproveModalOpen(true);
  };

  const handleTierChange = (tier) => {
    setSelectedTier(tier);
    if (!selectedBooking) return;
    const baseAmt = selectedBooking.amountPaid || 0;
    if (tier === '100%') {
      setCustomAmount(baseAmt.toString());
    } else if (tier === '50%') {
      setCustomAmount((baseAmt * 0.5).toString());
    } else if (tier === '0%') {
      setCustomAmount('0');
    }
  };

  const handleConfirmApproval = async (e) => {
    e.preventDefault();
    if (!selectedBooking || isApproving || isApprovingRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validatePositiveAmount(customAmount, 'Refund Amount', true), field: 'customAmount' }
    ]);

    if (!isValid) return;

    const amt = parseFloat(customAmount);

    isApprovingRef.current = true;
    setIsApproving(true);
    try {
      approveRefund(
        selectedBooking.id,
        usersList,
        (updatedUsers) => {
          const current = useAuthStore.getState().currentUser;
          const updatedCurrent = current ? updatedUsers.find(u => u.id === current.id) || current : null;
          useAuthStore.setState({ usersList: updatedUsers, currentUser: updatedCurrent });
        },
        amt,
        selectedTier
      );

      setIsApproveModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      logActionError('handleConfirmApproval', err);
      toast.error(getErrorMessage(err, 'approving refund'));
    } finally {
      setIsApproving(false);
      setTimeout(() => {
        isApprovingRef.current = false;
      }, 400);
    }
  };

  const handleOpenReject = (booking) => {
    setSelectedBooking(booking);
    setRejectReason('Cancellation submitted within locked 2-hour window');
    setCustomRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedBooking || isRejecting || isRejectingRef.current) return;

    if (!checkNetworkOnline()) return;

    if (rejectReason === 'OTHER') {
      const isValid = validateFormAndFocus(e, [
        { check: () => validateNonEmpty(customRejectReason, 'Decline Reason'), field: 'customRejectReason' }
      ]);
      if (!isValid) return;
    }

    isRejectingRef.current = true;
    setIsRejecting(true);
    try {
      const finalReason = rejectReason === 'OTHER' ? customRejectReason : rejectReason;
      rejectRefund(selectedBooking.id, finalReason || 'Cancellation request not eligible for refund under venue rules');
      setIsRejectModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      logActionError('handleConfirmReject', err);
      toast.error(getErrorMessage(err, 'declining refund request'));
    } finally {
      setIsRejecting(false);
      setTimeout(() => {
        isRejectingRef.current = false;
      }, 400);
    }
  };

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const getUserDetails = (userId) => {
    return usersList.find(u => u.id === userId) || null;
  };

  return (
    <div className="space-y-6 py-4 w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <AdminNav />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 bg-sport-500/10 dark:bg-sport-500/20 text-sport-600 dark:text-sport-400 rounded-xl border border-sport-500/30">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Refund Approval & Wallet Reversals
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Review player cancellation requests, verify tier policies (100% / 50% / 0%), and execute wallet balance reversals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {stats.pendingCount > 0 && (
            <button
              onClick={() => setStatusFilter('PENDING')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{stats.pendingCount} Pending Reversals (₹{stats.pendingAmount.toFixed(2)})</span>
            </button>
          )}

          <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sport-500" />
            <span>Automated Ledger Verification</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div 
          onClick={() => { setStatusFilter('ALL'); setTierFilter('ALL'); }}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' 
              ? 'ring-2 ring-sport-500 bg-sport-50/30 dark:bg-sport-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Requests</span>
            <RotateCcw className="w-4 h-4 text-sport-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Lifetime cancellation volume
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('PENDING')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'PENDING' 
              ? 'ring-2 ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
            {stats.pendingCount}
            {stats.pendingCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-[11px] font-bold text-amber-600/90 dark:text-amber-400/90 mt-1">
            ₹{stats.pendingAmount.toFixed(2)} awaiting reversal
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('REFUNDED')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'REFUNDED' 
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approved & Credited</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.approvedCount}
          </div>
          <div className="text-[11px] font-bold text-emerald-600/90 dark:text-emerald-400/90 mt-1">
            ₹{stats.approvedAmount.toFixed(2)} refunded to wallets
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('REJECTED')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'REJECTED' 
              ? 'ring-2 ring-rose-500 bg-rose-50/30 dark:bg-rose-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Declined / Ineligible</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.rejectedCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Forfeit / late cancellation policies
          </div>
        </div>
      </div>

      <div className="admin-card p-3.5 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by booking reference, player name, court, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
          </div>

          <div className="w-36 sm:w-44">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Filter by refund tier"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Tiers</option>
              <option value="100%">100% Full Tier</option>
              <option value="50%">50% Partial Tier</option>
              <option value="0%">0% Forfeit Tier</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'ALL', label: `All (${stats.total})` },
            { id: 'PENDING', label: `⏳ Pending (${stats.pendingCount})` },
            { id: 'REFUNDED', label: `✅ Approved (${stats.approvedCount})` },
            { id: 'REJECTED', label: `❌ Declined (${stats.rejectedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort refund records"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
          >
            <option value="NEWEST">Sort: Newest</option>
            <option value="AMOUNT_HIGH">Sort: Highest Amount</option>
            <option value="AMOUNT_LOW">Sort: Lowest Amount</option>
            <option value="PLAYER">Sort: Player Name</option>
          </select>
        </div>

      </div>

      <div className="admin-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-5">Booking Ref</th>
                <th className="py-3.5 px-4">Player Details</th>
                <th className="py-3.5 px-4">Court & Venue</th>
                <th className="py-3.5 px-4">Refund Policy Tier</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((b) => {
                  const isPending = b.status === 'REFUND_PENDING' || b.status === 'CANCELLED';
                  const isRefunded = b.status === 'REFUNDED';
                  const isRejected = b.status === 'REFUND_REJECTED';
                  const player = getUserDetails(b.userId);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <button
                            onClick={() => handleOpenDetails(b)}
                            className="font-mono font-bold text-xs text-sport-600 dark:text-sport-400 hover:underline flex items-center gap-1"
                          >
                            <span>{b.id}</span>
                            <Eye className="w-3 h-3 text-slate-400" />
                          </button>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{b.date || 'Scheduled Date'} • {b.startTime || '19:00'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar 
                            src={player?.profileImageUrl || player?.avatar} 
                            name={b.userName || 'Player'} 
                            size="sm" 
                            className="rounded-lg flex-shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {b.userName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {player?.email || player?.phone || 'Registered Player'}
                            </div>
                            {player?.walletBalance !== undefined && (
                              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                Balance: ₹{player.walletBalance.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-sport-500" />
                            <span>{b.courtName || 'Court Alpha'}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {b.clubName || 'Bernabeu Arena Turf'} {b.city ? `(${b.city})` : ''}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            (b.refundTier || '100%').includes('100')
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : (b.refundTier || '').includes('50')
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}>
                            {b.refundTier || '100% Full Tier'}
                          </span>
                          {b.cancellationReason && (
                            <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px]" title={b.cancellationReason}>
                              {b.cancellationReason}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="text-sm font-black text-slate-900 dark:text-white">
                            ₹{(b.refundAmount !== undefined ? b.refundAmount : b.amountPaid)?.toFixed(2)}
                          </div>
                          {b.refundAmount !== undefined && b.refundAmount !== b.amountPaid && (
                            <div className="text-[10px] text-slate-400 line-through">
                              Orig: ₹{b.amountPaid?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        ) : isRefunded ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Wallet Credited
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Declined
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs">
                            {b.status}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isPending ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={CheckCircle2}
                                rainbowBorder={false}
                                onClick={() => handleOpenApprove(b)}
                                className="rounded-xl text-xs font-bold py-1.5 px-3 shadow-sm"
                              >
                                Approve Refund
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                icon={XCircle}
                                rainbowBorder={false}
                                onClick={() => handleOpenReject(b)}
                                className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-1.5 px-3"
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={FileText}
                              rainbowBorder={false}
                              onClick={() => handleOpenDetails(b)}
                              className="rounded-xl text-xs font-bold py-1.5 px-3"
                            >
                              Ledger Details
                            </Button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <RotateCcw className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">No Refund Records</div>
                      <p className="text-xs text-slate-400">No requests match your current search or filter criteria.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setTierFilter('ALL'); }}
                        className="text-xs font-bold text-sport-600 dark:text-sport-400 hover:underline pt-1"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve Refund & Reversal">
        {selectedBooking && (
          <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs font-bold">
            
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-500 font-bold">{selectedBooking.id}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBooking.userName}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>{selectedBooking.courtName} ({selectedBooking.clubName})</span>
                <span className="font-bold">Original: ₹{selectedBooking.amountPaid?.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Select Refund Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '100%', label: '100% Full Tier', desc: 'No penalty (>24h cancel)' },
                  { id: '50%', label: '50% Partial Tier', desc: 'Late cancellation fee' },
                  { id: '0%', label: 'Custom Amount', desc: 'Manual adjustment' }
                ].map(t => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => handleTierChange(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTier === t.id
                        ? 'bg-sport-500/10 border-sport-500 text-sport-600 dark:text-sport-400 ring-1 ring-sport-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">{t.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Wallet Credit Amount (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  name="customAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedBooking.amountPaid}
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-black focus:ring-2 focus:ring-sport-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-normal mt-1">
                This exact amount will be credited to {selectedBooking.userName}'s wallet immediately upon confirmation.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Audit Transaction Memo (Optional)
              </label>
              <textarea
                name="adminNote"
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Log reason for ledger audit..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                rainbowBorder={false}
                isLoading={isApproving}
                disabled={isApproving}
              >
                Confirm & Issue ₹{parseFloat(customAmount || '0').toFixed(2)}
              </Button>
            </div>

          </form>
        )}
      </Modal>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Decline Refund Request">
        {selectedBooking && (
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs font-bold">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Declining refund for Ref: {selectedBooking.id}</span>
              </div>
              <p className="text-[11px] font-normal text-slate-600 dark:text-slate-400">
                The booking will be marked as REJECTED and no funds will be returned to the player's wallet.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Select Policy Reason
              </label>
              <select
                name="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                aria-label="Select Policy Reason"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              >
                <option value="Cancellation submitted within locked 2-hour window">Cancellation submitted within locked 2-hour window</option>
                <option value="Player marked absent / No-show at venue">Player marked absent / No-show at venue</option>
                <option value="Match completed without dispute">Match completed without dispute</option>
                <option value="Violation of grassroots fair play code">Violation of grassroots fair play code</option>
                <option value="OTHER">Other custom reason</option>
              </select>
            </div>

            {rejectReason === 'OTHER' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Specify Decline Reason
                </label>
                <textarea
                  name="customRejectReason"
                  rows={2}
                  required
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="State the exact policy rationale..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                icon={XCircle}
                rainbowBorder={false}
                isLoading={isRejecting}
                disabled={isRejecting}
              >
                Confirm Decline
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedBooking ? `Refund Ledger Record — ${selectedBooking.id}` : 'Record Details'}>
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">{selectedBooking.id}</div>
                  <div className="text-[11px] text-slate-400">Match Ref & Slot Details</div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  selectedBooking.status === 'REFUNDED'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    : selectedBooking.status === 'REFUND_PENDING' || selectedBooking.status === 'CANCELLED'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                }`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Player</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedBooking.userName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Court & Venue</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedBooking.courtName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Original Paid</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">₹{selectedBooking.amountPaid?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Refund Processed</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{(selectedBooking.refundAmount !== undefined ? selectedBooking.refundAmount : selectedBooking.amountPaid)?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {selectedBooking.cancellationReason && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Player Cancellation Note</div>
                <div className="text-slate-700 dark:text-slate-300 font-medium mt-1">{selectedBooking.cancellationReason}</div>
              </div>
            )}

            {selectedBooking.rejectionReason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
                <div className="text-[10px] font-bold uppercase">Decline Rationale</div>
                <div className="font-medium mt-1">{selectedBooking.rejectionReason}</div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" size="sm" rainbowBorder={false} onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default RefundsPage;
