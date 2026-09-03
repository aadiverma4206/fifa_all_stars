import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ShieldCheck, ArrowRight, Key, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import RoleSelectButton from './RoleSelectButton';
import Button from '../common/Button';
import { validateEmail, validatePassword, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import toast from 'react-hot-toast';

export const LoginCard = () => {
  const { loginWithCredentials, currentUser } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'PLAYER');
  
  // Quick credentials prefill
  const demoAccounts = {
    PLAYER: { email: 'player@fifaallstars.com', pass: 'Player@123' },
    CLUB_MANAGER: { email: 'manager@fifaallstars.com', pass: 'Manager@123' },
    SUPER_ADMIN: { email: 'superadmin@fifaallstars.com', pass: 'SuperAdmin@123' }
  };

  const [email, setEmail] = useState(demoAccounts.PLAYER.email);
  const [password, setPassword] = useState(demoAccounts.PLAYER.pass);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const navigate = useNavigate();

  const handleSelectRole = (roleKey) => {
    if (isSubmitting || isSubmittingRef.current) return;
    setSelectedRole(roleKey);
    const demo = demoAccounts[roleKey];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.pass);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSubmittingRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateEmail(email), field: 'email' },
      { check: () => validatePassword(password, 1), field: 'password' }
    ]);

    if (!isValid) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = loginWithCredentials(email, password);
      if (result.success) {
        toast.success(`Logged in as ${result.user.name}`);
        const userRole = result.user.role.toUpperCase();
        if (userRole === 'CLUB_MANAGER') {
          navigate('/manager/dashboard');
        } else if (userRole === 'SUPER_ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/player/home');
        }
      } else {
        toast.error(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      logActionError('handleLogin', err);
      toast.error(getErrorMessage(err, 'logging in'));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 400);
    }
  };

  return (
    <div className="w-full max-w-md footy-card p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black tracking-wider text-slate-900 dark:text-white uppercase font-sans">
          FIFA <span className="text-sport-500">ALL STARS</span>
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Select target role to autofill credentials & enter workspace
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2.5">
          <RoleSelectButton
            role="PLAYER"
            title="Arjun Mehta (Player)"
            subtitle="player@fifaallstars.com • Player@123"
            icon={User}
            active={selectedRole === 'PLAYER'}
            onClick={() => handleSelectRole('PLAYER')}
          />
          <RoleSelectButton
            role="CLUB_MANAGER"
            title="Rajesh Sharma (Club Manager)"
            subtitle="manager@fifaallstars.com • Manager@123"
            icon={Building2}
            active={selectedRole === 'CLUB_MANAGER'}
            onClick={() => handleSelectRole('CLUB_MANAGER')}
          />
          <RoleSelectButton
            role="SUPER_ADMIN"
            title="Aaditya Verma (Super Admin)"
            subtitle="superadmin@fifaallstars.com • SuperAdmin@123"
            icon={ShieldCheck}
            active={selectedRole === 'SUPER_ADMIN'}
            onClick={() => handleSelectRole('SUPER_ADMIN')}
          />
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          icon={ArrowRight}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Authenticate & Enter Workspace
        </Button>
      </form>
    </div>
  );
};

export default LoginCard;
