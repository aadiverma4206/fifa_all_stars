import React, { useState } from 'react';
import { User, Wallet, Trophy, Shield, RotateCcw, Plus, Globe, Bell, Eye, Lock, Edit3 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { getEloBadgeInfo } from '../../utils/eloCalculator';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { currentUser, updateWallet, updateProfile } = useAuthStore();
  const { bookings, cancelBooking } = useDataStore();

  const [topUpAmount, setTopUpAmount] = useState('500');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Form edit states
  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || 'Raipur');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [playingHand, setPlayingHand] = useState(currentUser?.playingHand || 'Right / Striker');

  const badgeInfo = getEloBadgeInfo(currentUser?.eloRating || currentUser?.elo || 1840);
  const userBookings = bookings.filter(b => b.userId === currentUser?.id || b.userName === currentUser?.name);

  const handleTopUp = (e) => {
    e.preventDefault();
    const val = parseFloat(topUpAmount);
    if (isNaN(val) || val <= 0) return;
    
    updateWallet(val);
    toast.success(`Top-up successful! Added ₹${val.toFixed(2)} to wallet.`);
    setIsTopUpModalOpen(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, city, bio, playingHand });
    toast.success('Profile updated successfully!');
    setIsEditProfileModalOpen(false);
  };

  const handleCancelReservation = (bookingId) => {
    cancelBooking(bookingId, 'User requested refund via Profile');
    toast.success('Reservation cancelled. Refund request sent!');
  };

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      
      {/* Profile Header (Footy Addicts Screenshot 2 Match) */}
      <div className="footy-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="xl" status="active" />
          <div className="space-y-1 text-left">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">{currentUser?.name}</h1>
              <Badge variant="emerald" size="sm">{currentUser?.city || 'Raipur'}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-semibold">@{currentUser?.name?.toLowerCase()?.replace(/\s+/g, '')} • Member since {currentUser?.joinedDate || '2024'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-300 italic max-w-md">"{currentUser?.bio}"</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Division Badge */}
          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <span className="text-3xl">{badgeInfo.icon}</span>
            <div>
              <span className="block text-xs font-bold text-slate-400">{badgeInfo.title}</span>
              <span className="text-2xl font-black text-sport-500">{currentUser?.eloRating || currentUser?.elo || 1840} <span className="text-xs font-bold text-slate-400">Elo</span></span>
            </div>
          </div>

          <Button variant="outline" size="sm" icon={Edit3} onClick={() => setIsEditProfileModalOpen(true)}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* FOOTY ADDICTS ACCOUNT SETTINGS GRID (Screenshot 2 Match) */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Account settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onClick={() => setIsEditProfileModalOpen(true)} className="footy-card p-6 space-y-3 cursor-pointer hover:border-sport-500 transition-all">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Player info</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Let us know where are you looking to play. Location, position, bio.
            </p>
          </div>

          <div onClick={() => setIsEditProfileModalOpen(true)} className="footy-card p-6 space-y-3 cursor-pointer hover:border-sport-500 transition-all">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Personal info</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Name, username, gender, nationality, phone number, profile picture, email, password.
            </p>
          </div>

          <div onClick={() => setIsTopUpModalOpen(true)} className="footy-card p-6 space-y-3 cursor-pointer hover:border-sport-500 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Wallet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Transactions, balance (₹{currentUser?.walletBalance?.toFixed(2)}), wallet currency, payout methods.
            </p>
          </div>

          <div className="footy-card p-6 space-y-3 opacity-90">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Language</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Choose the language you want to use across FIFA All Stars (English / Hindi).
            </p>
          </div>

          <div className="footy-card p-6 space-y-3 opacity-90">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Choose notifications preferences and how you want to be contacted.
            </p>
          </div>

          <div className="footy-card p-6 space-y-3 opacity-90">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Privacy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Manage your personal data, connected services, and data sharing settings.
            </p>
          </div>
        </div>
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
