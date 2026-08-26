import React from 'react';
import { HelpCircle, CheckCircle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const SupportTicketsPage = () => {
  const { supportTickets, resolveTicket } = useDataStore();

  const handleResolve = (id) => {
    resolveTicket(id);
    toast.success(`Support ticket ${id} resolved!`);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <HelpCircle className="w-8 h-8 text-emerald-500" />
          <span>Support Inquiries & Help Tickets</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Respond to user platform inquiries, venue listing help, and technical support requests
        </p>
      </div>

      <div className="space-y-3">
        {supportTickets.map(st => (
          <div key={st.id} className="glass-card p-5 rounded-2xl border flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant={st.status === 'open' ? 'gold' : 'emerald'} size="sm">
                  {st.status.toUpperCase()}
                </Badge>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{st.subject}</h4>
              </div>
              <p className="text-xs text-slate-400">Requested by {st.user} ({st.date})</p>
            </div>

            {st.status === 'open' && (
              <Button variant="primary" size="sm" icon={CheckCircle} onClick={() => handleResolve(st.id)}>
                Close Ticket
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportTicketsPage;
