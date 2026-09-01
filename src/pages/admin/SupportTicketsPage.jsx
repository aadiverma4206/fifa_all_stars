import React from 'react';
import { Ticket, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const SupportTicketsPage = () => {
  const { tickets, assignTicketStaff, resolveTicket } = useDataStore();
  const { usersList } = useAuthStore();

  const staffUsers = usersList.filter(u => u.role === 'OPS_ADMIN' || u.role === 'FINANCE_ADMIN' || u.role === 'SUPER_ADMIN');

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          Platform Support Tickets
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          Assign player and venue queries to Operations Staff (OPS_ADMIN) or Finance Staff (FINANCE_ADMIN)
        </p>
      </div>

      <div className="space-y-3.5">
        {tickets.map((tk) => {
          const isOpen = tk.status === 'OPEN';
          const isResolved = tk.status === 'RESOLVED';

          return (
            <div key={tk.id} className="admin-card p-5 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-amber-500 text-xs">{tk.id}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{tk.subject}</h3>
                  <Badge variant={isResolved ? 'emerald' : (isOpen ? 'danger' : 'gold')} size="sm" className="rounded-md">
                    {tk.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 font-medium">
                  Submitted by: <span className="text-slate-900 dark:text-white font-bold">{tk.user}</span> • Date: {tk.createdAt}
                </p>

                <p className="text-[11px] text-slate-500 font-medium">
                  Assigned Staff: <span className="text-sport-500 font-semibold">{tk.assignedStaff || 'Unassigned'}</span>
                </p>
              </div>

              {/* Staff Assignment & Resolution */}
              <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                {!isResolved && (
                  <>
                    <select
                      value={tk.assignedStaff}
                      onChange={(e) => assignTicketStaff(tk.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                    >
                      <option value="Unassigned">Assign to Staff...</option>
                      {staffUsers.map(s => (
                        <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                      ))}
                    </select>

                    <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => resolveTicket(tk.id)} className="rounded-md text-xs font-semibold">
                      Mark Resolved
                    </Button>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default SupportTicketsPage;
