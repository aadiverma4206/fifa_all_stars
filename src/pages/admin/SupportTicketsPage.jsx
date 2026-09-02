import React, { useState, useMemo } from 'react';
import { 
  Ticket, UserPlus, CheckCircle2, AlertCircle, Search, Filter, 
  Clock, ArrowUpDown, ChevronRight, User, Building2, Layers, 
  ShieldCheck, Eye, Plus, MessageSquare, AlertTriangle, Check, RefreshCw, Send
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const SupportTicketsPage = () => {
  const { tickets, assignTicketStaff, resolveTicket, createTicket, reopenTicket } = useDataStore();
  const { usersList } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const [resolutionText, setResolutionText] = useState('Issue has been investigated and resolved with the venue management.');
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    user: usersList[0]?.name || 'Arjun Mehta',
    priority: 'HIGH',
    category: 'VENUE_FACILITY',
    assignedStaff: 'Unassigned',
    description: ''
  });

  const staffUsers = useMemo(() => {
    return usersList.filter(u => 
      u.role === 'OPS_ADMIN' || 
      u.role === 'FINANCE_ADMIN' || 
      u.role === 'SUPER_ADMIN' || 
      u.role === 'CLUB_MANAGER'
    );
  }, [usersList]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const assignedCount = tickets.filter(t => t.status === 'ASSIGNED').length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
    return { total, openCount, assignedCount, resolvedCount };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(tk => {
        const matchesSearch = 
          tk.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tk.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tk.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tk.assignedStaff?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter !== 'ALL' && tk.status !== statusFilter) return false;

        if (priorityFilter !== 'ALL' && tk.priority !== priorityFilter) return false;

        if (staffFilter !== 'ALL' && tk.assignedStaff !== staffFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return (b.id || '').localeCompare(a.id || '');
        if (sortBy === 'PRIORITY') {
          const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        }
        if (sortBy === 'SUBJECT') return (a.subject || '').localeCompare(b.subject || '');
        return 0;
      });
  }, [tickets, searchTerm, statusFilter, priorityFilter, staffFilter, sortBy]);

  const handleOpenResolve = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionText('Issue has been investigated and resolved with the venue management.');
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    resolveTicket(selectedTicket.id, resolutionText);
    setIsResolveModalOpen(false);
    setSelectedTicket(null);
  };

  const handleOpenDetails = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!newTicketData.subject.trim()) {
      toast.error('Subject is required');
      return;
    }

    createTicket({
      subject: newTicketData.subject.trim(),
      user: newTicketData.user.trim(),
      priority: newTicketData.priority,
      category: newTicketData.category,
      assignedStaff: newTicketData.assignedStaff,
      description: newTicketData.description.trim()
    });

    setIsNewTicketModalOpen(false);
    setNewTicketData({
      subject: '',
      user: usersList[0]?.name || 'Arjun Mehta',
      priority: 'HIGH',
      category: 'VENUE_FACILITY',
      assignedStaff: 'Unassigned',
      description: ''
    });
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'HIGH') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] border border-rose-500/30">
          HIGH
        </span>
      );
    }
    if (priority === 'MEDIUM') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/30">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
        LOW
      </span>
    );
  };

  return (
    <div className="space-y-6 py-4 w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <AdminNav />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 bg-sport-500/10 dark:bg-sport-500/20 text-sport-600 dark:text-sport-400 rounded-xl border border-sport-500/30">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Platform Support Tickets
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Assign player and venue queries to Operations Staff (OPS_ADMIN) or Finance Staff (FINANCE_ADMIN).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {stats.openCount > 0 && (
            <button
              onClick={() => setStatusFilter('OPEN')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>{stats.openCount} Unassigned / Open Tickets</span>
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            rainbowBorder={false}
            onClick={() => setIsNewTicketModalOpen(true)}
            className="rounded-xl font-bold text-xs uppercase shadow-sm"
          >
            Create Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div 
          onClick={() => { setStatusFilter('ALL'); setPriorityFilter('ALL'); setStaffFilter('ALL'); }}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' 
              ? 'ring-2 ring-sport-500 bg-sport-50/30 dark:bg-sport-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tickets</span>
            <Ticket className="w-4 h-4 text-sport-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Lifetime player inquiries
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('OPEN')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'OPEN' 
              ? 'ring-2 ring-rose-500 bg-rose-50/30 dark:bg-rose-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open Tickets</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
            {stats.openCount}
            {stats.openCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <div className="text-[11px] font-bold text-rose-600/90 dark:text-rose-400/90 mt-1">
            {stats.openCount > 0 ? 'Requires Immediate Attention' : 'Zero Backlog'}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('ASSIGNED')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ASSIGNED' 
              ? 'ring-2 ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.assignedCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Assigned to ops / finance staff
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('RESOLVED')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'RESOLVED' 
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.resolvedCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Successfully closed tickets
          </div>
        </div>
      </div>

      <div className="admin-card p-3.5 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket subject, user name, ticket ID, or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
          </div>

          <div className="w-32 sm:w-36">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter tickets by priority"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'ALL', label: `All (${stats.total})` },
            { id: 'OPEN', label: `⚠️ Open (${stats.openCount})` },
            { id: 'ASSIGNED', label: `🔄 In Progress (${stats.assignedCount})` },
            { id: 'RESOLVED', label: `✅ Resolved (${stats.resolvedCount})` }
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
            aria-label="Sort support tickets"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
          >
            <option value="NEWEST">Sort: Newest</option>
            <option value="PRIORITY">Sort: High Priority</option>
            <option value="SUBJECT">Sort: Subject</option>
          </select>
        </div>

      </div>

      <div className="space-y-3.5">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((tk) => {
            const isOpen = tk.status === 'OPEN';
            const isAssigned = tk.status === 'ASSIGNED';
            const isResolved = tk.status === 'RESOLVED';

            return (
              <div 
                key={tk.id} 
                className="admin-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:shadow-md transition-all"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                      {tk.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {tk.subject}
                    </h3>
                    {getPriorityBadge(tk.priority || 'MEDIUM')}
                    <Badge variant={isResolved ? 'emerald' : (isOpen ? 'danger' : 'gold')} size="sm" className="rounded-lg">
                      {tk.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                    <div>
                      Submitted by: <strong className="text-slate-900 dark:text-white font-bold">{tk.user}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tk.createdAt || 'Recent'}</span>
                    </div>
                    <div>
                      Handler: <strong className="text-sport-600 dark:text-sport-400 font-bold">{tk.assignedStaff || 'Unassigned'}</strong>
                    </div>
                  </div>

                  {tk.resolutionNotes && isResolved && (
                    <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-1">
                      <strong>Resolution:</strong> {tk.resolutionNotes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                  {!isResolved ? (
                    <>
                      <select
                        value={tk.assignedStaff || 'Unassigned'}
                        onChange={(e) => assignTicketStaff(tk.id, e.target.value)}
                        aria-label="Assign ticket staff operator"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer max-w-[210px]"
                      >
                        <option value="Unassigned">Assign Staff...</option>
                        {staffUsers.map(s => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.role})
                          </option>
                        ))}
                      </select>

                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={CheckCircle2} 
                        rainbowBorder={false}
                        onClick={() => handleOpenResolve(tk)} 
                        className="rounded-xl text-xs font-bold py-2 shadow-sm"
                      >
                        Resolve Ticket
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        rainbowBorder={false}
                        onClick={() => handleOpenDetails(tk)}
                        className="rounded-xl text-xs font-bold py-2"
                      >
                        Inspect
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        rainbowBorder={false}
                        onClick={() => handleOpenDetails(tk)}
                        className="rounded-xl text-xs font-bold py-2"
                      >
                        View Record
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={RefreshCw}
                        rainbowBorder={false}
                        onClick={() => reopenTicket(tk.id)}
                        className="rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white py-2"
                      >
                        Re-open
                      </Button>
                    </>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="admin-card p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Support Tickets Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No tickets match your search or status filter. All player inquiries have been resolved.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                rainbowBorder={false}
                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
                className="rounded-xl text-xs font-bold"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Support Ticket">
        {selectedTicket && (
          <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs font-bold">
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-500 font-bold">{selectedTicket.id}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTicket.user}</span>
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {selectedTicket.subject}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Resolution Response & Action Memo
              </label>
              <textarea
                rows={3}
                required
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe action taken to resolve this query..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={CheckCircle2} rainbowBorder={false}>
                Confirm & Mark Resolved
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedTicket ? `Ticket History — ${selectedTicket.id}` : 'Ticket Details'}>
        {selectedTicket && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-sm text-amber-500">{selectedTicket.id}</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedTicket.subject}</h4>
                </div>
                <Badge variant={selectedTicket.status === 'RESOLVED' ? 'emerald' : selectedTicket.status === 'OPEN' ? 'danger' : 'gold'} size="sm" className="rounded-lg">
                  {selectedTicket.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Submitted By</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTicket.user}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Creation Date</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTicket.createdAt || 'Recent'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Priority Tier</div>
                  <div className="mt-0.5">{getPriorityBadge(selectedTicket.priority || 'MEDIUM')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Assigned Staff</div>
                  <div className="font-bold text-sport-600 dark:text-sport-400 mt-0.5">{selectedTicket.assignedStaff || 'Unassigned'}</div>
                </div>
              </div>
            </div>

            {selectedTicket.resolutionNotes && (
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1">
                <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">Resolution Memo</div>
                <div className="text-slate-800 dark:text-slate-200 font-medium">{selectedTicket.resolutionNotes}</div>
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

      <Modal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} title="Create Support Ticket">
        <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Subject *</label>
            <input
              type="text"
              required
              placeholder="E.g. Refund query or Floodlight issue"
              value={newTicketData.subject}
              onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Player / User</label>
              <input
                type="text"
                required
                value={newTicketData.user}
                onChange={(e) => setNewTicketData(prev => ({ ...prev, user: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Priority</label>
              <select
                value={newTicketData.priority}
                onChange={(e) => setNewTicketData(prev => ({ ...prev, priority: e.target.value }))}
                aria-label="Ticket Priority Level"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Assign Staff Operator</label>
            <select
              value={newTicketData.assignedStaff}
              onChange={(e) => setNewTicketData(prev => ({ ...prev, assignedStaff: e.target.value }))}
              aria-label="Assign Staff Operator"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
            >
              <option value="Unassigned">Unassigned (Assign Later)</option>
              {staffUsers.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsNewTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Plus} rainbowBorder={false}>
              Create Ticket
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default SupportTicketsPage;
