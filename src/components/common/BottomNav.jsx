import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, MapPin, Trophy, User, LayoutDashboard, Building2, Search, Shield, Users, DollarSign, Calendar, RotateCcw, AlertTriangle, FileText, Ticket } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getRoleNavItems } from '../../utils/permissions';

export const BottomNav = () => {
  const location = useLocation();
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const role = currentUser.role?.toUpperCase();
  const isActive = (path) => location.pathname === path;

  const navItems = getRoleNavItems(role).slice(0, 5); // Take top 5 items for clean mobile bottom bar

  const iconMap = {
    Flame,
    Search,
    MapPin,
    Trophy,
    Shield,
    Users,
    User,
    LayoutDashboard,
    Building2,
    DollarSign,
    Calendar,
    RotateCcw,
    AlertTriangle,
    FileText,
    Ticket
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-16 px-1 sm:px-2">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.icon] || Flame;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 flex-1 py-1 transition-all min-w-0 ${
                active
                  ? 'text-sport-500 font-black'
                  : 'text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-900'
              }`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider truncate max-w-[56px] sm:max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
