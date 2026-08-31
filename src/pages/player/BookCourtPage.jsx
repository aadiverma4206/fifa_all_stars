import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ShieldCheck, Zap, CheckCircle2, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTodayDate } from '../../utils/dateUtils';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const BookCourtPage = () => {
  const [searchParams] = useSearchParams();
  const courtId = searchParams.get('courtId') || 'crt_rp_101';
  const navigate = useNavigate();

  const { courts, clubs, createBooking } = useDataStore();
  const { currentUser, updateWallet } = useAuthStore();

  const court = courts.find(c => c.courtId === courtId || c.id === courtId) || courts[0];
  const club = clubs.find(c => c.id === court?.clubId) || clubs[0];

  const isUnavailable = court?.status === 'BLOCKED' || court?.status === 'MAINTENANCE';

  const [date, setDate] = useState(getTodayDate(1));
  const [startTime, setStartTime] = useState('19:00');
  const [duration, setDuration] = useState(1.5);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const availableSlots = ['16:00', '17:30', '19:00', '20:30', '22:00'];

  const startHour = parseInt(startTime.split(':')[0], 10);
  const isPeak = startHour >= 17 && startHour < 21;
  const hourlyRate = isPeak ? court.basePrice * (court.peakMultiplier || 1.5) : court.basePrice;
  const baseSubtotal = hourlyRate * duration;
  const serviceFee = 50;
  const tax = Math.round(baseSubtotal * 0.05);
  const grandTotal = Math.round(baseSubtotal + serviceFee + tax);

  const handleConfirmBooking = () => {
    if (isUnavailable) {
      toast.error('This court is currently blocked or under maintenance by the venue manager.');
      return;
    }
    if (!currentUser) return;
    
    // Strict Date Validation: Past Date Guard
    const today = getTodayDate();
    if (date < today) {
      toast.error('Cannot book pitch slots for past dates! Please select today or a future date.');
      return;
    }

    if (!startTime) {
      toast.error('Please select a valid time slot for your pitch reservation.');
      return;
    }

    if (currentUser.walletBalance < grandTotal) {
      toast.error(`Insufficient wallet balance! Booking total is ₹${grandTotal}, but your balance is ₹${currentUser.walletBalance?.toFixed(2)}. Please top up.`);
      return;
    }

    updateWallet(-grandTotal);

    const startH = parseInt(startTime.split(':')[0], 10);
    const startM = parseInt(startTime.split(':')[1], 10);
    const endH = startH + Math.floor(duration);
    const endM = startM + (duration % 1 ? 30 : 0);
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const newBooking = createBooking({
      courtId: court.courtId || court.id,
      courtName: court.name,
      clubId: club.id,
      clubName: club.name,
      city: club.city,
      userId: currentUser.id,
      userName: currentUser.name,
      date,
      startTime,
      endTime: endTimeStr,
      amountPaid: grandTotal
    });

    setConfirmedBooking(newBooking);
    setIsSuccessModalOpen(true);
    toast.success('Court booking confirmed!');
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      
      <BackButton fallback="/player/courts" label="Back to Turf Directory" />

      {/* Unavailable Warning Banner */}
      {isUnavailable && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center space-x-3 text-xs font-bold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Notice: This court is currently {court.status}. Bookings are temporarily paused by venue manager.</span>
        </div>
      )}

      <div className="footy-card p-6 sm:p-8 space-y-6">
        
        {/* Header Pitch Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald">{court.type || 'Outdoor'}</Badge>
              <Badge variant="blue">{court.surface}</Badge>
              <Badge variant={isUnavailable ? 'danger' : 'emerald'}>{court.status}</Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase">
              {court.name}
            </h1>
            <p className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-sport-500" />
              <span>{club.name} • {club.address} ({club.city})</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">Base Hourly Rate</span>
            <span className="text-2xl font-black text-sport-500">₹{court.basePrice}/hr</span>
          </div>
        </div>

        {/* Slot Selection Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-sport-500" />
              <span>Select Date & Duration</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Booking Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isUnavailable}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Select Time Slot</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => setStartTime(slot)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all disabled:opacity-50 ${
                        startTime === slot
                          ? 'bg-sport-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Duration (Hours)</label>
                <div className="flex items-center space-x-3">
                  {[1, 1.5, 2].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => setDuration(dur)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all disabled:opacity-50 ${
                        duration === dur
                          ? 'bg-sport-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dur} Hours
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="footy-card p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>INR Price Breakdown</span>
            </h3>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Hourly Rate ({isPeak ? 'Peak Hour' : 'Standard'})</span>
                <span className="font-extrabold">₹{hourlyRate}/hr</span>
              </div>
              
              {isPeak && (
                <div className="flex justify-between text-amber-500 bg-amber-500/10 p-2 rounded-xl">
                  <span>Peak Window Surcharge (1.5x)</span>
                  <span>Active (17:00 - 21:00)</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal ({duration} hrs)</span>
                <span className="font-extrabold">₹{baseSubtotal.toFixed(0)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Platform Convenience Fee</span>
                <span className="font-extrabold">₹{serviceFee}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>GST (5%)</span>
                <span className="font-extrabold">₹{tax}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm">
                <span className="font-black text-slate-900 dark:text-white uppercase">Grand Total</span>
                <span className="text-2xl font-black text-sport-500">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 mb-3">
                Wallet Balance: <span className="text-amber-500">₹{currentUser?.walletBalance?.toFixed(2)}</span>
              </p>
              <Button
                variant={isUnavailable ? 'disabled' : 'gold'}
                size="lg"
                className="w-full"
                icon={CheckCircle2}
                disabled={isUnavailable}
                onClick={handleConfirmBooking}
              >
                {isUnavailable ? 'Court Unavailable' : `Pay & Reserve Pitch (₹${grandTotal})`}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => navigate('/profile')} title="Booking Confirmed!">
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 rounded-full bg-sport-500/10 text-sport-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Pitch Reserved Successfully!
          </h3>

          <p className="text-xs text-slate-400 font-semibold">
            Booking Reference: <span className="font-mono text-sport-500 font-black">{confirmedBooking?.id}</span>
          </p>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-left space-y-1">
            <p><strong>Venue:</strong> {club.name} ({club.city})</p>
            <p><strong>Court:</strong> {court.name}</p>
            <p><strong>Date & Time:</strong> {date} ({startTime} - {confirmedBooking?.endTime})</p>
            <p><strong>Paid:</strong> ₹{grandTotal} (Wallet)</p>
          </div>

          <Button variant="primary" size="md" className="w-full" onClick={() => navigate('/profile')}>
            View My Reservations
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookCourtPage;
