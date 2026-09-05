import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Shield, Building2, Key, Mail, Lock, Eye, EyeOff, 
  Sparkles, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp, Star, Info, User, Phone, UserPlus
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getDefaultRoleRoute } from '../../utils/permissions';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import communityPlayersImg from '../../assets/images/hero/community-players.jpg';
import { validateName, validateEmail, validatePassword, validatePhone, validateNonEmpty, validateEmailOrPhone, validateConfirmPassword, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithCredentials, registerPlayer, resetPasswordWithToken } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState('PLAYER');
  const [email, setEmail] = useState('player@fifaallstars.com');
  const [password, setPassword] = useState('Player@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Concurrency & Multiple Submission Prevention Locks
  const isLoggingInRef = useRef(false);
  const isDemoLoadingRef = useRef(false);

  // Forgot Password / Reset Password States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'reset'
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Public Player Registration Form States
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Raipur');
  const [regPosition, setRegPosition] = useState('Striker');
  const [regBio, setRegBio] = useState('');


  // Pre-configured persona credentials for each role
  const rolePersonas = {
    PLAYER: {
      role: 'PLAYER',
      title: 'Player Workspace',
      user: 'Arjun Mehta',
      email: 'player@fifaallstars.com',
      pass: 'Player@123',
      badge: '⚽ Player Portal',
      description: 'Book pitch slots, join pickup games & view player ratings & stats.',
    },
    CLUB_MANAGER: {
      role: 'CLUB_MANAGER',
      title: 'Club Manager Hub',
      user: 'Rajesh Sharma',
      email: 'manager@fifaallstars.com',
      pass: 'Manager@123',
      badge: '🏟️ Club Manager',
      description: 'Manage turf schedules, peak rates & pitch bookings.',
    },
    SUPER_ADMIN: {
      role: 'SUPER_ADMIN',
      title: 'Super Admin Operations',
      user: 'Aaditya Verma (Owner)',
      email: 'superadmin@fifaallstars.com',
      pass: 'SuperAdmin@123',
      badge: '🛡️ Super Admin',
      description: 'Platform governance, user accounts & audit logs.',
    }
  };

  const currentPersona = rolePersonas[selectedRole];

  const handleRoleSelect = (roleKey) => {
    if (isLoading || isDemoLoading) return;
    setSelectedRole(roleKey);
    setEmail(rolePersonas[roleKey].email);
    setPassword(rolePersonas[roleKey].pass);
  };

  const handleLoginSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isLoading || isDemoLoading || isLoggingInRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateEmail(email), field: 'email' },
      { check: () => validatePassword(password, 1), field: 'password' }
    ]);

    if (!isValid) {
      triggerShake();
      return;
    }

    isLoggingInRef.current = true;
    setIsLoading(true);
    setTimeout(() => {
      try {
        const res = loginWithCredentials(email, password);
        if (res.success) {
          toast.success(`Authenticated as ${res.user.name} (${res.user.role})`);
          const targetRoute = getDefaultRoleRoute(res.user.role);
          navigate(targetRoute, { replace: true });
        } else {
          toast.error(res.error || 'Invalid email or password. Please verify and try again.');
          triggerShake();
        }
      } catch (err) {
        logActionError('handleLoginSubmit', err);
        toast.error(getErrorMessage(err, 'authenticating'));
        triggerShake();
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          isLoggingInRef.current = false;
        }, 400);
      }
    }, 400);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const handleQuickDemo = (roleKey) => {
    if (isLoading || isDemoLoading || isDemoLoadingRef.current) return;
    if (!checkNetworkOnline()) return;

    isDemoLoadingRef.current = true;
    setIsDemoLoading(true);
    handleRoleSelect(roleKey);
    const persona = rolePersonas[roleKey];
    toast.loading(`Authenticating as ${persona.user}...`, { id: 'demo-login' });

    setTimeout(() => {
      try {
        const res = loginWithCredentials(persona.email, persona.pass);
        if (res.success) {
          toast.success(`Welcome, ${res.user.name}!`, { id: 'demo-login' });
          const targetRoute = getDefaultRoleRoute(res.user.role);
          navigate(targetRoute, { replace: true });
        } else {
          toast.error(res.error || 'Demo authentication failed. Please try again.', { id: 'demo-login' });
          triggerShake();
        }
      } catch (err) {
        logActionError('handleQuickDemo', err);
        toast.error(getErrorMessage(err, 'authenticating demo session'), { id: 'demo-login' });
        triggerShake();
      } finally {
        setIsDemoLoading(false);
        setTimeout(() => {
          isDemoLoadingRef.current = false;
        }, 400);
      }
    }, 400);
  };

  const handleSocialClick = (provider) => {
    toast(`${provider} Sign-In is a visual UI element. Please use the Role tabs or Log In button to authenticate.`, {
      icon: 'ℹ️',
      style: { borderRadius: '16px', background: '#0f172a', color: '#fff', fontSize: '12px' }
    });
  };

  const handleSignUpClick = () => {
    navigate('/register');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (isRegLoading) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateName(regName, 'Full Name'), field: 'regName' },
      { check: () => validateEmail(regEmail), field: 'regEmail' },
      { check: () => validatePhone(regPhone), field: 'regPhone' },
      { check: () => validatePassword(regPassword, 6), field: 'regPassword' }
    ]);

    if (!isValid) return;

    setIsRegLoading(true);
    setTimeout(() => {
      try {
        const res = registerPlayer({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          city: regCity,
          playingHand: `Right / ${regPosition}`,
          bio: regBio.trim()
        });

        if (res.success) {
          setIsSignUpModalOpen(false);
          navigate('/player/home', { replace: true });
        } else {
          toast.error(res.error || 'Registration failed. Please check your details.');
        }
      } catch (err) {
        logActionError('handleRegisterSubmit', err);
        toast.error(getErrorMessage(err, 'registering player account'));
      } finally {
        setIsRegLoading(false);
      }
    }, 400);
  };

  const handleForgotPasswordClick = () => {
    setForgotInput(email || '');
    setResetStep('request');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsForgotModalOpen(true);
  };

  const handleForgotPasswordRequest = (e) => {
    e.preventDefault();
    if (isForgotLoading) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateEmailOrPhone(forgotInput), field: 'forgotInput' }
    ]);

    if (!isValid) return;

    setIsForgotLoading(true);
    setTimeout(() => {
      try {
        const cleanInput = forgotInput.trim().toLowerCase();
        const usersList = useAuthStore.getState().usersList || [];
        const found = usersList.find(u => 
          u.email?.toLowerCase() === cleanInput || 
          (u.phone && u.phone.replace(/[\s+-]/g, '') === cleanInput.replace(/[\s+-]/g, ''))
        );

        if (!found) {
          toast.error('No account registered with that email or mobile number.');
          return;
        }

        toast.success(`Verification code sent to ${forgotInput}. (Demo verification code is 123456)`);
        setResetStep('reset');
      } catch (err) {
        logActionError('handleForgotPasswordRequest', err);
        toast.error(getErrorMessage(err, 'requesting password reset'));
      } finally {
        setIsForgotLoading(false);
      }
    }, 400);
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (isResetLoading) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateNonEmpty(resetCode, 'Verification code'), field: 'resetCode' },
      { check: () => resetCode.trim() === '123456' ? { isValid: true } : { isValid: false, message: 'Invalid verification code. Please enter 123456.' }, field: 'resetCode' },
      { check: () => validatePassword(newPassword, 6), field: 'newPassword' },
      { check: () => validateConfirmPassword(newPassword, confirmNewPassword), field: 'confirmNewPassword' }
    ]);

    if (!isValid) return;

    setIsResetLoading(true);
    setTimeout(() => {
      try {
        const res = resetPasswordWithToken(forgotInput, newPassword);
        if (res && res.success) {
          toast.success('Password updated successfully! You can now log in with your new credentials.');
          setPassword(newPassword);
          if (validateEmail(forgotInput).isValid) {
            setEmail(forgotInput);
          }
          setIsForgotModalOpen(false);
        } else {
          toast.error(res?.error || 'Unable to reset password. Please try again.');
        }
      } catch (err) {
        logActionError('handleResetPasswordSubmit', err);
        toast.error(getErrorMessage(err, 'resetting password'));
      } finally {
        setIsResetLoading(false);
      }
    }, 400);
  };


  const handleConfirmationClick = () => {
    toast('Confirmation instructions is a visual UI element.', {
      icon: 'ℹ️',
      style: { borderRadius: '16px', background: '#0f172a', color: '#fff', fontSize: '12px' }
    });
  };

  const reviews = [
    {
      name: 'Mac',
      location: 'Manchester',
      text: 'I love playing football, so being able to pick and choose when to play is the best thing ever. If I could give 10 stars, I would.'
    },
    {
      name: 'Zinedine',
      location: 'Birmingham',
      text: "Without FIFA All Stars, I would've been depressed after moving to a new city and not playing football for a while as well as not having a group to play with."
    },
    {
      name: 'Gemma',
      location: 'London',
      text: 'I have actually turned into a bit of a football addict, trying to get 3 or 4 games in per week.'
    }
  ];

  const faqs = [
    {
      q: 'How does FIFA All Stars role-based access work?',
      a: 'To maintain full data transparency and security, role selection happens exclusively at the Login Portal. Users log in as a Player, Club Manager, or Super Admin and are granted isolated workspace permissions.'
    },
    {
      q: 'Can I switch roles while logged in inside the dashboard?',
      a: 'No. In accordance with strict RBAC security standards, role switching inside the dashboard is disabled. To change workspace roles, simply log out and sign in with the target role credentials.'
    },
    {
      q: 'How can I quickly test all 3 role perspectives?',
      a: 'You can click any of the 3 role tabs (Player, Club Manager, Super Admin) on this login screen and press "1-Click Instant Demo Login" to jump into that role workspace instantly!'
    }
  ];

  const indianCities = [
    { name: 'Raipur', pitches: ['Bernabeu Arena Turf (VIP Road)', 'Telibandha Futsal Dome', 'Magneto Sports Pitch'] },
    { name: 'Bangalore', pitches: ['Silicon Turf Hub (Indiranagar)', 'Koramangala 3G Pitch', 'HSR Layout Arena'] },
    { name: 'Mumbai', pitches: ['Marine Drive Sports Complex', 'Bandra Futsal Turf', 'Andheri Sports Hub'] },
    { name: 'Pune', pitches: ['Champions Turf Arena (FC Road)', 'Deccan Gymkhana Turf', 'Kothrud Futsal Park'] },
    { name: 'Delhi', pitches: ['Chhatarpur Turf Ground', 'Dwarka Sports Complex', 'Saket Futsal Arena'] }
  ];

  return (
    <div className="space-y-12 py-4">
      
      {/* 1. HERO SPLIT SCREEN (LIGHT & DARK MODE COMPATIBLE + 100% RESPONSIVE) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: High Quality Gentle Photo of Football Players */}
        <div className="lg:col-span-6 rounded-xl overflow-hidden shadow-2xl relative min-h-[380px] sm:min-h-[480px] lg:min-h-[580px] flex items-end group border border-slate-200 dark:border-slate-800">
          <img 
            src={communityPlayersImg} 
            alt="Football Players in Green Bibs" 
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          
          <div className="relative z-10 p-6 sm:p-10 space-y-2 text-left text-white">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Friendly Football Community</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Play Casual Football Anywhere
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 max-w-md leading-relaxed">
              Join thousands of football lovers. Book pitches, join 11v11 football matches, and feel the game energy with gentle, inclusive community vibes.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Login Form (Light & Dark Compatible) */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <motion.div
            animate={isShaking ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-10 shadow-xl space-y-6"
          >
            
            {/* Header & Role Selection Tabs (Data Transparency Enforced) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    FIFA <span className="text-sport-500">ALL STARS</span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Sign in to your role workspace portal
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                  🔒 Data Transparency
                </span>
              </div>

              {/* 3 Role Selection Pills */}
              <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('PLAYER')}
                  className={`py-2 px-1 sm:px-2 rounded-lg transition-all text-center truncate cursor-pointer ${
                    selectedRole === 'PLAYER' 
                      ? 'bg-emerald-500 text-white shadow-md font-black' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Player
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('CLUB_MANAGER')}
                  className={`py-2 px-1 sm:px-2 rounded-lg transition-all text-center truncate cursor-pointer ${
                    selectedRole === 'CLUB_MANAGER' 
                      ? 'bg-sky-500 text-white shadow-md font-black' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('SUPER_ADMIN')}
                  className={`py-2 px-1 sm:px-2 rounded-lg transition-all text-center truncate cursor-pointer ${
                    selectedRole === 'SUPER_ADMIN' 
                      ? 'bg-amber-500 text-white shadow-md font-black' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Super Admin
                </button>
              </div>
            </div>

            {/* Persona Auto-Fill Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block">
                  Persona: {currentPersona.user}
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{currentPersona.email}</span>
              </div>
              <button
                type="button"
                disabled={isLoading || isDemoLoading}
                onClick={() => handleQuickDemo(selectedRole)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 font-extrabold text-[11px] transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDemoLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="animate-spin text-xs">⏳</span> Authenticating...
                  </span>
                ) : (
                  '1-Click Demo Log In'
                )}
              </button>
            </div>

            {/* Main Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-extrabold">
              
              {/* Email Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <button 
                  type="button"
                  onClick={handleForgotPasswordClick} 
                  disabled={isLoading || isDemoLoading}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>

              {/* Log In Button */}
              <Button
                type="submit"
                variant="primary"
                onClick={handleLoginSubmit}
                isLoading={isLoading}
                disabled={isLoading || isDemoLoading}
                className="w-full py-3.5 text-xs font-black uppercase tracking-wide"
              >
                Log in & Launch Workspace
              </Button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400">
                  Or continue with
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  className="py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all text-slate-900 dark:text-white"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.67-.82 1.12-1.96.99-3.1-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.87-.99 2.98 1.07.08 2.16-.5 2.82-1.32z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Facebook')}
                  className="py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>

              {/* Helper Links */}
              <div className="text-center pt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer">
                    Sign up
                  </Link>
                </p>
                <p>
                  <button type="button" onClick={handleConfirmationClick} className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                    Didn't receive confirmation instructions?
                  </button>
                </p>
              </div>

              {/* Legal Terms Notice */}
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium leading-relaxed pt-2">
                By signing up for FIFA All Stars, you agree to our{' '}
                <a href="#terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a> and{' '}
                <a href="#privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>.
              </p>

            </form>

          </motion.div>
        </div>

      </section>

      {/* 2. AS FEATURED ON & COMMUNITY WELCOME SECTION */}
      <section className="footy-card p-8 sm:p-12 space-y-8 text-center sm:text-left">
        <div className="text-center space-y-4">
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase">AS FEATURED ON</span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="text-xl font-black tracking-tighter text-slate-900 dark:text-white border-2 border-current px-3 py-1">B B C</div>
            <div className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-white">The Telegraph</div>
            <div className="text-xl font-serif italic font-bold text-slate-900 dark:text-white">London Evening Standard</div>
            <div className="text-xl font-sans font-bold text-slate-900 dark:text-white">Manchester Evening News</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Welcome to FIFA All Stars
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
            We make playing casual football easy for thousands of football lovers around India. Our simple app gets you playing football on a pitch in your area faster than you can say tiki-taka. We pride ourselves in being the home of well organized games, dodgy bicycle kicks and last minute winners.
          </p>
        </div>
      </section>

      {/* 3. THE STATS NEVER LIE SECTION */}
      <section className="relative rounded-xl overflow-hidden bg-slate-950 p-8 sm:p-14 border border-slate-800 text-white text-center shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-10">The Stats Never Lie</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">285K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">REGISTERED PLAYERS</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">296K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">GAMES PLAYED</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">76K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">MAX SPOTS AVAILABLE</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">35K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">ACTIVE PLAYERS MONTHLY</span>
          </div>
        </div>
      </section>

      {/* 4. REVIEWS */}
      <section className="space-y-8 text-center">
        <div>
          <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">REVIEWS</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            What our community have to say about us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((rev, idx) => (
            <div key={idx} className="footy-card p-6 space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 space-x-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">"{rev.text}"</p>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{rev.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQS */}
      <section className="footy-card p-8 sm:p-12 space-y-6">
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Any questions? We got you.</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">Our FAQ section is a great place to start if you've got a question.</p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="footy-card p-4 rounded-2xl cursor-pointer" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{faq.q}</h4>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-rose-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. INDIAN CITIES DIRECTORY */}
      <section className="footy-card p-8 sm:p-12 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Your local football pitch across India</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Wherever you are in India, we have pitches close by across Raipur, Bangalore, Mumbai, Pune, and Delhi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          {indianCities.map((city, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm text-rose-500">Play football in {city.name}</h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                {city.pitches.map((p, i) => (
                  <li key={i} className="hover:text-rose-500 cursor-pointer flex items-center space-x-1.5">
                    <span>•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PUBLIC PLAYER REGISTRATION MODAL */}
      <Modal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} title="Create Player Account">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-bold">
          
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-1">
            <div className="flex items-center space-x-1.5 font-black text-xs">
              <UserPlus className="w-4 h-4" />
              <span>Public Player Registration</span>
            </div>
            <p className="text-[11px] font-semibold">
              Public accounts are automatically created with <strong>PLAYER</strong> permissions. Club Manager & Super Admin accounts are managed by Super Admins.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              name="regName"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                name="regEmail"
                type="email"
                placeholder="name@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                name="regPhone"
                type="tel"
                placeholder="+91 98765 43210"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Password *</label>
            <input
              name="regPassword"
              type="password"
              placeholder="••••••••"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">City</label>
            <select
              value={regCity}
              onChange={(e) => setRegCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              <option value="Raipur">Raipur</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Short Player Bio</label>
            <textarea
              rows="2"
              placeholder="Tell other players about your playing style..."
              value={regBio}
              onChange={(e) => setRegBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsSignUpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isRegLoading}
              disabled={isRegLoading}
            >
              Create Account & Enter Workspace
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. FORGOT / RESET PASSWORD MODAL */}
      <Modal 
        isOpen={isForgotModalOpen} 
        onClose={() => { if (!isForgotLoading && !isResetLoading) setIsForgotModalOpen(false); }} 
        title={resetStep === 'request' ? "Forgot Password" : "Reset Password"}
        maxWidth="max-w-md"
      >
        {resetStep === 'request' ? (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-4 text-xs font-bold">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 space-y-1">
              <p className="text-[11px] font-semibold">
                Enter your registered email address or mobile number. We will send a secure verification code to reset your password.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Email or Mobile Number *</label>
              <input
                name="forgotInput"
                type="text"
                placeholder="name@example.com or +91 9876543210"
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsForgotModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isForgotLoading}
                disabled={isForgotLoading}
              >
                Send Reset Code
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs font-bold">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-1">
              <p className="text-[11px] font-semibold">
                Verification code sent to <strong>{forgotInput}</strong>. Enter the code and your new password. (Demo verification code: <strong>123456</strong>)
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">6-Digit Verification Code *</label>
              <input
                name="resetCode"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono tracking-widest text-center text-base focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">New Password *</label>
              <input
                name="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Confirm New Password *</label>
              <input
                name="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setResetStep('request')}
                className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
              >
                Back to email entry
              </button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsForgotModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isResetLoading}
                  disabled={isResetLoading}
                >
                  Confirm & Reset Password
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default LoginPage;

