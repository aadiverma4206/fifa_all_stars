import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ArrowRight, ArrowDownLeft, ArrowUpRight, ShieldCheck, 
  CreditCard, Smartphone, Building2, CheckCircle2, AlertCircle, 
  Sparkles, History, ChevronRight, Lock, RefreshCw, Zap,
  TrendingUp, TrendingDown, Clock, Check, Eye, EyeOff
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import { validatePositiveAmount, validateTopUpAmount } from '../../utils/validationUtils';
import { checkNetworkOnline } from '../../utils/errorUtils';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FootballKickLoader from '../../components/common/FootballKickLoader';
import toast from 'react-hot-toast';

const PRESET_AMOUNTS = [
  { val: '100', label: '₹100' },
  { val: '200', label: '₹200' },
  { val: '500', label: '₹500', popular: true },
  { val: '1000', label: '₹1,000' },
  { val: '2000', label: '₹2,000' },
  { val: '5000', label: '₹5,000' },
];

const PAYMENT_METHODS = [
  {
    id: 'UPI',
    name: 'UPI / QR Code',
    desc: 'GPay, PhonePe, Paytm, BHIM',
    icon: Smartphone,
    color: 'emerald'
  },
  {
    id: 'CARD',
    name: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
    color: 'sky'
  },
  {
    id: 'NET_BANKING',
    name: 'Net Banking',
    desc: 'HDFC, SBI, ICICI, Axis',
    icon: Building2,
    color: 'indigo'
  }
];

