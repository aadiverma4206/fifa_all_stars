import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, MapPin, DollarSign, Calendar } from 'lucide-react';

export const ManagerNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const links = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Manage Venue', path: '/manager/club', icon: Building2 },
    { name: 'Courts & Pitches', path: '/manager/courts', icon: MapPin },
    { name: 'Peak Pricing', path: '/manager/pricing', icon: DollarSign },
    { name: 'Reservations', path: '/manager/bookings', icon: Calendar },
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
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${
              active
                ? 'bg-sport-500 text-white shadow-md'
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

export default ManagerNav;
