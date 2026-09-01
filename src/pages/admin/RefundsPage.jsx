import React from 'react';
import { RotateCcw, CheckCircle2, XCircle, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const RefundsPage = () => {
  const { bookings, approveRefund, rejectRefund } = useDataStore();
  const { usersList, updateProfile } = useAuthStore();

  const refundRequests = bookings.filter(b => b.status === 'REFUND_PENDING' || b.status === 'CANCELLED' || b.status === 'REFUNDED');

  const handleApprove = (bookingId) => {
    approveRefund(bookingId, usersList, (updatedUsers) => {
      useAuthStore.setState({ usersList: updatedUsers });
    });
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          Refund Approval & Wallet Reversals
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          Review player cancellation requests, refund tiers (100% / 50% / 0%), and execute wallet balance reversals
        </p>
      </div>

      {/* Refunds Table */}
      <div className="admin-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Player</th>
                <th className="p-3.5">Court & Venue</th>
                <th className="p-3.5">Refund Tier</th>
                <th className="p-3.5">Amount (INR)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {refundRequests.length > 0 ? (
                refundRequests.map((b) => {
                  const isPending = b.status === 'REFUND_PENDING' || b.status === 'CANCELLED';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {b.id}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {b.userName}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {b.courtName} ({b.clubName})
                      </td>

                      <td className="p-3.5">
                        <Badge variant="gold" size="sm" className="rounded-md">
                          {b.refundTier || '100% Full Tier'}
                        </Badge>
                      </td>

                      <td className="p-3.5 font-bold text-rose-500 text-xs">
                        ₹{b.amountPaid?.toFixed(2)}
                      </td>

                      <td className="p-3.5">
                        <Badge variant={b.status === 'REFUNDED' ? 'emerald' : 'danger'} size="sm" className="rounded-md">
                          {b.status}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {isPending ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleApprove(b.id)}
                              className="rounded-md text-xs font-semibold"
                            >
                              Approve Refund
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              icon={XCircle}
                              onClick={() => rejectRefund(b.id, 'Cancellation request submitted post match deadline')}
                              className="rounded-md text-xs font-semibold"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium italic text-xs">Processed</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    No pending refund requests.
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

export default RefundsPage;
