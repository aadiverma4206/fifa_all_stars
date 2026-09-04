import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, MapPin, Clock, ShieldCheck, CheckSquare, Save,
  Phone, Mail, Globe, Star, Sparkles, Plus, X, RotateCcw,
  CheckCircle2, AlertCircle, Camera, Tag, Layers, ChevronRight,
  Flame, Trophy, DollarSign, Calendar, Eye
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { validateTitle, validateNonEmpty, validatePhone, validateEmail, validateCoordinates, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import { validateFile, readFileAsDataUrl, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, DEFAULT_MAX_IMAGE_SIZE, formatFileSize } from '../../utils/fileValidationUtils';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import toast from 'react-hot-toast';

const CITY_COORDINATES = {
  Raipur: { lat: 21.2497, lng: 81.6584 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 18.9438, lng: 72.8234 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Kolkata: { lat: 22.5726, lng: 88.3639 }
};

const DEFAULT_AMENITIES = [
  'Floodlights',
  'Changing Rooms',
  'Showers',
  'Drinking Water',
  'Free Parking',
  'Equipment Rental',
  'Spectator Stand',
  'Cafeteria & Snacks',
  'First Aid Station',
  'Locker Facility',
  'Free High-Speed Wi-Fi',
  'VAR / Video Recording'
];

const PRESET_VENUE_IMAGES = [
  '/assets/images/courts/court-1.jpg',
  '/assets/images/courts/court-2.jpg',
  '/assets/images/courts/court-3.jpg',
  '/assets/images/courts/court-4.jpg',
  '/assets/images/courts/court-5.jpg',
  '/assets/images/courts/court-6.jpg'
];

const LOCAL_COURT_IMAGES = PRESET_VENUE_IMAGES;

export const ManageClubPage = () => {
  const { clubs, courts, games, updateClub } = useDataStore();
  const { currentUser } = useAuthStore();

  // Find manager's club
  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);
  const myClubGames = games.filter(g => g.venueReference?.clubId === myClub?.id);
  const activeGamesCount = myClubGames.filter(g => g.status !== 'COMPLETED').length;

  // Form State
  const [name, setName] = useState(myClub?.name || '');
  const [address, setAddress] = useState(myClub?.address || '');
  const [city, setCity] = useState(myClub?.city || 'Raipur');
  const [lat, setLat] = useState(myClub?.geoCoordinates?.lat || 21.2497);
  const [lng, setLng] = useState(myClub?.geoCoordinates?.lng || 81.6584);
  const [openTime, setOpenTime] = useState(myClub?.operatingHours?.open || '06:00');
  const [closeTime, setCloseTime] = useState(myClub?.operatingHours?.close || '23:00');
  const [daysOpen, setDaysOpen] = useState(myClub?.daysOpen || 'Monday – Sunday (All Days)');
  const [phone, setPhone] = useState(myClub?.contactPhone || '+91 98765 43210');
  const [email, setEmail] = useState(myClub?.contactEmail || 'contact@bernabeuarena.com');
  const [clubImageUrl, setClubImageUrl] = useState(myClub?.clubImageUrl || '/assets/images/courts/court-1.jpg');
  const [description, setDescription] = useState(myClub?.description || '');
  const [selectedAmenities, setSelectedAmenities] = useState(myClub?.amenities || DEFAULT_AMENITIES.slice(0, 6));
  const [newAmenity, setNewAmenity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cover Image File Upload States
  const [coverFile, setCoverFile] = useState(null);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const coverFileInputRef = useRef(null);

  const handleCoverFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setCoverFile(null);
      return;
    }
    const file = files[0];
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
      maxSizeBytes: DEFAULT_MAX_IMAGE_SIZE,
      fileCategoryName: 'venue photo'
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
      setCoverFile(null);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file, (percent) => {
        setCoverUploadProgress(percent);
      });
      setCoverFile(file);
      setClubImageUrl(dataUrl);
      toast.success(`Photo "${file.name}" loaded (${formatFileSize(file.size)})`);
    } catch (err) {
      toast.error(err.message || 'Failed to read image file.');
      setCoverFile(null);
    }
  };

  // Sync state if club changes
  useEffect(() => {
    if (myClub) {
      setName(myClub.name || '');
      setAddress(myClub.address || '');
      setCity(myClub.city || 'Raipur');
      setLat(myClub.geoCoordinates?.lat || 21.2497);
      setLng(myClub.geoCoordinates?.lng || 81.6584);
      setOpenTime(myClub.operatingHours?.open || '06:00');
      setCloseTime(myClub.operatingHours?.close || '23:00');
      setDaysOpen(myClub.daysOpen || 'Monday – Sunday (All Days)');
      setPhone(myClub.contactPhone || '+91 98765 43210');
      setEmail(myClub.contactEmail || 'contact@bernabeuarena.com');
      setClubImageUrl(myClub.clubImageUrl || '/assets/images/courts/court-1.jpg');
      setDescription(myClub.description || '');
      setSelectedAmenities(myClub.amenities || DEFAULT_AMENITIES.slice(0, 6));
    }
  }, [myClub?.id]);

  // Toggle Amenity
  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Add Custom Amenity
  const handleAddCustomAmenity = (e) => {
    e.preventDefault();
    if (!newAmenity || !newAmenity.trim()) return;
    const clean = newAmenity.trim();
    if (!selectedAmenities.includes(clean)) {
      setSelectedAmenities([...selectedAmenities, clean]);
    }
    setNewAmenity('');
    toast.success(`Amenity "${clean}" added!`);
  };

  // Quick Set City & Coords
  const handleCityChange = (newCity) => {
    setCity(newCity);
    if (CITY_COORDINATES[newCity]) {
      setLat(CITY_COORDINATES[newCity].lat);
      setLng(CITY_COORDINATES[newCity].lng);
    }
  };

  const hasUnsavedClubEdits = Boolean(
    myClub && (
      name !== (myClub.name || '') ||
      address !== (myClub.address || '') ||
      city !== (myClub.city || 'Raipur') ||
      phone !== (myClub.contactPhone || '') ||
      email !== (myClub.contactEmail || '') ||
      description !== (myClub.description || '') ||
      coverFile !== null
    )
  );

  const { confirmDiscard } = useUnsavedChanges(hasUnsavedClubEdits);

  // Discard Changes
  const handleDiscard = () => {
    confirmDiscard(() => {
      if (myClub) {
        setName(myClub.name || '');
        setAddress(myClub.address || '');
        setCity(myClub.city || 'Raipur');
        setLat(myClub.geoCoordinates?.lat || 21.2497);
        setLng(myClub.geoCoordinates?.lng || 81.6584);
        setOpenTime(myClub.operatingHours?.open || '06:00');
        setCloseTime(myClub.operatingHours?.close || '23:00');
        setDaysOpen(myClub.daysOpen || 'Monday – Sunday (All Days)');
        setPhone(myClub.contactPhone || '+91 98765 43210');
        setEmail(myClub.contactEmail || 'contact@bernabeuarena.com');
        setClubImageUrl(myClub.clubImageUrl || '/assets/images/courts/court-1.jpg');
        setDescription(myClub.description || '');
        setSelectedAmenities(myClub.amenities || DEFAULT_AMENITIES.slice(0, 6));
        setCoverFile(null);
        if (coverFileInputRef.current) coverFileInputRef.current.value = '';
        toast.success('Form reset to saved venue profile.');
      }
    });
  };
  const handleReset = handleDiscard;

  // Save Club Profile
  const isSavingRef = useRef(false);

  const handleSaveClub = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSaving || isSavingRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e || document, [
      { check: () => validateTitle(name, 'Venue / Club Name'), field: 'name' },
      { check: () => validateNonEmpty(address, 'Street Address'), field: 'address' },
      { check: () => validatePhone(phone), field: 'phone' },
      { check: () => validateEmail(email), field: 'email' },
      { check: () => validateCoordinates(lat, lng), field: 'lat' },
      { check: () => {
        if (openTime && closeTime && openTime >= closeTime && closeTime !== '00:00') {
          return { isValid: false, message: 'Closing Time must be after Opening Time (or set 00:00 for midnight).' };
        }
        return { isValid: true };
      }, field: 'closeTime' }
    ]);

    if (!isValid) return;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedDesc = description.trim();

    // Change Detection: prevent redundant updates if nothing changed
    const currentAmenities = (myClub?.amenities || []).slice().sort();
    const newAmenities = selectedAmenities.slice().sort();
    const amenitiesChanged = JSON.stringify(currentAmenities) !== JSON.stringify(newAmenities);

    const hasChanges =
      trimmedName !== (myClub?.name || '').trim() ||
      trimmedAddress !== (myClub?.address || '').trim() ||
      city !== (myClub?.city || '') ||
      trimmedPhone !== (myClub?.contactPhone || '').trim() ||
      trimmedEmail !== (myClub?.contactEmail || '').trim() ||
      parsedLat !== myClub?.geoCoordinates?.lat ||
      parsedLng !== myClub?.geoCoordinates?.lng ||
      openTime !== (myClub?.operatingHours?.open || '') ||
      closeTime !== (myClub?.operatingHours?.close || '') ||
      daysOpen !== (myClub?.daysOpen || '') ||
      clubImageUrl !== (myClub?.clubImageUrl || '') ||
      trimmedDesc !== (myClub?.description || '').trim() ||
      amenitiesChanged;

    if (!hasChanges) {
      toast('No changes detected for this venue profile.', { icon: 'ℹ️' });
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      updateClub(myClub.id, {
        name: trimmedName,
        address: trimmedAddress,
        city,
        contactPhone: trimmedPhone,
        contactEmail: trimmedEmail,
        geoCoordinates: { lat: parsedLat, lng: parsedLng },
        operatingHours: { open: openTime, close: closeTime },
        daysOpen,
        amenities: selectedAmenities,
        clubImageUrl,
        description: trimmedDesc
      });
      toast.success('Venue profile saved successfully!');
    } catch (err) {
      logActionError('handleSaveClub', err);
      toast.error(getErrorMessage(err, 'updating venue profile'));
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 400);
    }
  };

  return (
    <div className="space-y-6 py-4 max-w-[1700px] w-full mx-auto px-2 sm:px-4">

      {/* ═══ TOP HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-sport-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{myClub?.name || 'Club Venue'}</span>
            <Badge variant="emerald" size="sm" className="rounded-md">✅ ACTIVE & VERIFIED</Badge>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Manage Venue Details & Profile
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Configure club branding, operating hours, geolocation, amenities, and player-facing cover photos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="md"
            icon={RotateCcw}
            onClick={handleReset}
            className="border-slate-300 dark:border-slate-700 text-xs font-bold"
          >
            Reset
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            icon={Save}
            isLoading={isSaving}
            disabled={isSaving}
            onClick={handleSaveClub}
            className="shadow-lg shadow-sport-500/20 text-xs font-black"
          >
            {isSaving ? 'Saving Profile...' : 'Save Venue Profile'}
          </Button>
        </div>
      </div>

      {/* ═══ FULL SCREEN 2-COLUMN WORKSPACE GRID ═══ */}
      <form onSubmit={handleSaveClub}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ═══════════════════════════════════════════
              LEFT / MAIN FORM COLUMN (8 Columns)
             ═══════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">

            {/* SECTION 1: BASIC INFORMATION & LOCATION */}
            <div className="admin-card p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sport-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Basic Venue Information
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step 1 of 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Venue / Club Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bernabeu Arena Turf"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    City Location *
                  </label>
                  <select
                    name="city"
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  >
                    <option value="Raipur">Raipur</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                    <option value="Kolkata">Kolkata</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Full Street Address & Landmark *
                </label>
                <input
                  name="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. VIP Road, Near Magneto Mall, Telibandha"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                />
              </div>

              {/* Geolocation Coordinates */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                    GPS Coordinates (Latitude & Longitude)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">Used for Map Navigation & Search</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">LAT:</span>
                    <input
                      name="lat"
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">LNG:</span>
                    <input
                      name="lng"
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sport-500" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    name="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sport-500" />
                    <span>Contact Email</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@venue.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Venue Overview & Description
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your turf specifications, pitch dimensions, grass quality, rules, and facilities..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* SECTION 2: OPERATING HOURS & SCHEDULE */}
            <div className="admin-card p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Operating Hours & Weekly Schedule
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step 2 of 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Opening Time
                  </label>
                  <input
                    name="openTime"
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Closing Time
                  </label>
                  <input
                    name="closeTime"
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Days Active
                  </label>
                  <select
                    name="daysOpen"
                    value={daysOpen}
                    onChange={(e) => setDaysOpen(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  >
                    <option value="Monday – Sunday (All Days)">Monday – Sunday (All Days)</option>
                    <option value="Monday – Saturday">Monday – Saturday</option>
                    <option value="Weekends Only (Sat-Sun)">Weekends Only (Sat-Sun)</option>
                    <option value="24/7 Always Open">24/7 Always Open</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <span>Configured Peak Hours window: <strong>17:00 – 22:00</strong> daily</span>
                </div>
                <Link to="/club/pricing" className="text-[11px] font-black underline uppercase hover:text-amber-600">
                  Manage Pricing Multipliers ➔
                </Link>
              </div>
            </div>

            {/* SECTION 3: VENUE AMENITIES */}
            <div className="admin-card p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Venue Amenities & Facilities ({selectedAmenities.length} selected)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step 3 of 4</span>
              </div>

              {/* Amenity Pills Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {DEFAULT_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <div
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-black shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs">{amenity}</span>
                      <CheckSquare className={`w-4 h-4 ${isSelected ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-300 dark:text-slate-700'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Amenity Input */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <input
                  type="text"
                  placeholder="Add custom facility (e.g. Free Bibs, Ball Pump, Physio Room)..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddCustomAmenity}
                  className="text-xs font-bold whitespace-nowrap"
                >
                  Add Facility
                </Button>
              </div>
            </div>

            {/* SECTION 4: COVER PHOTO & GALLERY */}
            <div className="admin-card p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Select Venue Cover Photo & Visuals
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Step 4 of 4</span>
              </div>

              {/* Preset Gallery Thumbnails */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2 uppercase">
                  Choose from High-Resolution Preset Turf Galleries:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {LOCAL_COURT_IMAGES.map((imgUrl, idx) => {
                    const isCurrent = clubImageUrl === imgUrl;
                    return (
                      <div
                        key={idx}
                        onClick={() => setClubImageUrl(imgUrl)}
                        className={`group relative h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isCurrent
                            ? 'border-sport-500 ring-2 ring-sport-500 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Turf Visual ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-sport-500/20 flex items-center justify-center">
                            <span className="bg-sport-500 text-white p-1 rounded-full shadow-md">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Local Image File */}
              <div className="pt-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Or Upload Venue Photo (.jpg, .png, .webp · Max 10 MB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sport-500/10 file:text-sport-600 dark:file:text-sport-400 hover:file:bg-sport-500/20 cursor-pointer"
                  />
                  {coverFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setClubImageUrl(myClub?.clubImageUrl || '/assets/images/courts/court-1.jpg');
                        if (coverFileInputRef.current) coverFileInputRef.current.value = '';
                      }}
                      className="text-rose-500 hover:text-rose-600 text-xs font-bold whitespace-nowrap p-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {coverFile && (
                  <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Selected: <strong className="text-slate-900 dark:text-white">{coverFile.name}</strong> ({formatFileSize(coverFile.size)})</span>
                    <span className="text-emerald-500 font-bold">✓ Loaded as Cover</span>
                  </div>
                )}
              </div>

              {/* Custom Image URL */}
              <div className="pt-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Or Enter Custom Image URL (Direct HTTPS Image Link)
                </label>
                <input
                  type="url"
                  value={clubImageUrl}
                  onChange={(e) => setClubImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="md" onClick={handleReset}>
                Reset Changes
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
                isLoading={isSaving}
                disabled={isSaving}
                className="shadow-lg shadow-sport-500/25"
              >
                {isSaving ? 'Saving Profile...' : 'Save Venue Profile'}
              </Button>
            </div>

          </div>

          {/* ═══════════════════════════════════════════
              RIGHT / SIDEBAR COLUMN (4 Columns)
             ═══════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6">

            {/* LIVE VENUE PREVIEW CARD */}
            <div className="admin-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sport-500" />
                  <span>Live Player View Preview</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Live Preview</span>
              </div>

              {/* Public Turf Card Replica */}
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-xs">
                <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                  <img
                    src={clubImageUrl || '/assets/images/courts/court-1.jpg'}
                    alt={name || 'Venue Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.onerror = null;
                      e.target.src = '/assets/images/courts/court-1.jpg'; 
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <Badge variant="emerald" size="sm" className="shadow-md">Active Venue</Badge>
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md text-[11px] font-black text-amber-400 flex items-center gap-1 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{myClub?.rating || 4.9}</span>
                    <span className="text-[9px] text-slate-400">({myClub?.reviewsCount || 142})</span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white uppercase leading-tight truncate">
                      {name || 'Bernabeu Arena Turf'}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                      <span>{address || 'VIP Road, Telibandha'}, {city}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{openTime} – {closeTime}</span>
                    </span>
                    <span className="text-sport-500 font-black">{myCourts.length} Pitches</span>
                  </div>

                  {/* Amenities Preview Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedAmenities.slice(0, 4).map(a => (
                      <span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        ✓ {a}
                      </span>
                    ))}
                    {selectedAmenities.length > 4 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500">
                        +{selectedAmenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* VENUE SUMMARY KPI METRICS */}
            <div className="admin-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Venue Fast Metrics
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="block text-2xl font-black text-sport-500">{myCourts.length}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Pitches</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="block text-2xl font-black text-emerald-500">{activeGamesCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Games</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">Manager In-Charge:</span>
                <p className="text-xs font-black text-slate-900 dark:text-white">{currentUser?.name || 'Club Manager'}</p>
                <p className="text-[11px] text-slate-400 font-semibold">{currentUser?.email || 'manager@turf.com'}</p>
              </div>
            </div>

            {/* QUICK SHORTCUT LINKS */}
            <div className="admin-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Manager Quick Portals
              </h4>

              <div className="space-y-2">
                <Link to="/club/courts" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-sport-500" />
                    <span>Manage Pitches & Courts ({myCourts.length})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link to="/club/pricing" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <span>Peak Pricing & Multipliers</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link to="/club/games" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Venue Game Sessions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link to="/club/history" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Match History & Results</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </form>

    </div>
  );
};

export default ManageClubPage;
