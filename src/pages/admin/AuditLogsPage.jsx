import React, { useState, useMemo } from 'react';
import { 
  FileText, Shield, Clock, Search, Filter, ArrowUpDown, 
  Download, Activity, CheckCircle2, AlertTriangle, Eye, 
  RefreshCw, Layers, ShieldCheck, User, Calendar, ExternalLink
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const AuditLogsPage = () => {
  const { auditLogs } = useDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionCategory, setActionCategory] = useState('ALL');
  const [adminFilter, setAdminFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const adminNames = useMemo(() => {
    const list = Array.from(new Set(auditLogs.map(l => l.adminName).filter(Boolean)));
    return list;
  }, [auditLogs]);

  const stats = useMemo(() => {
    const total = auditLogs.length;
    const financialCount = auditLogs.filter(l => l.action?.includes('REFUND') || l.action?.includes('PAYMENT')).length;
    const venueCount = auditLogs.filter(l => l.action?.includes('CLUB') || l.action?.includes('COURT')).length;
    const matchCount = auditLogs.filter(l => l.action?.includes('DISPUTE') || l.action?.includes('GAME') || l.action?.includes('MATCH')).length;
    return { total, financialCount, venueCount, matchCount };
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs
      .filter(log => {
        const matchesSearch = 
          log.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.timestamp?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (adminFilter !== 'ALL' && log.adminName !== adminFilter) return false;

        if (actionCategory === 'FINANCIAL') {
          if (!log.action?.includes('REFUND') && !log.action?.includes('PAYMENT')) return false;
        } else if (actionCategory === 'VENUE') {
          if (!log.action?.includes('CLUB') && !log.action?.includes('COURT')) return false;
        } else if (actionCategory === 'DISPUTE') {
          if (!log.action?.includes('DISPUTE') && !log.action?.includes('GAME')) return false;
        } else if (actionCategory === 'TICKETS') {
          if (!log.action?.includes('TICKET')) return false;
        } else if (actionCategory === 'SYSTEM') {
          if (!log.action?.includes('PLATFORM') && !log.action?.includes('INIT') && !log.action?.includes('USER')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return (b.timestamp || '').localeCompare(a.timestamp || '');
        if (sortBy === 'OLDEST') return (a.timestamp || '').localeCompare(b.timestamp || '');
        if (sortBy === 'ACTION') return (a.action || '').localeCompare(b.action || '');
        return 0;
      });
  }, [auditLogs, searchTerm, actionCategory, adminFilter, sortBy]);

  const handleExportCSV = async () => {
    if (isExporting) return;

    if (filteredLogs.length === 0) {
      toast.error('No log records available to export');
      return;
    }

    setIsExporting(true);
    try {
      const headers = ['ID', 'Timestamp', 'Admin Name', 'Action', 'Target Component', 'Details'];
      const rows = filteredLogs.map(l => [
        l.id,
        l.timestamp,
        `"${l.adminName || ''}"`,
        `"${l.action || ''}"`,
        `"${l.target || ''}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `fifa_all_stars_audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Audit log CSV exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const getActionBadgeVariant = (action = '') => {
    if (action.includes('APPROVED') || action.includes('CREATED')) return 'emerald';
    if (action.includes('REJECTED') || action.includes('DISMISSED')) return 'danger';
    if (action.includes('REFUND')) return 'gold';
    if (action.includes('DISPUTE')) return 'purple';
    if (action.includes('TICKET')) return 'cyan';
    return 'blue';
  };

  return (
    <div className="space-y-6 py-4 w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <AdminNav />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 bg-sport-500/10 dark:bg-sport-500/20 text-sport-600 dark:text-sport-400 rounded-xl border border-sport-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Super Admin Live Audit Logs
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Read-only, immutable session history tracking role modifications, refund approvals, venue approvals, and dispute overrides.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Audit Stream Active</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            rainbowBorder={false}
            isLoading={isExporting}
            disabled={isExporting || filteredLogs.length === 0}
            onClick={handleExportCSV}
            className="rounded-xl font-bold text-xs uppercase shadow-sm"
          >
            {isExporting ? 'Exporting...' : 'Export Log CSV'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div 
          onClick={() => { setActionCategory('ALL'); setAdminFilter('ALL'); }}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            actionCategory === 'ALL' 
              ? 'ring-2 ring-sport-500 bg-sport-50/30 dark:bg-sport-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Events</span>
            <Activity className="w-4 h-4 text-sport-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Recorded platform operations
          </div>
        </div>

        <div 
          onClick={() => setActionCategory('FINANCIAL')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            actionCategory === 'FINANCIAL' 
              ? 'ring-2 ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Financial & Refunds</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.financialCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Wallet credits & reversions
          </div>
        </div>

        <div 
          onClick={() => setActionCategory('VENUE')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            actionCategory === 'VENUE' 
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Venues & Pitches</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.venueCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Approvals & ground changes
          </div>
        </div>

        <div 
          onClick={() => setActionCategory('DISPUTE')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            actionCategory === 'DISPUTE' 
              ? 'ring-2 ring-blue-500 bg-blue-50/30 dark:bg-blue-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Match Arbitrations</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.matchCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Dispute rulings & Elo adjustments
          </div>
        </div>
      </div>

      <div className="admin-card p-3.5 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, admin, component, or detail message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
          </div>

          <div className="w-36 sm:w-44">
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              aria-label="Filter logs by admin user"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Admins</option>
              {adminNames.map(adm => (
                <option key={adm} value={adm}>{adm}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'ALL', label: `All (${stats.total})` },
            { id: 'FINANCIAL', label: `💳 Financial (${stats.financialCount})` },
            { id: 'VENUE', label: `🏟️ Venues (${stats.venueCount})` },
            { id: 'DISPUTE', label: `⚖️ Disputes (${stats.matchCount})` },
            { id: 'TICKETS', label: '🎫 Tickets' },
            { id: 'SYSTEM', label: '⚙️ System' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActionCategory(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
                actionCategory === tab.id
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
            aria-label="Sort audit records"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
          >
            <option value="NEWEST">Sort: Newest First</option>
            <option value="OLDEST">Sort: Oldest First</option>
            <option value="ACTION">Sort: Action Name</option>
          </select>
        </div>

      </div>

      <div className="admin-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Admin Operator</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Audit Log Message</th>
                <th className="py-3.5 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const badgeVariant = getActionBadgeVariant(log.action);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <div className="font-mono text-slate-900 dark:text-white font-bold text-xs">
                            {log.timestamp}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            System Time (UTC+05:30)
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2.5">
                          <Avatar name={log.adminName || 'Admin'} size="xs" className="rounded-md" />
                          <div>
                            <div className="font-bold text-xs text-amber-500">
                              {log.adminName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Platform Owner
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
                          badgeVariant === 'emerald'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : badgeVariant === 'danger'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : badgeVariant === 'gold'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : badgeVariant === 'purple'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : badgeVariant === 'cyan'
                            ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {log.target}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-slate-600 dark:text-slate-300 font-medium text-xs leading-relaxed line-clamp-2">
                          {log.details}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleOpenDetail(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sport-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Event Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">No Audit Logs Found</div>
                      <p className="text-xs text-slate-400">No events match your search or category filter.</p>
                      <button
                        onClick={() => { setSearchTerm(''); setActionCategory('ALL'); setAdminFilter('ALL'); }}
                        className="text-xs font-bold text-sport-600 dark:text-sport-400 hover:underline pt-1"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedLog ? `Audit Record — ${selectedLog.id}` : 'Audit Record'}>
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">{selectedLog.id}</div>
                  <div className="text-[11px] text-slate-400">Session Sequence Reference</div>
                </div>
                <Badge variant={getActionBadgeVariant(selectedLog.action)} size="sm" className="rounded-lg">
                  {selectedLog.action}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Admin Operator</div>
                  <div className="font-bold text-amber-500 mt-0.5">{selectedLog.adminName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Timestamp</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedLog.timestamp}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Target Entity</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedLog.target}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Verification</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Immutable Log
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Log Message Payload</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{selectedLog.details}</div>
            </div>

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

export default AuditLogsPage;
