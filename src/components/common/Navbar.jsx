import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Wallet, Menu, X, LogOut, User, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getRoleNavItems, getDefaultRoleRoute } from '../../utils/permissions';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { currentUser, switchRole, setCurrentUser } = useAuthStore();
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setProfileDropdownOpen(false);
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to={currentUser ? homeRedirectRoute : '/'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sport-600 to-emerald-400 flex items-center justify-center shadow-md shadow-sport-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-slate-900 dark:text-white uppercase font-sans">
                FIFA <span className="text-sport-500">ALL STARS</span>
              </span>
              <span className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest -mt-1 uppercase">
                Footy Match Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links Generated Strictly from ROLE_OPERATIONS */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {currentUser ? (
              roleNavLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase transition-all ${
                      active
                        ? 'bg-sport-500/10 text-sport-600 dark:text-sport-400 border border-sport-500/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })
            ) : (
              <Link to="/" className="px-3.5 py-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-sport-500">Home</Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            
            <ThemeToggle />

            {currentUser && <NotificationBell />}

            {currentUser ? (
              <>
                {/* Data Transparency & Role Badge - Access control starts strictly at Login */}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black">
                  {userRole === 'SUPER_ADMIN' ? (
                    <span className="flex items-center space-x-1.5 text-amber-500">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>🛡️ Super Admin</span>
                    </span>
                  ) : userRole === 'CLUB_MANAGER' ? (
                    <span className="flex items-center space-x-1.5 text-sky-500">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                      <span>🏟️ Club Manager</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-emerald-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>⚽ Player</span>
                    </span>
                  )}
                </div>

                {/* Wallet Balance Badge for Players */}
                {userRole === 'PLAYER' && (
                  <Link to="/player/profile" className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black hover:bg-amber-500/20 transition-all">
                    <Wallet className="w-4 h-4 text-amber-500" />
                    <span>₹{currentUser?.walletBalance?.toFixed(2)}</span>
                  </Link>
                )}

                {/* User Profile Dropdown Menu with Data Transparency */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-1.5 focus:outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="sm" status="active" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs font-bold space-y-1">
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
                        to={userRole === 'PLAYER' ? '/player/profile' : (userRole === 'CLUB_MANAGER' ? '/club/manage' : '/admin/dashboard')}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-sport-500" />
                        <span>Profile & Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2.5 px-4 py-2.5 text-rose-500 hover:bg-rose-500/10 transition-colors font-black border-t border-slate-200 dark:border-slate-800"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Switch Role / Logout</span>
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
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {currentUser && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-4 pb-6 space-y-4 bg-white dark:bg-slate-900 transition-colors shadow-2xl">
          {currentUser ? (
            <>
              {/* User Profile Card on Mobile */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="md" status="active" />
                  <div>
                    <span className="block font-black text-sm text-slate-900 dark:text-white leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-emerald-500 font-extrabold uppercase">⚽ {currentUser.role}</span>
                  </div>
                </div>

                {userRole === 'PLAYER' && (
                  <Link to="/player/profile" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black">
                    ₹{currentUser?.walletBalance?.toFixed(2)}
                  </Link>
                )}
              </div>

              {/* Mobile Role Nav Links */}
              <div className="space-y-1">
                {roleNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-500/10 flex items-center space-x-2 border-t border-slate-200 dark:border-slate-800 uppercase"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout / Switch Role</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-1">
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase text-slate-900 dark:text-white">
                Register Account
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-3 rounded-xl bg-rose-500 text-xs font-black uppercase text-white shadow-md">
                Sign In to Workspace
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
