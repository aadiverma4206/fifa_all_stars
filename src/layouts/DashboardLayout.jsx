import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Settings,
  Users,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle,
  Trophy,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import ThemeToggle from '../components/common/ThemeToggle';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';

export const DashboardLayout = () => {
  const { currentUser } = useAuthStore();
  const location = useLocation();

  const isManager = currentUser?.role === 'club_manager';
  const isAdmin = currentUser?.role === 'super_admin';

  const managerLinks = [
    { name: 'Overview', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Club Profile', path: '/manager/club', icon: Building2 },
    { name: 'Courts & Slots', path: '/manager/courts', icon: Settings },
    { name: 'Peak Pricing', path: '/manager/pricing', icon: Settings },
    { name: 'Reservations', path: '/manager/bookings', icon: CalendarCheck },
  ];

  const adminLinks = [
    { name: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Club Approvals', path: '/admin/approvals', icon: ShieldCheck },
    { name: 'Refund Requests', path: '/admin/refunds', icon: RotateCcw },
    { name: 'Match Disputes', path: '/admin/disputes', icon: AlertTriangle },
    { name: 'Audit Logs', path: '/admin/logs', icon: FileSpreadsheet },
    { name: 'Support Tickets', path: '/admin/tickets', icon: HelpCircle },
  ];

  const activeLinks = isManager ? managerLinks : adminLinks;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-6">
          {/* Header logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-white uppercase">
                FIFA <span className="text-emerald-500">PORTAL</span>
              </span>
              <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                {isManager ? 'Club Manager' : 'Super Admin'}
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="space-y-1.5 pt-2">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-500' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Info & Return to Player */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <Link
            to="/games"
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors px-2 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to Player View</span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Avatar src={currentUser?.avatar} size="sm" />
              <div className="text-xs truncate max-w-[110px]">
                <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden glass-panel p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" className="text-base font-black uppercase">
            FIFA <span className="text-emerald-500">PORTAL</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link to="/games" className="text-xs font-bold text-emerald-500">Player Hub</Link>
            <ThemeToggle />
          </div>
        </div>

        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
