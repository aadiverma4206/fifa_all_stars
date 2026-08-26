import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, RotateCcw, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import AuditLogRow from '../../components/superAdmin/AuditLogRow';

export const AdminDashboardPage = () => {
  const { usersList } = useAuthStore();
  const { clubs, refunds, disputes, auditLogs } = useDataStore();

  const pendingClubs = clubs.filter(c => c.status === 'pending');
  const pendingRefunds = refunds.filter(r => r.status === 'pending');
  const openDisputes = disputes.filter(d => d.status === 'open');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border space-y-2">
        <div className="flex items-center space-x-2">
          <Badge variant="purple">SUPER ADMIN CONSOLE</Badge>
          <span className="text-xs text-slate-400">System Oversight</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase">
          FIFA All Stars Executive Dashboard
        </h1>
        <p className="text-xs text-slate-400">
          Monitor platform health, verify new venues, handle match disputes, and audit system activities.
        </p>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link to="/admin/users" className="glass-card p-5 rounded-2xl border space-y-1 hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{usersList.length}</span>
        </Link>

        <Link to="/admin/approvals" className="glass-card p-5 rounded-2xl border space-y-1 hover:border-gold-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Club Approvals</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-500">{pendingClubs.length}</span>
        </Link>

        <Link to="/admin/refunds" className="glass-card p-5 rounded-2xl border space-y-1 hover:border-rose-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Refund Requests</span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-500">{pendingRefunds.length}</span>
        </Link>

        <Link to="/admin/disputes" className="glass-card p-5 rounded-2xl border space-y-1 hover:border-cyan-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Open Match Disputes</span>
            <AlertTriangle className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-2xl font-black text-cyan-500">{openDisputes.length}</span>
        </Link>
      </div>

      {/* Audit Trail Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent System Audit Trail</h3>
          <Link to="/admin/logs">
            <Button variant="ghost" size="sm" icon={ArrowRight}>View Full Logs</Button>
          </Link>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 4).map(log => (
            <AuditLogRow key={log.id} log={log} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
