import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, RotateCcw, AlertTriangle, FileText, Ticket } from 'lucide-react';

export const AdminNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Club Approvals', path: '/admin/clubs', icon: Building2 },
    { name: 'Refund Requests', path: '/admin/refunds', icon: RotateCcw },
    { name: 'Match Disputes', path: '/admin/disputes', icon: AlertTriangle },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { name: 'Support Tickets', path: '/admin/tickets', icon: Ticket },
  ];

  return (
    <div className="footy-card p-2 flex items-center space-x-1.5 overflow-x-auto mb-6">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.path);
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${
              active
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default AdminNav;
