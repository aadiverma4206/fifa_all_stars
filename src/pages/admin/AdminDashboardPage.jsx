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
    <div className="space-y-8 py-4 max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* 1. SUPER ADMIN HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="footy-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Admin Info */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-xl flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-2xl font-black text-amber-400">
                👑
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white">
                  Super Admin Back-Office
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> COMMISSIONER PRIVILEGES
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-400 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM OPERATIONAL & SECURE
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-bold">
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
              onClick={() => navigate('/admin/users')} 
              className="shadow-xl shadow-amber-500/20"
            >
              MANAGE USERS & ROLES
            </Button>

            <Button 
              variant="outline" 
              size="md" 
              icon={Building2} 
              onClick={() => navigate('/admin/clubs')} 
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              CLUB APPROVALS ({pendingClubs})
            </Button>
          </div>

        </div>
      </motion.div>


      {/* 2. KPI METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <Link to="/admin/users" className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">{usersList.length}</span>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{blockedUsersCount} Blocked Users</span>
            </p>
          </div>
        </Link>

        <Link to="/admin/clubs" className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Venues & Clubs</span>
            <div className="w-8 h-8 rounded-xl bg-sport-500/10 text-sport-500 flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-sport-500 block">{clubs.length}</span>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {activeClubs} Active • <span className="text-amber-500 font-extrabold">{pendingClubs} Pending</span>
            </p>
          </div>
        </Link>

        <div className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-500 block">₹{totalGrossRevenue.toFixed(0)}</span>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              All pitch reservations & fees
            </p>
          </div>
        </div>

        <Link to="/admin/refunds" className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending Refunds</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-rose-500 block">{pendingRefunds}</span>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Requests awaiting approval
            </p>
          </div>
        </Link>

        <Link to="/admin/tickets" className="footy-card p-5 space-y-3 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Support Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-indigo-500 block">{openTickets}</span>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Active open support queries
            </p>
          </div>
        </Link>

      </div>


      {/* 3. MAIN CONTENT (GRID: USER ROSTER SUMMARY & LIVE AUDIT LOGS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: USER ROSTER QUICK MANAGEMENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="footy-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  User Accounts Roster
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Platform users, role assignments, and active account status
                </p>
              </div>
              <Link to="/admin/users">
                <Button variant="outline" size="sm">
                  View Full Roster ({usersList.length}) →
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {usersList.slice(0, 6).map((user) => {
                const isSuspended = user.status === 'SUSPENDED';

                return (
                  <div key={user.id} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar src={user.profileImageUrl || user.avatar} name={user.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{user.name}</span>
                          {user.isOwner && <Badge variant="gold" size="sm">Owner</Badge>}
                          <Badge variant={user.role === 'SUPER_ADMIN' ? 'gold' : (user.role === 'CLUB_MANAGER' ? 'blue' : 'emerald')} size="sm">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                          {user.email} • {user.city || 'Raipur'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <Badge variant={isSuspended ? 'danger' : 'emerald'} size="sm">
                        {isSuspended ? '🔴 BLOCKED' : '🟢 ACTIVE'}
                      </Badge>
                      <span className="text-xs font-black text-amber-500">₹{user.walletBalance?.toFixed(0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* RIGHT COLUMN: RECENT AUDIT LOGS & ACTIONS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="footy-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Audit & Security Logs</span>
              </span>
              <Link to="/admin/audit-logs" className="text-[11px] font-extrabold text-amber-500 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                    <span className="text-amber-500 uppercase">{log.action}</span>
                    <span>{log.timestamp?.substring(11, 16) || 'Just now'}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{log.details}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">By: {log.adminName}</p>
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
