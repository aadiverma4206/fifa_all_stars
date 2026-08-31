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
  const completedMatches = games.filter(g => g.status === 'COMPLETED' && g.confirmedPlayers?.some(p => p.id === currentUser?.id));
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
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      
      {/* Profile Header */}
      <div className="footy-card p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
          <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="xl" status="active" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">{currentUser?.name}</h1>
              <Badge variant="emerald" size="sm">{currentUser?.city || 'Raipur'}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              @{currentUser?.name?.toLowerCase()?.replace(/\s+/g, '')} • {currentUser?.phone || '+91 98765 43210'} • Member since {currentUser?.joinedDate || '2024'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 italic max-w-md">"{currentUser?.bio}"</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Badge variant="blue" size="sm">{currentUser?.clubsJoined?.length || 0} Clubs</Badge>
              <Badge variant="emerald" size="sm">{joinedGames.length} Games Joined</Badge>
              <Badge variant="gold" size="sm">{createdGames.length} Games Hosted</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Division Badge */}
          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 w-full sm:w-auto justify-center">
            <span className="text-3xl">{badgeInfo.icon}</span>
            <div>
              <span className="block text-xs font-bold text-slate-400">{badgeInfo.title}</span>
              <span className="text-2xl font-black text-sport-500">{currentUser?.eloRating || currentUser?.elo || 1840} <span className="text-xs font-bold text-slate-400">Elo</span></span>
            </div>
          </div>

          <Button variant="outline" size="sm" icon={Edit3} onClick={() => setIsEditProfileModalOpen(true)} className="w-full sm:w-auto">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* ACCOUNT SETTINGS GRID */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Account settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onClick={() => setIsEditProfileModalOpen(true)} className="footy-card p-6 space-y-3 cursor-pointer hover:border-sport-500 transition-all">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Player info</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Location, position ({currentUser?.playingHand || 'Striker'}), bio, clubs.
            </p>
          </div>

          <div onClick={() => setIsEditProfileModalOpen(true)} className="footy-card p-6 space-y-3 cursor-pointer hover:border-sport-500 transition-all">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Personal info</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Name, email, phone number ({currentUser?.phone || '+91 98765 43210'}), verified role ({currentUser?.role}).
            </p>
          </div>

          <div onClick={() => setIsTopUpModalOpen(true)} className="footy-card p-6 space-y-3 cursor-pointer hover:border-sport-500 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Wallet & Payouts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Current balance: <span className="text-amber-500 font-black">₹{currentUser?.walletBalance?.toFixed(2)}</span>. Add funds & view payments.
            </p>
          </div>
        </div>
      </div>

      {/* PLAYER GAME HISTORY & RECORDED MATCHES TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-sport-500" />
            <span>Player Game History & Videos</span>
          </h3>

          <div className="flex items-center space-x-2 overflow-x-auto text-xs font-black scrollbar-none">
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
                className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  activeHistoryTab === tab.id
                    ? 'bg-sport-500 text-white border-sport-500 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
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
                <div key={g.id} className="footy-card p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{g.title}</h4>
                      <Badge variant="emerald" size="sm">{g.format}</Badge>
                      <Badge variant="blue" size="sm">{g.status}</Badge>
                    </div>
                    <p className="text-slate-400 font-semibold mt-1">
                      {g.venueReference?.clubName} • {g.dateTime?.date} ({g.dateTime?.startTime})
                    </p>
                  </div>
                  <Link to={`/games/${g.id}`}>
                    <Button variant="outline" size="sm">View Roster</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-6 footy-card text-center">No joined games yet.</p>
            )}
          </div>
        )}

        {/* Tab 2: Created Games */}
        {activeHistoryTab === 'created' && (
          <div className="space-y-3">
            {createdGames.length > 0 ? (
              createdGames.map(g => (
                <div key={g.id} className="footy-card p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{g.title}</h4>
                      <Badge variant="gold" size="sm">Hosted</Badge>
                      <Badge variant="emerald" size="sm">{g.format}</Badge>
                    </div>
                    <p className="text-slate-400 font-semibold mt-1">
                      {g.venueReference?.clubName} • {g.dateTime?.date} ({g.dateTime?.startTime})
                    </p>
                  </div>
                  <Link to={`/games/${g.id}`}>
                    <Button variant="outline" size="sm">Manage Session</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-6 footy-card text-center">You haven't hosted any games yet.</p>
            )}
          </div>
        )}

        {/* Tab 3: Completed Match Scores */}
        {activeHistoryTab === 'completed' && (
          <div className="space-y-3">
            {completedMatches.length > 0 ? (
              completedMatches.map(g => (
                <div key={g.id} className="footy-card p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{g.title}</h4>
                      <Badge variant="emerald" size="sm">COMPLETED</Badge>
                    </div>
                    <p className="text-slate-400 font-semibold mt-1">
                      Final Score: <span className="text-white font-black">Team A {g.score?.teamA} - {g.score?.teamB} Team B</span>
                    </p>
                  </div>
                  <Link to={`/games/${g.id}`}>
                    <Button variant="ghost" size="sm">View Result</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-6 footy-card text-center">No completed match scores recorded yet.</p>
            )}
          </div>
        )}

        {/* Tab 4: Match Videos */}
        {activeHistoryTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myVideos.length > 0 ? (
              myVideos.map(v => (
                <div key={v.id} className="footy-card p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Film className="w-4 h-4 text-sky-500" />
                      <span>{v.title}</span>
                    </span>
                    <Badge variant="emerald" size="sm">AVAILABLE</Badge>
                  </div>
                  <p className="text-slate-400">{v.description}</p>
                  <Link to={`/games/${v.gameId}`} className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full">Watch Highlights Video</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-6 footy-card col-span-2 text-center">No match videos linked yet.</p>
            )}
          </div>
        )}

        {/* Tab 5: Payment History */}
        {activeHistoryTab === 'payments' && (
          <div className="space-y-3">
            {currentUser?.paymentHistory?.length > 0 ? (
              currentUser.paymentHistory.map((p, idx) => (
                <div key={idx} className="footy-card p-3.5 flex items-center justify-between text-xs font-bold">
                  <div>
                    <span className="text-slate-900 dark:text-white block font-extrabold">{p.description || 'Wallet Transaction'}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{p.timestamp || p.date || getTodayDate()}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${p.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {p.amount > 0 ? `+₹${p.amount.toFixed(2)}` : `-₹${Math.abs(p.amount).toFixed(2)}`}
                    </span>
                    <Badge variant="emerald" size="sm" className="block mt-0.5">{p.status || 'SUCCESS'}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic p-6 footy-card text-center">No wallet payment history recorded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Booking History Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">My Court Reservations</h3>
        
        {userBookings.length > 0 ? (
          <div className="space-y-3">
            {userBookings.map((b) => (
              <div key={b.id} className="footy-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{b.courtName}</h4>
                    <Badge variant={b.status === 'CONFIRMED' ? 'emerald' : 'danger'} size="sm">
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">{b.clubName} ({b.city}) • {b.date} ({b.startTime} - {b.endTime})</p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-base font-black text-sport-500">₹{b.amountPaid?.toFixed(2)}</span>
                  {b.status === 'CONFIRMED' && (
                    <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => handleCancelReservation(b.id)}>
                      Cancel & Refund
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="footy-card p-8 text-center text-slate-400 text-xs font-semibold">
            No court reservations yet. Book a turf today!
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="Edit Player Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Bio</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Top Up Modal */}
      <Modal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} title="Top-Up Wallet (INR)">
        <form onSubmit={handleTopUp} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Top-Up Amount (₹)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['200', '500', '1000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-black border ${
                    topUpAmount === amt ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-100 dark:bg-slate-800'
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsTopUpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm">
              Confirm Add Funds
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ProfilePage;