export const WalletPage = () => {
  const navigate = useNavigate();
  const { currentUser, updateWallet } = useAuthStore();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('player@upi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  // Card Payment States (100% correct interactive state)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name?.toUpperCase() || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'CREDIT' | 'DEBIT'
  const [lastAddedAmount, setLastAddedAmount] = useState(null);

  // Card network detection (Visa, Mastercard, RuPay, Amex)
  const getCardNetwork = (num = '') => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'bg-blue-600 text-white', label: 'VISA' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: 'bg-amber-600 text-white', label: 'MASTERCARD' };
    if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', color: 'bg-emerald-600 text-white', label: 'RuPay' };
    if (/^(34|37)/.test(clean)) return { name: 'Amex', color: 'bg-indigo-600 text-white', label: 'AMEX' };
    return { name: 'Card', color: 'bg-slate-700 text-slate-200', label: 'CARD' };
  };

  const handleCardNumberChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = rawVal.match(/.{1,4}/g)?.join(' ') || rawVal;
    setCardNumber(formatted);
  };

  const handleCardHolderChange = (e) => {
    const cleaned = e.target.value.replace(/[^a-zA-Z\s.]/g, '').toUpperCase();
    setCardHolder(cleaned);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      const month = parseInt(val.slice(0, 2), 10);
      let validMonth = val.slice(0, 2);
      if (month > 12) validMonth = '12';
      if (month === 0 && val.length === 2) validMonth = '01';
      val = validMonth + (val.length > 2 ? '/' + val.slice(2) : '/');
    }
    setCardExpiry(val);
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
  };

  const fillDemoCard = () => {
    setCardNumber('4532 8920 1234 8821');
    setCardHolder(currentUser?.name?.toUpperCase() || 'ALEX HUNTER');
    setCardExpiry('08/29');
    setCardCvv('789');
    toast.success('💳 Demo Visa Card loaded for testing!');
  };

  const currentBalance = currentUser?.walletBalance || 0;
  const paymentHistory = currentUser?.paymentHistory || [];
  const MAX_WALLET_CAP = 200000; // 2 Lakh INR Max Cap
  const remainingCapacity = Math.max(0, MAX_WALLET_CAP - currentBalance);

  // Derived stats
  const totalCredited = paymentHistory
    .filter(t => t.type === 'WALLET_TOPUP' || (t.amount && t.amount > 0 && t.type !== 'PAYMENT'))
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalSpent = paymentHistory
    .filter(t => t.type === 'PAYMENT' || (t.amount && t.amount > 0 && t.type === 'PAYMENT'))
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // Filter transaction history
  const filteredHistory = paymentHistory.filter((item) => {
    const isCredit = item.type === 'WALLET_TOPUP' || (item.amount && item.amount > 0 && item.type !== 'PAYMENT');
    if (historyFilter === 'CREDIT') return isCredit;
    if (historyFilter === 'DEBIT') return !isCredit;
    return true;
  }).reverse(); // Most recent first

  const handleAmountChange = (e) => {
    let val = e.target.value;
    if (val === '') {
      setAmount('');
      return;
    }
    // Clean string to only numbers and decimal
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      val = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    const num = parseFloat(val);
    if (!isNaN(num) && num > 50000) {
      setAmount('50000');
      toast.error('Amount cannot cross ₹50,000! Set to maximum ₹50,000.', { id: 'max-amount-warning' });
      return;
    }
    setAmount(val);
  };

  const handlePresetSelect = (val) => {
    const num = parseFloat(val);
    if (num > 50000) {
      setAmount('50000');
      toast.error('Amount cannot cross ₹50,000! Set to maximum ₹50,000.', { id: 'max-amount-warning' });
      return;
    }
    setAmount(val);
  };

  const handleInitiatePay = (e) => {
    if (e) e.preventDefault();
    if (isProcessing) return;

    if (!checkNetworkOnline()) return;

    const validation = validateTopUpAmount(amount, currentBalance, MAX_WALLET_CAP);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    const numVal = parseFloat(amount);
    if (isNaN(numVal) || numVal < 1) {
      toast.error('Minimum top-up amount is ₹1.');
      return;
    }
    if (numVal > 50000) {
      toast.error('Amount cannot cross ₹50,000! Maximum top-up limit is ₹50,000 per transaction.');
      return;
    }
    if (currentBalance >= MAX_WALLET_CAP) {
      toast.error('Your wallet is already at the maximum limit of ₹2,00,000. You cannot add more funds.');
      return;
    }
    if (currentBalance + numVal > MAX_WALLET_CAP) {
      toast.error(`Wallet cap reached! Maximum allowed balance is ₹2,00,000. You can only add up to ₹${remainingCapacity.toLocaleString('en-IN')}.`);
      return;
    }

    // Card-Specific Interactive Validations
    if (paymentMethod === 'CARD') {
      const rawNum = cardNumber.replace(/\D/g, '');
      if (rawNum.length < 15) {
        toast.error('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardHolder.trim()) {
        toast.error('Please enter the cardholder name.');
        return;
      }
      const rawExp = cardExpiry.replace(/\D/g, '');
      if (rawExp.length < 4) {
        toast.error('Please enter a valid expiry date (MM/YY).');
        return;
      }
      const expMonth = parseInt(cardExpiry.slice(0, 2), 10);
      const expYear = parseInt('20' + cardExpiry.slice(3, 5), 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (expMonth < 1 || expMonth > 12) {
        toast.error('Expiry month must be between 01 and 12.');
        return;
      }
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        toast.error('Card is expired. Please enter an active card.');
        return;
      }
      if (cardCvv.length < 3) {
        toast.error('Please enter a valid 3 or 4-digit CVV code.');
        return;
      }
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (isProcessing) return;
    if (!checkNetworkOnline()) return;

    const numVal = parseFloat(amount);
    if (isNaN(numVal) || numVal < 1) {
      toast.error('Minimum top-up amount is ₹1.');
      return;
    }
    if (numVal > 50000) {
      toast.error('Amount cannot cross ₹50,000! Maximum top-up limit is ₹50,000 per transaction.');
      return;
    }
    if (currentBalance + numVal > MAX_WALLET_CAP) {
      toast.error(`Wallet limit reached! Maximum allowed balance is ₹2,00,000.`);
      return;
    }
    setIsProcessing(true);

    try {
      // Simulate real-time payment gateway handshake with football animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const rawNum = cardNumber.replace(/\D/g, '');
      const last4 = rawNum.slice(-4) || '8821';
      const cardNet = getCardNetwork(cardNumber).name;

      const methodLabel = 
        paymentMethod === 'UPI' ? `UPI (${upiId || 'Direct UPI'})` :
        paymentMethod === 'CARD' ? `Card (${cardNet} •••• ${last4})` :
        `Net Banking (${selectedBank})`;

      updateWallet(numVal, `Wallet Reload: Added via ${methodLabel}`);

      setLastAddedAmount(numVal);
      toast.success(`🎉 Payment of ₹${numVal.toLocaleString('en-IN')} successful! Wallet updated.`);
      
      setIsConfirmModalOpen(false);
      // Erase the amount input so user sees clean empty input and knows payment succeeded
      setAmount('');
    } catch (err) {
      toast.error('Payment failed. Please check your credentials or network.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      
      {/* 1. BREADCRUMBS & HEADER (MOBILE/TABLET RESPONSIVE) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-400">
            <Link to="/player/home" className="hover:text-sport-500 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/player/profile" className="hover:text-sport-500 transition-colors">Profile</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold truncate">Wallet &amp; Add Money</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 sm:gap-2.5">
            <span className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span className="truncate">Player Wallet &amp; Funds</span>
          </h1>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto w-full sm:w-auto">
          <Link
            to="/player/profile"
            className="flex-1 sm:flex-initial text-center px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            View Profile
          </Link>
          <Link
            to="/player/find-games"
            className="flex-1 sm:flex-initial text-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sport-500 hover:bg-sport-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Join Games</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* 2. SUCCESS NOTIFICATION BANNER (Responsive Dismissible Banner) */}
      <AnimatePresence>
        {lastAddedAmount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black flex-shrink-0 text-xs">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase">Funds Added Successfully!</p>
                <p className="text-[11px] sm:text-xs font-semibold opacity-90 break-words">
                  ₹{lastAddedAmount.toFixed(2)} credited. Your new balance is ₹{currentBalance.toFixed(2)}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLastAddedAmount(null)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex-shrink-0 pt-0.5 sm:pt-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT GRID (RESPONSIVE FOR MOBILE, TABLET & DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* LEFT COLUMN: BALANCE CARD & ADD MONEY FORM (7 Cols on desktop, full on tablet/mobile) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          
          {/* BALANCE CARD (GOLD & NEON ACCENT, SLEEK & COMPACT ON MOBILE) */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 p-3.5 sm:p-5 md:p-6 text-white shadow-xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 sm:w-44 h-28 sm:h-44 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-28 sm:w-44 h-28 sm:h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2.5 sm:space-y-3.5">
              {/* Top Row: Badge & ID */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span>Verified Player Wallet</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                    Max: ₹2,00,000
                  </span>
                </div>
                <span className="text-[9px] sm:text-xs font-mono font-bold text-slate-400 truncate">
                  ID: WAL-{currentUser?.id || '8839'}
                </span>
              </div>

              {/* Middle Row: Available Balance + Inline Stats */}
              <div className="flex flex-col xs:flex-row xs:items-end justify-between gap-2 pt-0.5">
                <div>
                  <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block leading-tight">
                    Available Balance
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl sm:text-3xl md:text-4xl font-black text-amber-400 font-mono tracking-tight break-all">
                      ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex-shrink-0">
                      Active
                    </span>
                  </div>
                </div>

                {/* Compact Stats Pills */}
                <div className="flex items-center gap-1.5 self-start xs:self-auto">
                  <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-left xs:text-right">
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold block leading-tight flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5 text-emerald-400 inline" /> Added
                    </span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-emerald-400">
                      ₹{totalCredited.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-left xs:text-right">
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold block leading-tight flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5 text-rose-400 inline" /> Spent
                    </span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-rose-400">
                      ₹{totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Security & Player */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] sm:text-xs text-slate-400 gap-1.5">
                <div className="flex items-center space-x-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">100% Secure Gateway</span>
                </div>
                <div className="font-semibold text-slate-300 truncate max-w-[150px] sm:max-w-none text-right">
                  Player: <strong className="text-white">{currentUser?.name}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ADD MONEY FORM CARD (RESPONSIVE COMPACT INPUTS) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 md:p-6 shadow-sm space-y-3.5 sm:space-y-5">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800/80 pb-2.5 sm:pb-3">
              <div>
                <h2 className="text-xs sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Enter Amount to Add
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Instant top-up with zero convenience fees.
                </p>
              </div>
              <span className="self-start xs:self-auto text-[9px] sm:text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-emerald-500/20">
                0% Fee
              </span>
            </div>

            <form onSubmit={handleInitiatePay} className="space-y-3.5 sm:space-y-5">
              
              {/* Amount Input */}
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-[11px] sm:text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-base sm:text-xl font-black text-amber-500 pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    maxLength={8}
                    step="any"
                    value={amount}
                    onChange={handleAmountChange}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                    placeholder="Enter amount (e.g. 1, 99, 500)"
                    disabled={currentBalance >= MAX_WALLET_CAP}
                    className={`w-full pl-8 sm:pl-10 pr-3.5 py-2.5 sm:py-3.5 rounded-xl border-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-black text-base sm:text-xl font-mono focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      amount && (parseFloat(amount) < 1 || parseFloat(amount) > 50000 || (currentBalance + parseFloat(amount)) > MAX_WALLET_CAP)
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900'
                    }`}
                    required
                  />
                </div>
                
                {/* Real-time Validation / Limits Hint */}
                {currentBalance >= MAX_WALLET_CAP ? (
                  <p className="text-[10px] sm:text-[11px] text-rose-500 font-bold flex items-center gap-1">
                    <span>⚠️ Wallet limit reached! Your wallet already has ₹2,00,000 (Maximum Cap).</span>
                  </p>
                ) : amount && parseFloat(amount) > 50000 ? (
                  <p className="text-[10px] sm:text-[11px] text-rose-500 font-bold flex items-center gap-1">
                    <span>⚠️ Amount cannot cross ₹50,000! Maximum top-up limit is ₹50,000 per transaction.</span>
                  </p>
                ) : amount && (currentBalance + parseFloat(amount)) > MAX_WALLET_CAP ? (
                  <p className="text-[10px] sm:text-[11px] text-rose-500 font-bold flex items-center gap-1">
                    <span>⚠️ Exceeds ₹2,00,000 limit! Max you can add right now is ₹{remainingCapacity.toLocaleString('en-IN')}.</span>
                  </p>
                ) : amount && parseFloat(amount) < 1 ? (
                  <p className="text-[10px] sm:text-[11px] text-rose-500 font-bold flex items-center gap-1">
                    <span>⚠️ Minimum top-up amount is ₹1.</span>
                  </p>
                ) : (
                  <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-slate-400 font-semibold">
                    <span>Min ₹1 • Max ₹50,000 per transaction</span>
                    <span className="text-amber-500 font-bold">Max Wallet: ₹2,00,000</span>
                  </div>
                )}
              </div>

              {/* Preset Amount Chips (Responsive 3 cols on mobile, 6 on desktop) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                  Quick Select Preset:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                  {PRESET_AMOUNTS.map((preset) => {
                    const isSelected = amount === preset.val;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => handlePresetSelect(preset.val)}
                        className={`relative py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs font-black transition-all cursor-pointer border select-none ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black scale-[1.02]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                        {preset.popular && (
                          <span className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[7px] sm:text-[8px] font-black px-1 rounded-full uppercase leading-tight">
                            Hot
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector (Responsive Cards) */}
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 sm:p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-sport-500 bg-sport-500/5 dark:bg-sport-500/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-2.5 mb-1">
                          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                            isSelected ? 'bg-sport-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {method.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {method.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-form based on method */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  {paymentMethod === 'UPI' && (
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Enter UPI Virtual Address (VPA)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
                      />
                    </div>
                  )}

                  {paymentMethod === 'CARD' && (
                    <div className="space-y-3 pt-1">
                      {/* Header with Card Information & Quick Demo Fill */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-sky-500" />
                          <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">
                            Card Information
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={fillDemoCard}
                          className="text-[10px] font-bold text-sport-600 dark:text-sport-400 hover:text-sport-500 flex items-center gap-1 bg-sport-500/10 dark:bg-sport-500/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Fill Demo Card</span>
                        </button>
                      </div>

                      {/* 1. Card Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase">
                            Card Number
                          </label>
                          {cardNumber.replace(/\D/g, '').length > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${getCardNetwork(cardNumber).color}`}>
                              {getCardNetwork(cardNumber).label}
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4532 8920 1234 8821"
                            maxLength={19}
                            className="w-full pl-3.5 pr-10 py-2 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 tracking-wider"
                          />
                          <div className="absolute right-3 pointer-events-none text-slate-400">
                            <CreditCard className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* 2. Cardholder Name */}
                      <div>
                        <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={handleCardHolderChange}
                          placeholder="NAME AS SHOWN ON CARD"
                          className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 uppercase tracking-wide"
                        />
                      </div>

                      {/* 3. Expiry Date & CVV */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                            Expiry Date (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 text-center tracking-widest"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                            CVV / CVC
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type={showCvv ? "text" : "password"}
                              value={cardCvv}
                              onChange={handleCvvChange}
                              placeholder="•••"
                              maxLength={4}
                              className="w-full pl-3 pr-8 py-2 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 text-center tracking-widest"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCvv(!showCvv)}
                              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title={showCvv ? "Hide CVV" : "Show CVV"}
                            >
                              {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Security Trust Note */}
                      <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-slate-400 font-medium">
                        <Lock className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span>256-bit SSL encrypted • Supports Visa, Mastercard, RuPay</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'NET_BANKING' && (
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase mb-1">
                        Select Your Bank
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 cursor-pointer"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Summary & Pay Button */}
              <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Adding to Wallet:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-black text-xs sm:text-sm">
                    ₹{Math.min(50000, Math.max(0, parseFloat(amount || 0) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Processing Fee:</span>
                  <span className="text-emerald-500 font-bold">₹0.00 (Free)</span>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  icon={Lock}
                  rainbowBorder={false}
                  disabled={
                    isProcessing || 
                    !amount || 
                    parseFloat(amount) < 1 || 
                    parseFloat(amount) > 50000 || 
                    (currentBalance + parseFloat(amount)) > MAX_WALLET_CAP ||
                    currentBalance >= MAX_WALLET_CAP
                  }
                  className="w-full font-black text-xs sm:text-sm uppercase py-3 sm:py-3.5 rounded-xl shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay ₹{Math.min(50000, Math.max(0, parseFloat(amount || 0) || 0)).toLocaleString('en-IN')} &amp; Add to Wallet
                </Button>

                <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 text-[10px] text-slate-400 font-bold pt-1 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">Instant balance credit • 256-bit secure simulation</span>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: WALLET PERKS & RECENT TRANSACTIONS (5 Cols on desktop, full on tablet/mobile) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* WALLET PERKS CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Why Keep Money in Your Wallet?</span>
            </h3>

            <div className="space-y-2 sm:space-y-2.5 text-xs">
              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-base sm:text-lg flex-shrink-0">⚡</span>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-white">Instant Match Entry</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Join pick-up football games and tournaments instantly without bank redirects or OTP delays.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-base sm:text-lg flex-shrink-0">🛡️</span>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-white">Instant Refund Guarantee</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    If a match is cancelled by the host or bad weather, fee is immediately refunded to your wallet.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-base sm:text-lg flex-shrink-0">🏟️</span>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-white">One-Click Turf Booking</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Reserve football pitches in Raipur, Mumbai, and Bangalore in 3 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT WALLET TRANSACTIONS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Wallet History
                </h3>
              </div>

              {/* Filter Tabs (Touch Friendly) */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold self-start xs:self-auto">
                {['ALL', 'CREDIT', 'DEBIT'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setHistoryFilter(tab)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      historyFilter === tab
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction List (Responsive rows with overflow prevention) */}
            <div className="space-y-2 max-h-[350px] sm:max-h-96 overflow-y-auto pr-0.5 sm:pr-1">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((tx, idx) => {
                  const isCredit = tx.type === 'WALLET_TOPUP' || (tx.amount && tx.amount > 0 && tx.type !== 'PAYMENT');
                  return (
                    <div
                      key={tx.id || idx}
                      className="p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-2 sm:gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCredit 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-black text-slate-900 dark:text-white block truncate text-[11px] sm:text-xs">
                            {tx.description || (isCredit ? 'Wallet Top-Up' : 'Game Fee Payment')}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold block">
                            {tx.date || getTodayDate(0)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-1">
                        <span className={`font-mono font-black text-[11px] sm:text-xs ${
                          isCredit ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {isCredit ? `+₹${Math.abs(tx.amount).toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                        </span>
                        <Badge variant="emerald" size="sm" className="block text-[8px] sm:text-[9px] mt-0.5 rounded px-1 py-0">
                          {tx.status || 'SUCCESS'}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 sm:p-8 text-center text-slate-400 text-xs font-semibold">
                  <Wallet className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2 opacity-50" />
                  <p>No {historyFilter.toLowerCase()} transactions found.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ═══ CONFIRM PAYMENT MODAL ═══ */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !isProcessing && setIsConfirmModalOpen(false)}
        title={isProcessing ? "Processing Payment..." : "Confirm Payment"}
        maxWidth="max-w-md"
      >
        {isProcessing ? (
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center space-y-4 text-center">
            {/* The Football Kick & Juggling Animation */}
            <FootballKickLoader size="lg" />
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Processing Secure Top-Up
              </h4>
              <p className="text-base text-amber-500 font-black font-mono">
                ₹{Math.min(50000, Math.max(0, parseFloat(amount || 0) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 font-semibold animate-pulse">
                Connecting to payment gateway... Please wait.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center pb-0.5 sm:pb-1">
              {/* Circular Amber Icon Badge matching reference format */}
              <div className="w-16 h-16 rounded-full border-[1.5px] border-[#e07a5f] bg-[#fffaf8] dark:bg-[#e07a5f]/10 flex items-center justify-center mx-auto mb-3.5">
                <span className="text-[#e07a5f] text-3xl font-light leading-none select-none">!</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-100 tracking-normal mb-1 font-sans">
                Do you want to Proceed ?
              </h4>
              <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 leading-relaxed max-w-[310px] mx-auto">
                You are about to add ₹{Math.min(50000, Math.max(0, parseFloat(amount || 0) || 0)).toLocaleString('en-IN')} to your wallet balance.
              </p>
            </div>

            {/* Breakdown Card */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] sm:text-xs">Amount to Pay</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  ₹{Math.min(50000, Math.max(0, parseFloat(amount || 0) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] sm:text-xs">Payment Method</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-right text-[11px] sm:text-xs">
                  {paymentMethod === 'UPI' ? `UPI (${upiId || 'Direct UPI'})` :
                   paymentMethod === 'CARD' ? `Card (${getCardNetwork(cardNumber).name} •••• ${cardNumber.replace(/\D/g, '').slice(-4) || '8821'})` :
                   `Net Banking (${selectedBank})`}
                </span>
              </div>

              {paymentMethod === 'CARD' && cardHolder && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] sm:text-xs">Cardholder</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 uppercase truncate text-right text-[11px] sm:text-xs">
                    {cardHolder}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] sm:text-xs">Processing Fee</span>
                <span className="font-bold text-emerald-500 text-[11px] sm:text-xs">₹0.00 (100% Free)</span>
              </div>

              <div className="border-t border-slate-200/80 dark:border-slate-800 my-1" />

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] sm:text-xs">Current Balance</span>
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  ₹{(currentUser?.walletBalance || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-amber-600 dark:text-amber-400">
                <span className="font-black text-[11px] sm:text-xs">Balance After Top-Up</span>
                <span className="font-mono font-black text-xs sm:text-sm">
                  ₹{((currentUser?.walletBalance || 0) + (parseFloat(amount) || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons matching reference styling */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="flex-1 py-2 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm text-white bg-[#2b90d9] hover:bg-[#2380c2] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Yes, Proceed
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm text-white bg-[#d9534f] hover:bg-[#c9302c] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default WalletPage;
