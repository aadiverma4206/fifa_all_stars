import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Wallet, Trophy, Shield, RotateCcw, Plus, Globe, Bell,
  Eye, Lock, Edit3, Film, Calendar, CheckCircle, Building2,
  MapPin, Sparkles, Star, Sliders, DollarSign, Flame, ChevronRight,
  CheckCircle2, Clock, Phone, Mail, Award
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { getTodayDate } from '../../utils/dateUtils';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { validateName, validatePhone, validateLength, validatePositiveAmount, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import { validateFile, readFileAsDataUrl, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, DEFAULT_MAX_AVATAR_SIZE, formatFileSize } from '../../utils/fileValidationUtils';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { currentUser, updateWallet, updateProfile } = useAuthStore();
  const { bookings, games, gameVideos, cancelBooking, clubs, courts } = useDataStore();

  const isManager = currentUser?.role === 'CLUB_MANAGER';
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id) || c.managerId === currentUser?.id) || clubs[0];
  const myCourts = courts?.filter(c => c.clubId === myClub?.id) || [];
  const clubBookings = bookings?.filter(b => b.clubId === myClub?.id) || [];

  const [topUpAmount, setTopUpAmount] = useState('500');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState(isManager ? 'created' : 'joined');
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Loading & Concurrency Locks
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Form edit states
  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || 'Raipur');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [playingHand, setPlayingHand] = useState(currentUser?.playingHand || (isManager ? 'Venue Operations Director' : 'Right / Striker'));
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Avatar Upload States
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.profileImageUrl || currentUser?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const avatarInputRef = useRef(null);

  const handleAvatarFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setAvatarFile(null);
      return;
    }
    const file = files[0];
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
      maxSizeBytes: DEFAULT_MAX_AVATAR_SIZE,
      fileCategoryName: 'profile photo'
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file, (percent) => {
        setAvatarUploadProgress(percent);
      });
      setAvatarFile(file);
      setAvatarPreview(dataUrl);
      toast.success(`Photo "${file.name}" ready (${formatFileSize(file.size)})`);
    } catch (err) {
      toast.error(err.message || 'Failed to process selected image.');
    }
  };

  // User Football Match Record
  const userWins = currentUser?.stats?.wins || 19;
  const userLosses = currentUser?.stats?.losses || 5;
  const userBookings = bookings.filter(b => b.userId === currentUser?.id || b.userName === currentUser?.name);

  // Filtered Datasets
  const createdGames = games.filter(g => 
    g.organizer?.id === currentUser?.id || (isManager && g.venueReference?.clubId === myClub?.id)
  );
  const joinedGames = games.filter(g => g.confirmedPlayers?.some(p => p.id === currentUser?.id));
  const completedMatches = games.filter(g => 
    (g.status === 'COMPLETED' || (g.score && g.score.teamA !== null)) && 
    (g.confirmedPlayers?.some(p => p.id === currentUser?.id) || g.organizer?.id === currentUser?.id || (isManager && g.venueReference?.clubId === myClub?.id))
  );
  const myVideos = gameVideos.filter(v => {
    const targetGame = games.find(g => g.id === v.gameId);
    return targetGame?.confirmedPlayers?.some(p => p.id === currentUser?.id) || 
           targetGame?.organizer?.id === currentUser?.id ||
           (isManager && targetGame?.venueReference?.clubId === myClub?.id) ||
           v.uploadedBy?.includes(currentUser?.name);
  });

  const totalVenueSlotRevenue = clubBookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (parseFloat(b.amountPaid) || 0), 0);

  const isToppingUpRef = useRef(false);
  const isSavingProfileRef = useRef(false);
  const isCancellingBookingRef = useRef(false);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (isToppingUp || isToppingUpRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validatePositiveAmount(topUpAmount, 'Top-Up Amount', false), field: 'topUpAmount' },
      { check: () => parseFloat(topUpAmount) < 10 ? { isValid: false, message: 'Minimum top-up amount is ₹10.' } : { isValid: true }, field: 'topUpAmount' },
      { check: () => parseFloat(topUpAmount) > 50000 ? { isValid: false, message: 'Maximum top-up amount is ₹50,000 per transaction.' } : { isValid: true }, field: 'topUpAmount' }
    ]);

    if (!isValid) return;

    const val = parseFloat(topUpAmount);

    isToppingUpRef.current = true;
    setIsToppingUp(true);
    try {
      updateWallet(val, 'Top-Up: Manual wallet reload');
      toast.success(`Top-up successful! Added ₹${val.toFixed(2)} to wallet.`);
      setIsTopUpModalOpen(false);
    } catch (err) {
      logActionError('handleTopUp', err);
      toast.error(getErrorMessage(err, 'processing wallet top-up'));
    } finally {
      setIsToppingUp(false);
      setTimeout(() => {
        isToppingUpRef.current = false;
      }, 400);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSavingProfile || isSavingProfileRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateName(name, 'Full Name'), field: 'name' },
      { check: () => validatePhone(phone), field: 'phone' },
      { check: () => validateLength(bio, 0, 300, 'Bio'), field: 'bio' }
    ]);

    if (!isValid) return;

    // Detect whether anything actually changed
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedBio = bio.trim();
    const trimmedHand = playingHand.trim();
    const hasChanges =
      trimmedName !== (currentUser?.name || '').trim() ||
      trimmedPhone !== (currentUser?.phone || '').trim() ||
      city !== (currentUser?.city || '') ||
      trimmedBio !== (currentUser?.bio || '').trim() ||
      trimmedHand !== (currentUser?.playingHand || '').trim() ||
      !!avatarFile;

    if (!hasChanges) {
      toast('No changes detected in your profile.', { icon: 'ℹ️' });
      setIsEditProfileModalOpen(false);
      return;
    }

    isSavingProfileRef.current = true;
    setIsSavingProfile(true);
    try {
      updateProfile({
        name: trimmedName,
        city,
        bio: trimmedBio,
        playingHand: trimmedHand,
        phone: trimmedPhone,
        ...(avatarPreview ? { profileImageUrl: avatarPreview, avatar: avatarPreview } : {})
      });
      toast.success('Profile updated successfully!');
      setIsEditProfileModalOpen(false);
      setAvatarFile(null);
    } catch (err) {
      logActionError('handleSaveProfile', err);
      toast.error(getErrorMessage(err, 'updating profile'));
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => {
        isSavingProfileRef.current = false;
      }, 400);
    }
  };

  const handleCancelReservation = async () => {
    if (!bookingToCancel || cancellingBookingId || isCancellingBookingRef.current) return;

    if (!checkNetworkOnline()) return;

    const bookingId = bookingToCancel.id;
    isCancellingBookingRef.current = true;
    setCancellingBookingId(bookingId);
    try {
      cancelBooking(bookingId, 'User requested refund via Profile');
      toast.success('Reservation cancelled. Refund request sent!');
      setBookingToCancel(null);
    } catch (err) {
      logActionError('handleCancelReservation', err);
      toast.error(getErrorMessage(err, 'cancelling reservation'));
    } finally {
      setCancellingBookingId(null);
      setTimeout(() => {
        isCancellingBookingRef.current = false;
      }, 400);
    }
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-[1700px] w-full mx-auto px-3 sm:px-8 lg:px-10 overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════
          1. PROFILE HERO HEADER CARD
         ═══════════════════════════════════════════ */}
      <div className="admin-card p-4 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 w-full lg:w-auto">
          <Avatar 
            src={currentUser?.profileImageUrl || currentUser?.avatar} 
            name={currentUser?.name} 
            size="xl" 
            status="active" 
            className="rounded-2xl w-20 h-20 sm:w-24 sm:h-24 shadow-md" 
          />
          
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {currentUser?.name}
              </h1>
              
              {isManager ? (
                <Badge variant="emerald" size="sm" className="rounded-md font-black">
                  🏟️ CLUB MANAGER
                </Badge>
              ) : (
                <Badge variant="blue" size="sm" className="rounded-md font-black">
                  ⚽ PLAYER
                </Badge>
              )}

              <Badge variant="gold" size="sm" className="rounded-md font-bold">
                {currentUser?.city || 'Raipur'}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold break-words">
              @{currentUser?.name?.toLowerCase()?.replace(/\s+/g, '')} • {currentUser?.phone || '+91 98765 43210'} • {currentUser?.email || 'manager@turf.com'}
            </p>

            {isManager ? (
              <p className="text-xs text-sport-600 dark:text-sport-400 font-bold flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-4 h-4 text-sport-500 flex-shrink-0" />
                <span>Venue Director at <strong>{myClub?.name || 'Bernabeu Arena Turf'}</strong></span>
              </p>
            ) : currentUser?.bio ? (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-xl italic">
                "{currentUser?.bio}"
              </p>
            ) : null}

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {isManager ? (
                <>
                  <span className="px-3 py-1 rounded-lg bg-sport-500/10 text-sport-600 dark:text-sport-400 border border-sport-500/20 text-xs font-black">
                    🏟️ {myCourts.length} Managed Pitches
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black">
                    ⚽ {createdGames.length} Sessions Hosted
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black">
                    📋 {clubBookings.length} Reservations
                  </span>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    {currentUser?.clubsJoined?.length || 0} Clubs
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    {joinedGames.length} Games Joined
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                    {createdGames.length} Games Hosted
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Action & Rating Strip */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {isManager && (
            /* Manager Venue Card Box */
            <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase text-slate-400">Venue Rating</span>
                <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
                  {myClub?.rating || '4.9'} <span className="text-xs font-semibold text-slate-400">({myClub?.reviewsCount || 142} reviews)</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              icon={Edit3}
              onClick={() => setIsEditProfileModalOpen(true)}
              className="rounded-xl font-black text-xs uppercase px-4 py-2.5 w-full sm:w-auto shadow-md"
            >
              Edit Profile
            </Button>
            
            {isManager && (
              <Link to="/club/manage" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  icon={Sliders}
                  className="rounded-xl font-bold text-xs uppercase px-4 py-2.5 w-full sm:w-auto"
                >
                  Venue Settings
                </Button>
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════
          2. ACCOUNT & VENUE SETTINGS CARDS
         ═══════════════════════════════════════════ */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {isManager ? 'Manager Credentials & Venue Portal' : 'Account & Personal Settings'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1 */}
          {isManager ? (
            <Link to="/club/manage" className="block">
              <div className="admin-card admin-card-hover p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900 h-full">
                <div className="w-10 h-10 rounded-xl bg-sport-500/10 text-sport-500 flex items-center justify-center border border-sport-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">Venue Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {myClub?.name || 'Bernabeu Arena Turf'} • {myClub?.city} • {myCourts.length} Pitches configured.
                </p>
                <span className="text-[11px] font-bold text-sport-500 flex items-center gap-1 pt-1">
                  <span>Edit Venue Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ) : (
            <div onClick={() => setIsEditProfileModalOpen(true)} className="admin-card admin-card-hover p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">Player Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Location ({currentUser?.city}), position ({currentUser?.playingHand || 'Striker'}), bio, and preferences.
              </p>
            </div>
          )}

          {/* Card 2 */}
          <div onClick={() => setIsEditProfileModalOpen(true)} className="admin-card admin-card-hover p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">
              {isManager ? 'Manager Credentials' : 'Personal Information'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentUser?.name} • {currentUser?.phone || '+91 98765 43210'} • Role: <strong className="text-emerald-500">{currentUser?.role}</strong>.
            </p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
              <span>Update Contact Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Wallet / Revenue */}
          {isManager ? (
            <Link to="/club/bookings" className="block">
              <div className="admin-card admin-card-hover p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900 h-full">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">Venue Revenue & Payouts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Confirmed slot revenues: <span className="text-sport-500 font-black">₹{totalVenueSlotRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> across {clubBookings.length} reservations.
                </p>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
                  <span>View Reservations Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ) : (
            <div onClick={() => setIsTopUpModalOpen(true)} className="admin-card admin-card-hover p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">Wallet Balance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current balance: <span className="text-amber-500 font-black text-sm">₹{currentUser?.walletBalance?.toFixed(2)}</span>. Add funds & view transaction history.
              </p>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
                <span>Top-up Wallet Funds</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

        </div>
      </div>

      {/* ═══════════════════════════════════════════
          3. SESSIONS, MATCHES & MEDIA TABS
         ═══════════════════════════════════════════ */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-sport-500" />
            <span>{isManager ? 'Venue Game Sessions & Match Records' : 'Player Game History & Videos'}</span>
          </h3>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto">
            {[
              ...(isManager ? [] : [{ id: 'joined', label: `Joined Games (${joinedGames.length})` }]),
              { id: 'created', label: isManager ? `Hosted Sessions (${createdGames.length})` : `Created Games (${createdGames.length})` },
              { id: 'completed', label: `Match History (${completedMatches.length})` },
              { id: 'videos', label: `Match Videos (${myVideos.length})` },
              ...(isManager ? [{ id: 'reservations', label: `Slot Bookings (${clubBookings.length})` }] : []),
              { id: 'payments', label: `Payment History` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveHistoryTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all uppercase whitespace-nowrap cursor-pointer ${
                  activeHistoryTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Joined Games (Player Only) */}
        {activeHistoryTab === 'joined' && !isManager && (
          <div className="space-y-3">
            {joinedGames.length > 0 ? (
              joinedGames.map(g => (
                <div key={g.id} className="admin-card p-4 rounded-xl flex items-center justify-between text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.title}</h4>
                      <Badge variant="emerald" size="sm" className="rounded-md">{g.format}</Badge>
                      <Badge variant="blue" size="sm" className="rounded-md">{g.status}</Badge>
                    </div>
                    <p className="text-slate-400 font-medium mt-1">
                      {g.venueReference?.clubName} • {g.dateTime?.date} ({g.dateTime?.startTime})
                    </p>
                  </div>
                  <Link to={`/games/${g.id}`}>
                    <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs border-slate-300 dark:border-slate-700">View Roster</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-8 admin-card rounded-xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No joined games yet.</p>
            )}
          </div>
        )}

        {/* Tab: Hosted / Created Games */}
        {activeHistoryTab === 'created' && (
          <div className="space-y-3">
            {createdGames.length > 0 ? (
              createdGames.map(g => {
                const isGameCompleted = g.status === 'COMPLETED' || (g.score && g.score.teamA !== null);
                const totalSlots = g.maxPlayers || 10;
                const confirmed = g.confirmedPlayers?.length || 0;
                const spotsLeft = Math.max(0, totalSlots - confirmed);

                return (
                  <div key={g.id} className="admin-card p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">{g.title}</h4>
                        <Badge variant="gold" size="sm" className="rounded-md">Hosted Session</Badge>
                        <Badge variant="blue" size="sm" className="rounded-md">{g.format}</Badge>
                        {isGameCompleted ? (
                          <Badge variant="emerald" size="sm" className="rounded-md">COMPLETED</Badge>
                        ) : g.status === 'ONGOING' ? (
                          <Badge variant="danger" size="sm" className="rounded-md">LIVE MATCH</Badge>
                        ) : (
                          <Badge variant="emerald" size="sm" className="rounded-md">{spotsLeft > 0 ? `🟢 ${spotsLeft} Slots Open` : '🔒 Full'}</Badge>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">
                        {g.venueReference?.clubName} ({g.venueReference?.courtName || 'Main Pitch'}) • {g.dateTime?.date} ({g.dateTime?.startTime} – {g.dateTime?.endTime}) • <strong>{confirmed}/{totalSlots} Players</strong>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link to={`/games/${g.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs">Manage Session</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-8 admin-card rounded-xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {isManager ? 'No game sessions hosted yet. Create your first session in Game Sessions.' : 'You haven\'t hosted any games yet.'}
              </p>
            )}
          </div>
        )}

        {/* Tab: Completed Matches & Results */}
        {activeHistoryTab === 'completed' && (
          <div className="space-y-3">
            {completedMatches.length > 0 ? (
              completedMatches.map(g => {
                const scoreA = g.score?.teamA ?? (g.liveScore?.teamA ?? 0);
                const scoreB = g.score?.teamB ?? (g.liveScore?.teamB ?? 0);
                const hasScore = g.score && g.score.teamA !== null && g.score.teamA !== undefined;
                const hasVideo = (gameVideos || []).some(v => v.gameId === g.id) || !!g.videoReference || !!g.videoUrl;

                return (
                  <div key={g.id} className="admin-card p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">{g.title}</h4>
                        <Badge variant="emerald" size="sm" className="rounded-md">COMPLETED</Badge>
                        <Badge variant="blue" size="sm" className="rounded-md">{g.format}</Badge>
                        {hasVideo && (
                          <Badge variant="gold" size="sm" className="rounded-md">🎥 Video Available</Badge>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">
                        Final Score: <strong className="text-slate-900 dark:text-white font-mono text-sm">{scoreA} – {scoreB}</strong> • {g.venueReference?.clubName} • {g.dateTime?.date}
                      </p>
                    </div>
                    <Link to={`/games/${g.id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs">View Match & Score</Button>
                    </Link>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-8 admin-card rounded-xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No completed match scores recorded yet.</p>
            )}
          </div>
        )}

        {/* Tab: Match Videos */}
        {activeHistoryTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myVideos.length > 0 ? (
              myVideos.map(v => (
                <div key={v.id} className="admin-card p-4 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Film className="w-4 h-4 text-amber-500" />
                      <span>{v.title}</span>
                    </span>
                    <Badge variant="emerald" size="sm" className="rounded-md">HD VIDEO</Badge>
                  </div>
                  <p className="text-slate-400 font-medium">{v.description}</p>
                  <Link to={`/games/${v.gameId}`} className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full rounded-lg font-bold text-xs">Watch Match Highlights</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-8 admin-card rounded-xl col-span-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No match videos linked yet.</p>
            )}
          </div>
        )}

        {/* Tab: Slot Bookings (Manager View) */}
        {activeHistoryTab === 'reservations' && isManager && (
          <div className="space-y-3">
            {clubBookings.length > 0 ? (
              clubBookings.map((b) => (
                <div key={b.id} className="admin-card p-4 rounded-xl flex items-center justify-between text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 dark:text-white">{b.userName}</span>
                      <Badge variant={b.status === 'CONFIRMED' ? 'emerald' : 'danger'} size="sm" className="rounded-md">
                        {b.status}
                      </Badge>
                    </div>
                    <span className="text-slate-400 font-semibold block mt-0.5">{b.courtName} • {b.date} ({b.startTime} - {b.endTime})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sport-500 font-mono font-black text-sm block">₹{parseFloat(b.amountPaid || 0).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{b.paymentMethod || 'Online'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-8 admin-card rounded-xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No court reservations recorded yet.</p>
            )}
          </div>
        )}

        {/* Tab: Payment History */}
        {activeHistoryTab === 'payments' && (
          <div className="space-y-3">
            {currentUser?.paymentHistory?.length > 0 ? (
              currentUser.paymentHistory.map((p, idx) => (
                <div key={idx} className="admin-card p-4 rounded-xl flex items-center justify-between text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div>
                    <span className="text-slate-900 dark:text-white block font-black">{p.description || 'Wallet Transaction'}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{p.timestamp || p.date || getTodayDate()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-black ${p.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {p.amount > 0 ? `+₹${p.amount.toFixed(2)}` : `-₹${Math.abs(p.amount).toFixed(2)}`}
                    </span>
                    <Badge variant="emerald" size="sm" className="block mt-0.5 rounded-md">{p.status || 'SUCCESS'}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-8 admin-card rounded-xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No wallet payment history recorded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          4. PLAYER PERSONAL RESERVATIONS TABLE (If Player)
         ═══════════════════════════════════════════ */}
      {!isManager && (
        <div className="space-y-3 pt-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">My Court Reservations</h3>
          
          {userBookings.length > 0 ? (
            <div className="space-y-3">
              {userBookings.map((b) => (
                <div key={b.id} className="admin-card p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{b.courtName}</h4>
                      <Badge variant={b.status === 'CONFIRMED' ? 'emerald' : 'danger'} size="sm" className="rounded-md">
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{b.clubName} ({b.city}) • {b.date} ({b.startTime} - {b.endTime})</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-mono font-black text-sport-500">₹{b.amountPaid?.toFixed(2)}</span>
                    {b.status === 'CONFIRMED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={RotateCcw}
                        isLoading={cancellingBookingId === b.id}
                        disabled={cancellingBookingId !== null}
                        onClick={() => setBookingToCancel(b)}
                        className="rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        Cancel & Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-card p-8 rounded-xl text-center text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              No court reservations yet. Book a turf today!
            </div>
          )}
        </div>
      )}

      {/* ═══ EDIT PROFILE MODAL ═══ */}
      <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title={isManager ? "Edit Manager Profile" : "Edit Player Profile"} maxWidth="max-w-md">
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
          {/* Avatar Photo Upload */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Avatar
                src={avatarPreview || currentUser?.profileImageUrl || currentUser?.avatar}
                name={currentUser?.name}
                size="lg"
                className="w-14 h-14 rounded-2xl border border-slate-300 dark:border-slate-700"
              />
              {avatarFile && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white">✓</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 mb-1">
                Profile Photo (JPG, PNG, WebP · Max 5MB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarFileChange}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-sport-500/10 file:text-sport-600 dark:file:text-sport-400 hover:file:bg-sport-500/20 cursor-pointer"
                />
                {avatarFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(currentUser?.profileImageUrl || currentUser?.avatar || '');
                      if (avatarInputRef.current) avatarInputRef.current.value = '';
                    }}
                    className="text-rose-500 hover:text-rose-600 text-xs font-bold whitespace-nowrap cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {avatarUploadProgress > 0 && avatarUploadProgress < 100 && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-sport-500 h-full transition-all duration-150" style={{ width: `${avatarUploadProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">Full Name *</label>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-sport-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">City</label>
              <select
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                <option value="Raipur">Raipur</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">Phone Number</label>
              <input
                name="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              {isManager ? 'Designation / Title' : 'Preferred Position / Foot'}
            </label>
            <input
              name="playingHand"
              type="text"
              value={playingHand}
              onChange={(e) => setPlayingHand(e.target.value)}
              placeholder={isManager ? "e.g. General Manager & Head of Turf Operations" : "e.g. Striker / Left Wing"}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-sport-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">Bio / Professional Summary</label>
            <textarea
              name="bio"
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isManager ? "Brief summary of your venue management experience..." : "Tell the community about yourself..."}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingProfile}
              disabled={isSavingProfile}
              className="shadow-md"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══ TOP UP MODAL ═══ */}
      <Modal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} title="💰 Top-Up Wallet (INR)" maxWidth="max-w-sm">
        <form onSubmit={handleTopUp} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">Top-Up Amount (₹)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['200', '500', '1000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                    topUpAmount === amt ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
            <input
              name="topUpAmount"
              type="number"
              step="50"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-sport-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsTopUpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              isLoading={isToppingUp}
              disabled={isToppingUp}
              className="shadow-md"
            >
              Confirm Add Funds
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══ CANCEL RESERVATION CONFIRM MODAL ═══ */}
    <Modal
      isOpen={!!bookingToCancel}
      onClose={() => { if (!cancellingBookingId) setBookingToCancel(null); }}
      title="⚠️ Cancel Reservation & Refund"
      maxWidth="max-w-md"
    >
      {bookingToCancel && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-2">
            <p className="text-sm font-bold">Are you sure you want to cancel this court reservation?</p>
            <p className="text-xs font-semibold opacity-80">A refund request will be sent to the club for processing. Refund policies may apply.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-400">Court:</span>
              <span className="text-slate-900 dark:text-white font-bold">{bookingToCancel.courtName || 'Main Turf'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date &amp; Time:</span>
              <span className="text-slate-700 dark:text-slate-300">{bookingToCancel.date} · {bookingToCancel.startTime} – {bookingToCancel.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Paid:</span>
              <span className="text-sport-500 font-bold">₹{bookingToCancel.amountPaid?.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBookingToCancel(null)}
              className="flex-1 border border-slate-200 dark:border-slate-700"
            >
              Keep Reservation
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={RotateCcw}
              isLoading={!!cancellingBookingId}
              disabled={!!cancellingBookingId}
              onClick={handleCancelReservation}
              className="flex-1"
            >
              Yes, Cancel &amp; Refund
            </Button>
          </div>
        </div>
      )}
    </Modal>
    </div>
  );
};

export default ProfilePage;
