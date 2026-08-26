import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Wallet, Menu, X, LogOut, User, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getRoleNavItems, getDefaultRoleRoute } from '../../utils/permissions';
import ThemeToggle from './ThemeToggle';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <>
                <Link to="/" className="px-3.5 py-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-sport-500">Home</Link>
                <Link to="/player/find-games" className="px-3.5 py-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-sport-500">Games</Link>
                <Link to="/player/courts" className="px-3.5 py-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-sport-500">Venues</Link>
                <Link to="/player/community" className="px-3.5 py-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-sport-500">Community</Link>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            
            <ThemeToggle />

            {currentUser ? (
              <>
                {/* Role Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => switchRole('PLAYER')}
                    className={`px-3 py-1 rounded-xl transition-all ${userRole === 'PLAYER' ? 'bg-sport-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Player
                  </button>
                  <button
                    onClick={() => switchRole('CLUB_MANAGER')}
                    className={`px-3 py-1 rounded-xl transition-all ${userRole === 'CLUB_MANAGER' ? 'bg-sport-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Manager
                  </button>
                  <button
                    onClick={() => switchRole('SUPER_ADMIN')}
                    className={`px-3 py-1 rounded-xl transition-all ${userRole === 'SUPER_ADMIN' ? 'bg-sport-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Admin
                  </button>
                </div>

                {/* Wallet Balance Badge for Players */}
                {userRole === 'PLAYER' && (
                  <Link to="/player/profile" className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black hover:bg-amber-500/20 transition-all">
                    <Wallet className="w-4 h-4 text-amber-500" />
                    <span>₹{currentUser?.walletBalance?.toFixed(2)}</span>
                  </Link>
                )}

                {/* User Profile Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-1.5 focus:outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="sm" status="active" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs font-bold">
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="block font-black text-slate-900 dark:text-white truncate">{currentUser.name}</span>
                        <span className="text-[10px] text-slate-400 block font-semibold truncate">@{currentUser.name?.toLowerCase()?.replace(/\s+/g, '')}</span>
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
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <button className="px-4 py-2 rounded-2xl text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    Register
                  </button>
                </Link>

                <Link to="/login">
                  <button className="px-5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase shadow-md shadow-rose-500/30">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
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
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 bg-white dark:bg-slate-900 transition-colors">
          {currentUser ? (
            <>
              {roleNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase text-slate-900 dark:text-white">
                Register
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 rounded-2xl bg-rose-500 text-xs font-black uppercase text-white shadow-md">
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
