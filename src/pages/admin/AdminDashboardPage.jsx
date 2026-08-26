import React from 'react';
import { Shield, Users, Building2, Trophy, DollarSign, CheckCircle, Ticket, RotateCcw, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const { clubs, games, bookings, tickets, disputes } = useDataStore();
  const { usersList } = useAuthStore();

  const activeClubs = clubs.filter(c => c.status !== 'PENDING').length;
  const pendingClubs = clubs.filter(c => c.status === 'PENDING').length;
  const pendingRefunds = bookings.filter(b => b.status === 'REFUND_PENDING' || b.status === 'CANCELLED').length;
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length;
  const totalGrossRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <AdminNav />

      <div>
        <Badge variant="gold" size="sm">SUPER ADMIN COMMISSIONER</Badge>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
          FIFA All Stars Master Back-Office
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Full system-wide oversight: User permissions, venue approvals, refund processing, match disputes, and live audit logging
        </p>
      </div>

      {/* Overview Cards with Icons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link to="/admin/users" className="footy-card p-5 space-y-2 hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-sky-500">
            <Users className="w-5 h-5" />
            <span className="text-2xl font-black">{usersList.length}</span>
          </div>
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Total Users</span>
        </Link>

        <Link to="/admin/clubs" className="footy-card p-5 space-y-2 hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-sport-500">
            <Building2 className="w-5 h-5" />
            <span className="text-2xl font-black">{clubs.length}</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>Active: {activeClubs}</span>
            <span className="text-amber-500">Pending: {pendingClubs}</span>
          </div>
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Venues & Clubs</span>
        </Link>

        <div className="footy-card p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <DollarSign className="w-5 h-5" />
            <span className="text-2xl font-black">₹{totalGrossRevenue.toFixed(0)}</span>
          </div>
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
        </div>

        <Link to="/admin/refunds" className="footy-card p-5 space-y-2 hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-rose-500">
            <RotateCcw className="w-5 h-5" />
            <span className="text-2xl font-black">{pendingRefunds}</span>
          </div>
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Pending Refunds</span>
        </Link>

        <Link to="/admin/tickets" className="footy-card p-5 space-y-2 hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-indigo-500">
            <Ticket className="w-5 h-5" />
            <span className="text-2xl font-black">{openTickets}</span>
          </div>
          <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Open Support Tickets</span>
        </Link>
      </div>

      {/* Users Quick Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Platform User Roster</h3>
          <Link to="/admin/users" className="text-xs font-black text-amber-500 hover:underline">Manage All Users →</Link>
        </div>

        <div className="space-y-2">
          {usersList.slice(0, 5).map((user) => (
            <div key={user.id} className="footy-card p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{user.name}</h4>
                  {user.isOwner && <Badge variant="gold" size="sm">Platform Owner</Badge>}
                  <Badge variant={user.role === 'SUPER_ADMIN' ? 'gold' : (user.role === 'CLUB_MANAGER' ? 'blue' : 'emerald')} size="sm">
                    {user.role}
                  </Badge>
                  <Badge variant={user.status === 'SUSPENDED' ? 'danger' : 'emerald'} size="sm">
                    {user.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-semibold">{user.email} • {user.city}</p>
              </div>

              <div className="text-right">
                <span className="block text-sm font-black text-amber-500">₹{user.walletBalance?.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 font-bold">{user.eloRating || user.elo || 1000} Elo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
