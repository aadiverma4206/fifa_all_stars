import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Building2, Trophy, DollarSign, CheckCircle, Ticket, 
  RotateCcw, AlertTriangle, UserCheck, ShieldCheck, Activity, ArrowUpRight, 
  Lock, FileText, ChevronRight, UserPlus
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import AdminNav from '../../components/admin/AdminNav';
import { Link, useNavigate } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { clubs, games, bookings, tickets, disputes, auditLogs } = useDataStore();
  const { usersList, currentUser } = useAuthStore();

  const activeClubs = clubs.filter(c => c.status !== 'PENDING').length;
  const pendingClubs = clubs.filter(c => c.status === 'PENDING').length;
  const pendingRefunds = bookings.filter(b => b.status === 'REFUND_PENDING' || b.status === 'CANCELLED').length;
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length;
  const blockedUsersCount = usersList.filter(u => u.status === 'SUSPENDED').length;
  const totalGrossRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  return (
    <div className="space-y-6 py-4 max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* 1. ENTERPRISE ADMIN HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-7 bg-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden rounded-lg"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Admin Info */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
              👑
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-white drop-shadow-sm">
                  Super Admin Back-Office
                </h1>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> COMMISSIONER PRIVILEGES
                </span>
              </div>

              <p className="text-xs font-medium text-slate-300 flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM OPERATIONAL & SECURE
                </span>
                <span className="text-slate-700">•</span>
                <span className="text-slate-300 font-semibold">
                  {usersList.length} Total Users • {clubs.length} Registered Venues
                </span>
              </p>
            </div>
          </div>

          {/* Right Admin Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="gold" 
              size="md" 
              icon={Users}
              rainbowBorder={true}
              onClick={() => navigate('/admin/users')} 
              className="rounded-md font-bold text-xs uppercase shadow-md"
            >
              Manage Users & Roles
            </Button>

            <Button 
              variant="primary" 
              size="md" 
              icon={Building2}
              rainbowBorder={true}
              onClick={() => navigate('/admin/clubs')} 
              className="rounded-md font-bold text-xs uppercase shadow-md text-white"
            >
              Club Approvals ({pendingClubs})
            </Button>
          </div>

        </div>
      </motion.div>


      {/* 2. RECTANGULAR KPI METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <Link to="/admin/users" className="admin-card admin-card-hover p-4 space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="w-7 h-7 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">{usersList.length}</span>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{blockedUsersCount} Blocked Users</span>
            </p>
          </div>
        </Link>

        <Link to="/admin/clubs" className="admin-card admin-card-hover p-4 space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Venues & Clubs</span>
            <div className="w-7 h-7 rounded-md bg-sport-500/10 text-sport-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-sport-500 block">{clubs.length}</span>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {activeClubs} Active • <span className="text-amber-500 font-semibold">{pendingClubs} Pending</span>
            </p>
          </div>
        </Link>

        <div className="admin-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-500 block">₹{totalGrossRevenue.toFixed(0)}</span>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              All pitch reservations & fees
            </p>
          </div>
        </div>

        <Link to="/admin/refunds" className="admin-card admin-card-hover p-4 space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Refunds</span>
            <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-rose-500 block">{pendingRefunds}</span>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Requests awaiting review
            </p>
          </div>
        </Link>

        <Link to="/admin/tickets" className="admin-card admin-card-hover p-4 space-y-2 block">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Support Tickets</span>
            <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-indigo-500 block">{openTickets}</span>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Active open support queries
            </p>
          </div>
        </Link>

      </div>


      {/* 3. MAIN GRID: USER ROSTER SUMMARY & LIVE AUDIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: USER ROSTER QUICK MANAGEMENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="admin-card p-5 sm:p-6 space-y-4 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  User Accounts Roster
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Platform users, role assignments, and active account status
                </p>
              </div>
              <Link to="/admin/users">
                <Button variant="outline" size="sm" className="rounded-md text-xs font-semibold">
                  View Full Roster ({usersList.length}) →
                </Button>
              </Link>
            </div>

            <div className="space-y-2.5">
              {usersList.slice(0, 6).map((user) => {
                const isSuspended = user.status === 'SUSPENDED';

                return (
                  <div key={user.id} className="p-3 rounded-md bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar src={user.profileImageUrl || user.avatar} name={user.name} size="sm" className="rounded-md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</span>
                          {user.isOwner && <Badge variant="gold" size="sm" className="rounded-md">Owner</Badge>}
                          <Badge variant={user.role === 'SUPER_ADMIN' ? 'gold' : (user.role === 'CLUB_MANAGER' ? 'blue' : 'emerald')} size="sm" className="rounded-md">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {user.email} • {user.city || 'Raipur'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <Badge variant={isSuspended ? 'danger' : 'emerald'} size="sm" className="rounded-md">
                        {isSuspended ? '🔴 BLOCKED' : '🟢 ACTIVE'}
                      </Badge>
                      <span className="text-xs font-bold text-amber-500">₹{user.walletBalance?.toFixed(0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* RIGHT COLUMN: RECENT AUDIT LOGS & ACTIONS (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="admin-card p-5 space-y-4 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Audit & Security Logs</span>
              </span>
              <Link to="/admin/audit-logs" className="text-[11px] font-semibold text-amber-500 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="text-amber-500 uppercase">{log.action}</span>
                    <span>{log.timestamp?.substring(11, 16) || 'Just now'}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">{log.details}</p>
                  <p className="text-[10px] text-slate-500 font-medium">By: {log.adminName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboardPage;
