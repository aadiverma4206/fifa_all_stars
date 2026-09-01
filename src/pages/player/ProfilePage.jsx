import React, { useState } from 'react';
import { User, Wallet, Trophy, Shield, RotateCcw, Plus, Globe, Bell, Eye, Lock, Edit3, Film, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { getEloBadgeInfo } from '../../utils/eloCalculator';
import { getTodayDate } from '../../utils/dateUtils';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { validateName, validatePositiveAmount } from '../../utils/validationUtils';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { currentUser, updateWallet, updateProfile } = useAuthStore();
  const { bookings, games, gameVideos, cancelBooking } = useDataStore();

  const [topUpAmount, setTopUpAmount] = useState('500');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState('joined');

  // Form edit states
  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || 'Raipur');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [playingHand, setPlayingHand] = useState(currentUser?.playingHand || 'Right / Striker');

  const badgeInfo = getEloBadgeInfo(currentUser?.eloRating || currentUser?.elo || 1840);
  const userBookings = bookings.filter(b => b.userId === currentUser?.id || b.userName === currentUser?.name);

  // Player Game History Filtering
  const createdGames = games.filter(g => g.organizer?.id === currentUser?.id);
  const joinedGames = games.filter(g => g.confirmedPlayers?.some(p => p.id === currentUser?.id));
  const completedMatches = games.filter(g => 
    g.status === 'COMPLETED' && 
    g.score !== null && g.score !== undefined && g.score.teamA !== null && g.score.teamA !== undefined &&
    g.confirmedPlayers?.some(p => p.id === currentUser?.id)
  );
  const myVideos = gameVideos.filter(v => {
    const targetGame = games.find(g => g.id === v.gameId);
    return targetGame?.confirmedPlayers?.some(p => p.id === currentUser?.id) || v.uploadedBy?.includes(currentUser?.name);
  });

  const handleTopUp = (e) => {
    e.preventDefault();
    const amountCheck = validatePositiveAmount(topUpAmount, 'Top-Up Amount', false);
    if (!amountCheck.isValid) {
      toast.error(amountCheck.message);
      return;
    }
    const val = parseFloat(topUpAmount);
    
    updateWallet(val, 'Wallet Top-Up');
    toast.success(`Top-up successful! Added ₹${val.toFixed(2)} to wallet.`);
    setIsTopUpModalOpen(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const nameCheck = validateName(name, 'Full Name');
    if (!nameCheck.isValid) {
      toast.error(nameCheck.message);
      return;
    }

    updateProfile({ name: name.trim(), city, bio: bio.trim(), playingHand: playingHand.trim() });
    toast.success('Profile updated successfully!');
    setIsEditProfileModalOpen(false);
  };

  const handleCancelReservation = (bookingId) => {
    cancelBooking(bookingId, 'User requested refund via Profile');
    toast.success('Reservation cancelled. Refund request sent!');
  };

  return (
    <div className="space-y-6 py-6 max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-10 overflow-x-hidden">
      
      {/* 1. PROFILE HERO HEADER CARD */}
      <div className="admin-card p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
          <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="xl" status="active" className="rounded-lg w-16 h-16 sm:w-20 sm:h-20" />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{currentUser?.name}</h1>
              <Badge variant="emerald" size="sm" className="rounded-md">{currentUser?.city || 'Raipur'}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              @{currentUser?.name?.toLowerCase()?.replace(/\s+/g, '')} • {currentUser?.phone || '+91 98765 43210'} • Member since {currentUser?.joinedDate || '2024'}
            </p>
            {currentUser?.bio && (
              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium max-w-lg">"{currentUser?.bio}"</p>
            )}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                {currentUser?.clubsJoined?.length || 0} Clubs
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                {joinedGames.length} Games Joined
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
                {createdGames.length} Games Hosted
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Division Badge */}
          <div className="flex items-center space-x-3 p-3 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center">
            <span className="text-2xl">{badgeInfo.icon}</span>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400">{badgeInfo.title}</span>
              <span className="text-xl font-bold text-sport-500">{currentUser?.eloRating || currentUser?.elo || 1840} <span className="text-xs font-semibold text-slate-400">Elo</span></span>
            </div>
          </div>

          <Button variant="primary" size="md" icon={Edit3} rainbowBorder={false} onClick={() => setIsEditProfileModalOpen(true)} className="rounded-md font-bold text-xs uppercase px-4 py-2.5 w-full sm:w-auto shadow-sm">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* 2. ACCOUNT SETTINGS GRID */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Account Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onClick={() => setIsEditProfileModalOpen(true)} className="admin-card admin-card-hover p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900">
            <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Player Information</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Location, position ({currentUser?.playingHand || 'Striker'}), bio, and club memberships.
            </p>
          </div>

          <div onClick={() => setIsEditProfileModalOpen(true)} className="admin-card admin-card-hover p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900">
            <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Personal Information</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Name, email, phone ({currentUser?.phone || '+91 98765 43210'}), verified role ({currentUser?.role}).
            </p>
          </div>

          <div onClick={() => setIsTopUpModalOpen(true)} className="admin-card admin-card-hover p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5 cursor-pointer bg-white dark:bg-slate-900">
            <div className="w-9 h-9 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Wallet & Payouts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Current balance: <span className="text-amber-500 font-bold">₹{currentUser?.walletBalance?.toFixed(2)}</span>. Add funds & view ledger.
            </p>
          </div>
        </div>
      </div>

      {/* 3. PLAYER GAME HISTORY & RECORDED MATCHES TABS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-sport-500" />
            <span>Player Game History & Videos</span>
          </h3>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto">
            {[
              { id: 'joined', label: `Joined Games (${joinedGames.length})` },
              { id: 'created', label: `Created Games (${createdGames.length})` },
              { id: 'completed', label: `Completed Scores (${completedMatches.length})` },
              { id: 'videos', label: `Match Videos (${myVideos.length})` },
              { id: 'payments', label: `Payment History` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveHistoryTab(tab.id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
                  activeHistoryTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Joined Games */}
        {activeHistoryTab === 'joined' && (
          <div className="space-y-3">
            {joinedGames.length > 0 ? (
              joinedGames.map(g => (
                <div key={g.id} className="admin-card p-4 rounded-lg flex items-center justify-between text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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
                    <Button variant="outline" size="sm" className="rounded-md font-semibold text-xs border-slate-300 dark:border-slate-700">View Roster</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-6 admin-card rounded-lg text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No joined games yet.</p>
            )}
          </div>
        )}

        {/* Tab 2: Created Games */}
        {activeHistoryTab === 'created' && (
          <div className="space-y-3">
            {createdGames.length > 0 ? (
              createdGames.map(g => (
                <div key={g.id} className="admin-card p-4 rounded-lg flex items-center justify-between text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.title}</h4>
                      <Badge variant="gold" size="sm" className="rounded-md">Hosted</Badge>
                      <Badge variant="emerald" size="sm" className="rounded-md">{g.format}</Badge>
                    </div>
                    <p className="text-slate-400 font-medium mt-1">
                      {g.venueReference?.clubName} • {g.dateTime?.date} ({g.dateTime?.startTime})
                    </p>
                  </div>
                  <Link to={`/games/${g.id}`}>
                    <Button variant="outline" size="sm" className="rounded-md font-semibold text-xs border-slate-300 dark:border-slate-700">Manage Session</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-6 admin-card rounded-lg text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">You haven't hosted any games yet.</p>
            )}
          </div>
        )}

        {/* Tab 3: Completed Match Scores */}
        {activeHistoryTab === 'completed' && (
          <div className="space-y-3">
            {completedMatches.length > 0 ? (
              completedMatches.map(g => (
                <div key={g.id} className="admin-card p-4 rounded-lg flex items-center justify-between text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.title}</h4>
                      <Badge variant="emerald" size="sm" className="rounded-md">COMPLETED</Badge>
                    </div>
                    <p className="text-slate-400 font-medium mt-1">
                      Final Score: <span className="text-slate-900 dark:text-white font-bold">Team A {g.score?.teamA} - {g.score?.teamB} Team B</span>
                    </p>
                  </div>
                  <Link to={`/games/${g.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-md font-semibold text-xs">View Result</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-6 admin-card rounded-lg text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No completed match scores recorded yet.</p>
            )}
          </div>
        )}

        {/* Tab 4: Match Videos */}
        {activeHistoryTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myVideos.length > 0 ? (
              myVideos.map(v => (
                <div key={v.id} className="admin-card p-4 rounded-lg space-y-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Film className="w-4 h-4 text-sky-500" />
                      <span>{v.title}</span>
                    </span>
                    <Badge variant="emerald" size="sm" className="rounded-md">AVAILABLE</Badge>
                  </div>
                  <p className="text-slate-400 font-medium">{v.description}</p>
                  <Link to={`/games/${v.gameId}`} className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full rounded-md font-semibold text-xs border-slate-300 dark:border-slate-700">Watch Highlights Video</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-6 admin-card rounded-lg col-span-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No match videos linked yet.</p>
            )}
          </div>
        )}

        {/* Tab 5: Payment History */}
        {activeHistoryTab === 'payments' && (
          <div className="space-y-3">
            {currentUser?.paymentHistory?.length > 0 ? (
              currentUser.paymentHistory.map((p, idx) => (
                <div key={idx} className="admin-card p-3.5 rounded-lg flex items-center justify-between text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div>
                    <span className="text-slate-900 dark:text-white block font-bold">{p.description || 'Wallet Transaction'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{p.timestamp || p.date || getTodayDate()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold ${p.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {p.amount > 0 ? `+₹${p.amount.toFixed(2)}` : `-₹${Math.abs(p.amount).toFixed(2)}`}
                    </span>
                    <Badge variant="emerald" size="sm" className="block mt-0.5 rounded-md">{p.status || 'SUCCESS'}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic p-6 admin-card rounded-lg text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">No wallet payment history recorded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* 4. BOOKING HISTORY TABLE */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">My Court Reservations</h3>
        
        {userBookings.length > 0 ? (
          <div className="space-y-3">
            {userBookings.map((b) => (
              <div key={b.id} className="admin-card p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.courtName}</h4>
                    <Badge variant={b.status === 'CONFIRMED' ? 'emerald' : 'danger'} size="sm" className="rounded-md">
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">{b.clubName} ({b.city}) • {b.date} ({b.startTime} - {b.endTime})</p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-mono font-bold text-sport-500">₹{b.amountPaid?.toFixed(2)}</span>
                  {b.status === 'CONFIRMED' && (
                    <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => handleCancelReservation(b.id)} className="rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                      Cancel & Refund
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-card p-8 rounded-lg text-center text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            No court reservations yet. Book a turf today!
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="Edit Player Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
            >
              <option value="Raipur">Raipur</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Preferred Position / Foot</label>
            <input
              type="text"
              value={playingHand}
              onChange={(e) => setPlayingHand(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Bio</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditProfileModalOpen(false)} className="rounded-md font-semibold text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-md font-bold text-xs uppercase">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Top Up Modal */}
      <Modal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} title="Top-Up Wallet (INR)">
        <form onSubmit={handleTopUp} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Top-Up Amount (₹)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['200', '500', '1000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 rounded-md text-xs font-bold border cursor-pointer ${
                    topUpAmount === amt ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="50"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsTopUpModalOpen(false)} className="rounded-md font-semibold text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" className="rounded-md font-bold text-xs uppercase">
              Confirm Add Funds
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ProfilePage;
