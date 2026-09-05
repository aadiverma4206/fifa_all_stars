import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Wallet, Menu, X, LogOut, User, Settings, CreditCard, 
  ChevronDown, ChevronRight, Building2, Flame, Search, MapPin, 
  Shield, Users, LayoutDashboard, DollarSign, Calendar, RotateCcw, 
  AlertTriangle, FileText, Ticket 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getRoleNavItems, getDefaultRoleRoute } from '../../utils/permissions';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const NAV_ICON_MAP = {
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

export const Navbar = () => {
  const { currentUser, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const userRole = currentUser?.role?.toUpperCase();

  // Dynamically generated navigation links strictly scoped to current user role
  const roleNavLinks = getRoleNavItems(userRole);
  const homeRedirectRoute = getDefaultRoleRoute(userRole);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      logout();
      setProfileDropdownOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to={currentUser ? homeRedirectRoute : '/'} className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-gradient-to-tr from-sport-600 to-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans truncate block">
                FIFA <span className="text-sport-500">ALL STARS</span>
              </span>
              <span className="block text-[8px] sm:text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest -mt-1 uppercase truncate">
                Footy Match Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links Generated Strictly from ROLE_OPERATIONS */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-1.5">
            {currentUser ? (
              roleNavLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                      active
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })
            ) : (
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive('/')
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Home
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            <ThemeToggle />

            {currentUser && <NotificationBell />}

            {currentUser ? (
              <>
                {/* Data Transparency & Role Badge */}
                <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  {userRole === 'SUPER_ADMIN' ? (
                    <span className="flex items-center space-x-1.5 text-amber-500 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>🛡️ Super Admin</span>
                    </span>
                  ) : userRole === 'CLUB_MANAGER' ? (
                    <span className="flex items-center space-x-1.5 text-sky-500 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                      <span>🏟️ Club Manager</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-emerald-500 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>⚽ Player</span>
                    </span>
                  )}
                </div>

                {/* Wallet Balance Badge for Players */}
                {userRole === 'PLAYER' && (
                  <Link to="/player/profile" className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all">
                    <Wallet className="w-3.5 h-3.5 text-amber-500" />
                    <span>₹{currentUser?.walletBalance?.toFixed(2)}</span>
                  </Link>
                )}

                {/* User Profile Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-1.5 focus:outline-none p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="sm" status="active" className="rounded-md" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs font-semibold space-y-1">
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="block font-black text-slate-900 dark:text-white truncate">{currentUser.name}</span>
                        <span className="text-[10px] text-slate-400 block font-semibold truncate">{currentUser.email}</span>
                        <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 uppercase">
                          <span>🔒 Data Transparency & RBAC Verified</span>
                        </div>
                      </div>

                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Active Role:</span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-200">{currentUser.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Session Status:</span>
                          <span className="font-extrabold text-emerald-500">AUTHENTICATED</span>
                        </div>
                        <p className="text-[9px] italic text-slate-400 pt-1">
                          Role switching is restricted inside dashboard for security. Log out to access other roles.
                        </p>
                      </div>

                      <Link
                        to={userRole === 'CLUB_MANAGER' ? '/club/profile' : (userRole === 'PLAYER' ? '/player/profile' : '/profile')}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
                      >
                        <User className="w-4 h-4 text-sport-500" />
                        <span>Profile & Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left flex items-center space-x-2.5 px-4 py-2.5 text-rose-500 hover:bg-rose-500/10 transition-colors font-black border-t border-slate-200 dark:border-slate-800 disabled:opacity-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isLoggingOut ? 'Logging out...' : 'Switch Role / Logout'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/register">
                  <button className="px-4 py-2 rounded-2xl text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    Register
                  </button>
                </Link>

                <Link to="/login">
                  <button className="px-5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase shadow-md shadow-rose-500/30 cursor-pointer">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

          </div>

          {/* Mobile menu button & quick action icons */}
          <div className="flex md:hidden items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <ThemeToggle />
            {currentUser && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 sm:p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Real Mobile App Side Drawer (Rendered via Portal on document.body) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[100] md:hidden">
              {/* Dimmed Blurred Backdrop with Click-to-Close */}
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
              />

              {/* Native Mobile Side Sheet (Slides smoothly in from right edge) */}
              <motion.div
                key="drawer-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed top-0 right-0 bottom-0 w-[84vw] max-w-[340px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex-shrink-0">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sport-600 to-emerald-400 flex items-center justify-center shadow-xs flex-shrink-0">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase truncate block">
                        FIFA <span className="text-sport-500">ALL STARS</span>
                      </span>
                      <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider -mt-0.5 uppercase truncate">
                        Menu
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <ThemeToggle />
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Close navigation menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Body - Scrollable content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentUser ? (
                    <>
                      {/* User Profile Card */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Avatar 
                            src={currentUser?.profileImageUrl || currentUser?.avatar} 
                            name={currentUser?.name} 
                            size="md" 
                            status="active" 
                          />
                          <div className="min-w-0">
                            <span className="block font-black text-xs text-slate-900 dark:text-white leading-tight truncate">
                              {currentUser.name}
                            </span>
                            <span className="text-[10px] text-emerald-500 font-extrabold uppercase">
                              ⚽ {currentUser.role}
                            </span>
                          </div>
                        </div>

                        {userRole === 'PLAYER' && (
                          <Link 
                            to="/player/profile" 
                            onClick={() => setMobileMenuOpen(false)} 
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono font-bold flex-shrink-0"
                          >
                            ₹{currentUser?.walletBalance?.toFixed(0) || '0'}
                          </Link>
                        )}
                      </div>

                      {/* Navigation Links with Icons */}
                      <div className="space-y-1">
                        {roleNavLinks.map((link) => {
                          const IconComp = NAV_ICON_MAP[link.icon] || Flame;
                          const active = isActive(link.path);
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                                active
                                  ? 'bg-sport-500 text-white shadow-sm font-black'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  active 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}>
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate">{link.label}</span>
                              </div>
                              {active ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Logout / Switch Role Button */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center space-x-2.5 uppercase transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                            <LogOut className="w-3.5 h-3.5" />
                          </div>
                          <span>{isLoggingOut ? 'Logging out...' : 'Logout / Switch Role'}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <Link
                          to="/"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                            isActive('/') 
                              ? 'bg-sport-500 text-white font-black' 
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-sport-500/10 text-sport-500 flex items-center justify-center flex-shrink-0">
                            <Flame className="w-3.5 h-3.5" />
                          </div>
                          <span>Home</span>
                        </Link>
                      </div>
                      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <Link 
                          to="/register" 
                          onClick={() => setMobileMenuOpen(false)} 
                          className="block w-full text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase text-slate-900 dark:text-white"
                        >
                          Register Account
                        </Link>
                        <Link 
                          to="/login" 
                          onClick={() => setMobileMenuOpen(false)} 
                          className="block w-full text-center py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold uppercase text-white shadow-md shadow-rose-500/30"
                        >
                          Sign In
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};

export default Navbar;
