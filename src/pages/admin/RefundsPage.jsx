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
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Refund Approval & Wallet Reversals
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Review player cancellation requests, refund tiers (100% / 50% / 0%), and execute wallet balance reversals
        </p>
      </div>

      {/* Refunds Table */}
      <div className="footy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Player</th>
                <th className="p-4">Court & Venue</th>
                <th className="p-4">Refund Tier</th>
                <th className="p-4">Amount (INR)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {refundRequests.length > 0 ? (
                refundRequests.map((b) => {
                  const isPending = b.status === 'REFUND_PENDING' || b.status === 'CANCELLED';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      
                      <td className="p-4 font-mono font-black text-slate-900 dark:text-white">
                        {b.id}
                      </td>

                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                        {b.userName}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {b.courtName} ({b.clubName})
                      </td>

                      <td className="p-4">
                        <Badge variant="gold" size="sm">
                          {b.refundTier || '100% Full Tier'}
                        </Badge>
                      </td>

                      <td className="p-4 font-black text-rose-500 text-sm">
                        ₹{b.amountPaid?.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <Badge variant={b.status === 'REFUNDED' ? 'emerald' : 'danger'} size="sm">
                          {b.status}
                        </Badge>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {isPending ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleApprove(b.id)}
                            >
                              Approve Refund
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              icon={XCircle}
                              onClick={() => rejectRefund(b.id, 'Cancellation request submitted post match deadline')}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-slate-400 font-bold italic text-xs">Processed</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-bold">
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
