import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Trophy, Shield, 
  Sparkles, CheckCircle2, UserPlus, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import communityPlayersImg from '../../assets/images/hero/community-players.jpg';
import { validateName, validateEmail, validatePassword, validatePhone, validateConfirmPassword, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerPlayer } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('Raipur');
  const [position, setPosition] = useState('Striker');
  const [bio, setBio] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleRegister = (e) => {
    e.preventDefault();
    if (isLoading || isSubmittingRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateName(name, 'Full Name'), field: 'name' },
      { check: () => validateEmail(email), field: 'email' },
      { check: () => validatePhone(phone), field: 'phone' },
      { check: () => validatePassword(password, 6), field: 'password' },
      { check: () => validateConfirmPassword(password, confirmPassword), field: 'confirmPassword' },
      { check: () => agreeTerms ? { isValid: true } : { isValid: false, message: 'Please accept the Terms of Service to continue.' }, field: 'agreeTerms' }
    ]);

    if (!isValid) return;

    isSubmittingRef.current = true;
    setIsLoading(true);

    setTimeout(() => {
      try {
        const res = registerPlayer({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          city,
          playingHand: `Right / ${position}`,
          bio: bio.trim() || `Casual ${position} player looking for pickup matches in ${city}.`
        });

        if (res.success) {
          navigate('/player/home', { replace: true });
        } else {
          toast.error(res.error || 'Registration failed. Please check your details.');
        }
      } catch (err) {
        logActionError('handleRegister', err);
        toast.error(getErrorMessage(err, 'registering player account'));
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          isSubmittingRef.current = false;
        }, 400);
      }
    }, 400);
  };

  return (
    <div className="space-y-12 py-4">
      
      {/* HERO & REGISTER SPLIT SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Community Photo & Benefits */}
        <div className="lg:col-span-5 rounded-xl overflow-hidden shadow-2xl relative min-h-[400px] lg:min-h-[600px] flex items-end group border border-slate-200 dark:border-slate-800">
          <img 
            src={communityPlayersImg} 
            alt="Football Players Community" 
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="relative z-10 p-6 sm:p-10 space-y-4 text-left text-white">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Player Portal</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
              Join FIFA All Stars Community
            </h2>

            <div className="space-y-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>₹1,000 Welcome Wallet Balance credited on signup</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Book pitch slots & join 5v5/7v7 pick-up matches</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Track your Elo ratings, scores & video highlights</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Registration Form */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-10 shadow-xl space-y-6">
            
            {/* Header */}
            <div className="space-y-1 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Create Player Account
                </h1>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                  ⚽ Player Registration
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Register as a Player to start booking turfs, joining matches & tracking Elo scores.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4 text-xs font-extrabold">
              
              {/* Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
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

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer"
                >
                  <option value="Raipur">Raipur</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Short Player Bio</label>
                <textarea
                  rows="2"
                  placeholder="Tell other players about your playing style..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  I agree to the <a href="#terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms of Service</a> & <a href="#privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
                icon={ArrowRight}
                className="w-full py-3.5 text-xs font-black uppercase tracking-wide"
              >
                Create Account & Enter Workspace
              </Button>

              {/* Link to Login */}
              <div className="text-center pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold">
                  Sign in to Workspace
                </Link>
              </div>

            </form>

          </div>
        </div>

      </section>

    </div>
  );
};

export default RegisterPage;
