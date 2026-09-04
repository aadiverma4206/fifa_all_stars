import React, { useState, useMemo, useRef } from 'react';
import { 
  Building2, CheckCircle2, XCircle, UserPlus, MapPin, Search, Filter, 
  Clock, Star, ShieldCheck, AlertCircle, Eye, Edit3, Plus, Trash2, 
  LayoutGrid, List, Check, Settings, Phone, Mail, Sparkles, Layers, 
  Activity, ArrowUpDown, ChevronRight, Shield, RefreshCw, AlertTriangle,
  Flame, Calendar, ExternalLink
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { validateTitle, validateNonEmpty, validatePositiveAmount, validateTimeRange, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import toast from 'react-hot-toast';

const AVAILABLE_AMENITIES = [
  'Floodlights', 'Pro Shop', 'Washrooms', 'Parking', 
  'Cafeteria', 'Changing Rooms', 'Free WiFi', 'Live Video Recording', 
  'Juice Bar', 'First Aid Kit', 'Locker Rooms', 'Water Dispenser'
];

export const ClubApprovalsPage = () => {
  const { 
    clubs, 
    courts, 
    approveClub, 
    rejectClub, 
    updateClub, 
    addClub, 
    toggleClubStatus, 
    assignClubManager,
    addCourt,
    toggleCourtStatus 
  } = useDataStore();
  const { usersList } = useAuthStore();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, ACTIVE, REJECTED, UNASSIGNED
  const [cityFilter, setCityFilter] = useState('ALL');
  const [managerFilter, setManagerFilter] = useState('all'); // all, assigned, unassigned
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('NEWEST'); // NEWEST, NAME, RATING, COURTS

  // Modal States
  const [selectedClub, setSelectedClub] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false);
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);

  // Loading & Concurrency Locks
  const [isApprovingClub, setIsApprovingClub] = useState(false);
  const [isRejectingClub, setIsRejectingClub] = useState(false);
  const [isSavingClub, setIsSavingClub] = useState(false);
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [isCreatingCourt, setIsCreatingCourt] = useState(false);

  const isApprovingClubRef = useRef(false);
  const isRejectingClubRef = useRef(false);
  const isSavingClubRef = useRef(false);
  const isCreatingClubRef = useRef(false);
  const isCreatingCourtRef = useRef(false);

  // Form State for Approval
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Form State for Rejection
  const [rejectReason, setRejectReason] = useState('Venue fails synthetic pitch standard specifications');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Form State for Add / Edit Club
  const [clubFormData, setClubFormData] = useState({
    name: '',
    address: '',
    city: 'Raipur',
    openTime: '06:00',
    closeTime: '23:00',
    description: '',
    clubImageUrl: '/assets/images/courts/court-1.jpg',
    amenities: ['Floodlights', 'Washrooms', 'Parking', 'Changing Rooms'],
    managerId: '',
    status: 'ACTIVE'
  });

  // Form State for Add Pitch to Club
  const [courtFormData, setCourtFormData] = useState({
    name: '',
    type: 'Outdoor',
    surface: '3G Turf',
    basePrice: 600,
    peakMultiplier: 1.5,
    weekendMultiplier: 1.75,
    peakWindow: '17:00-21:00',
    status: 'AVAILABLE',
    image: '/assets/images/courts/court-1.jpg'
  });

  // Manager accounts list
  const managerUsers = useMemo(() => {
    return usersList.filter(u => u.role === 'CLUB_MANAGER' || u.role === 'SUPER_ADMIN');
  }, [usersList]);

  // Unique cities list
  const cities = useMemo(() => {
    const list = Array.from(new Set(clubs.map(c => c.city).filter(Boolean)));
    return list.sort();
  }, [clubs]);

  // High Level KPI Analytics
  const stats = useMemo(() => {
    const total = clubs.length;
    const pending = clubs.filter(c => c.status === 'PENDING').length;
    const active = clubs.filter(c => c.status === 'ACTIVE' || !c.status).length;
    const suspended = clubs.filter(c => c.status === 'SUSPENDED' || c.status === 'REJECTED').length;
    const unassigned = clubs.filter(c => !c.managerIds || c.managerIds.length === 0).length;
    const totalCourts = courts.length;
    return { total, pending, active, suspended, unassigned, totalCourts };
  }, [clubs, courts]);

  // Filtered & Sorted Clubs
  const filteredClubs = useMemo(() => {
    return clubs
      .filter(club => {
        const matchesSearch = 
          club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (club.managerIds || []).some(mId => {
            const user = usersList.find(u => u.id === mId);
            return user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
          });

        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'ACTIVE' && (club.status === 'ACTIVE' || !club.status)) ||
          club.status === statusFilter;

        const matchesCity = cityFilter === 'all' || club.city?.toLowerCase() === cityFilter.toLowerCase();
        
        const hasManager = club.managerIds && club.managerIds.length > 0;
        const matchesManager = managerFilter === 'all' || 
          (managerFilter === 'assigned' && hasManager) || 
          (managerFilter === 'unassigned' && !hasManager);

        return matchesSearch && matchesStatus && matchesCity && matchesManager;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'city') return (a.city || '').localeCompare(b.city || '');
        if (sortBy === 'courts') {
          const courtsA = courts.filter(c => c.clubId === a.id).length;
          const courtsB = courts.filter(c => c.clubId === b.id).length;
          return courtsB - courtsA;
        }
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [clubs, courts, usersList, searchTerm, statusFilter, cityFilter, managerFilter, sortBy]);

  // Handlers
  const handleOpenApproveModal = (club) => {
    setSelectedClub(club);
    const existingManager = club.managerIds?.[0] || managerUsers[0]?.id || '';
    setSelectedManagerId(existingManager);
    setApprovalNotes('');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproval = async (e) => {
    e.preventDefault();
    if (!selectedClub || isApprovingClub || isApprovingClubRef.current) return;

    if (!checkNetworkOnline()) return;

    isApprovingClubRef.current = true;
    setIsApprovingClub(true);
    try {
      approveClub(selectedClub.id, selectedManagerId);
      if (approvalNotes.trim()) {
        toast.success(`Verification notes logged for ${selectedClub.name}`);
      }
      setIsApproveModalOpen(false);
      setSelectedClub(null);
    } catch (err) {
      logActionError('handleConfirmApproval', err);
      toast.error(getErrorMessage(err, 'approving venue'));
    } finally {
      setIsApprovingClub(false);
      setTimeout(() => {
        isApprovingClubRef.current = false;
      }, 400);
    }
  };

  const handleOpenRejectModal = (club) => {
    setSelectedClub(club);
    setRejectReason('Venue fails synthetic pitch standard specifications');
    setCustomRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedClub || isRejectingClub || isRejectingClubRef.current) return;

    if (!checkNetworkOnline()) return;

    if (rejectReason === 'OTHER') {
      const isValid = validateFormAndFocus(e, [
        { check: () => validateNonEmpty(customRejectReason, 'Rejection Reason'), field: 'customRejectReason' }
      ]);
      if (!isValid) return;
    }

    isRejectingClubRef.current = true;
    setIsRejectingClub(true);
    try {
      const finalReason = rejectReason === 'OTHER' ? customRejectReason : rejectReason;
      rejectClub(selectedClub.id, finalReason || 'Application declined by administrator');
      setIsRejectModalOpen(false);
      setSelectedClub(null);
    } catch (err) {
      logActionError('handleConfirmReject', err);
      toast.error(getErrorMessage(err, 'declining venue registration'));
    } finally {
      setIsRejectingClub(false);
      setTimeout(() => {
        isRejectingClubRef.current = false;
      }, 400);
    }
  };

  const handleOpenDetails = (club) => {
    setSelectedClub(club);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (club) => {
    setSelectedClub(club);
    setClubFormData({
      name: club.name || '',
      address: club.address || '',
      city: club.city || 'Raipur',
      openTime: club.operatingHours?.open || '06:00',
      closeTime: club.operatingHours?.close || '23:00',
      description: club.description || '',
      clubImageUrl: club.clubImageUrl || '/assets/images/courts/court-1.jpg',
      amenities: club.amenities || ['Floodlights', 'Washrooms', 'Parking'],
      managerId: club.managerIds?.[0] || '',
      status: club.status || 'ACTIVE'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditClub = async (e) => {
    e.preventDefault();
    if (!selectedClub || isSavingClub || isSavingClubRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(clubFormData.name, 'Venue Name'), field: 'name' },
      { check: () => validateNonEmpty(clubFormData.address, 'Street Address'), field: 'address' },
      { check: () => validateNonEmpty(clubFormData.city, 'City'), field: 'city' },
      { check: () => validateTimeRange(clubFormData.openTime, clubFormData.closeTime), field: 'openTime' }
    ]);

    if (!isValid) return;

    const trimmedName = clubFormData.name.trim();
    const trimmedAddress = clubFormData.address.trim();
    const trimmedCity = clubFormData.city.trim();
    const trimmedDesc = clubFormData.description.trim();
    const currentAmenities = (selectedClub.amenities || []).slice().sort();
    const newAmenities = (clubFormData.amenities || []).slice().sort();
    const amenitiesChanged = JSON.stringify(currentAmenities) !== JSON.stringify(newAmenities);
    const currentMgr = selectedClub.managerIds?.[0] || '';

    // Change Detection: prevent redundant updates if nothing changed
    const hasChanges =
      trimmedName !== (selectedClub.name || '').trim() ||
      trimmedAddress !== (selectedClub.address || '').trim() ||
      trimmedCity !== (selectedClub.city || '').trim() ||
      clubFormData.openTime !== (selectedClub.operatingHours?.open || '') ||
      clubFormData.closeTime !== (selectedClub.operatingHours?.close || '') ||
      trimmedDesc !== (selectedClub.description || '').trim() ||
      clubFormData.clubImageUrl !== (selectedClub.clubImageUrl || '') ||
      clubFormData.managerId !== currentMgr ||
      clubFormData.status !== (selectedClub.status || 'ACTIVE') ||
      amenitiesChanged;

    if (!hasChanges) {
      toast('No changes detected for this venue.', { icon: 'ℹ️' });
      setIsEditModalOpen(false);
      setSelectedClub(null);
      return;
    }

    isSavingClubRef.current = true;
    setIsSavingClub(true);
    try {
      updateClub(selectedClub.id, {
        name: trimmedName,
        address: trimmedAddress,
        city: trimmedCity,
        operatingHours: {
          open: clubFormData.openTime,
          close: clubFormData.closeTime
        },
        description: trimmedDesc,
        clubImageUrl: clubFormData.clubImageUrl,
        amenities: clubFormData.amenities,
        managerIds: clubFormData.managerId ? [clubFormData.managerId] : [],
        status: clubFormData.status
      });

      setIsEditModalOpen(false);
      setSelectedClub(null);
    } catch (err) {
      logActionError('handleSaveEditClub', err);
      toast.error(getErrorMessage(err, 'updating venue profile'));
    } finally {
      setIsSavingClub(false);
      setTimeout(() => {
        isSavingClubRef.current = false;
      }, 400);
    }
  };

  const handleOpenAddClub = () => {
    setClubFormData({
      name: '',
      address: '',
      city: 'Raipur',
      openTime: '06:00',
      closeTime: '23:00',
      description: '',
      clubImageUrl: '/assets/images/courts/court-1.jpg',
      amenities: ['Floodlights', 'Washrooms', 'Parking', 'Changing Rooms'],
      managerId: managerUsers[0]?.id || '',
      status: 'ACTIVE'
    });
    setIsAddClubModalOpen(true);
  };

  const handleCreateNewClub = async (e) => {
    e.preventDefault();
    if (isCreatingClub || isCreatingClubRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(clubFormData.name, 'Venue Name'), field: 'name' },
      { check: () => validateNonEmpty(clubFormData.address, 'Street Address'), field: 'address' },
      { check: () => validateNonEmpty(clubFormData.city, 'City'), field: 'city' },
      { check: () => validateTimeRange(clubFormData.openTime, clubFormData.closeTime), field: 'openTime' }
    ]);

    if (!isValid) return;

    isCreatingClubRef.current = true;
    setIsCreatingClub(true);
    try {
      const created = addClub({
        name: clubFormData.name.trim(),
        address: clubFormData.address.trim(),
        city: clubFormData.city.trim(),
        operatingHours: {
          open: clubFormData.openTime,
          close: clubFormData.closeTime
        },
        description: clubFormData.description.trim() || 'Official FIFA All Stars sports facility.',
        clubImageUrl: clubFormData.clubImageUrl,
        amenities: clubFormData.amenities,
        managerIds: clubFormData.managerId ? [clubFormData.managerId] : [],
        status: clubFormData.status
      });

      // Also auto-create a starter court for the new club
      addCourt(created.id, {
        name: `${created.name} Pitch 1 (5v5)`,
        type: 'Outdoor',
        surface: '3G Turf',
        basePrice: 600,
        peakMultiplier: 1.5,
        weekendMultiplier: 1.75,
        peakWindow: '17:00-21:00',
        status: 'AVAILABLE',
        image: created.clubImageUrl
      });

      setIsAddClubModalOpen(false);
    } catch (err) {
      logActionError('handleCreateNewClub', err);
      toast.error(getErrorMessage(err, 'registering venue'));
    } finally {
      setIsCreatingClub(false);
      setTimeout(() => {
        isCreatingClubRef.current = false;
      }, 400);
    }
  };

  const handleOpenAddCourt = (club) => {
    setSelectedClub(club);
    const existingCount = courts.filter(c => c.clubId === club.id).length;
    setCourtFormData({
      name: `${club.name} Pitch ${existingCount + 1} (5v5)`,
      type: 'Outdoor',
      surface: '3G Turf',
      basePrice: 600,
      peakMultiplier: 1.5,
      weekendMultiplier: 1.75,
      peakWindow: '17:00-21:00',
      status: 'AVAILABLE',
      image: club.clubImageUrl || '/assets/images/courts/court-1.jpg'
    });
    setIsAddCourtModalOpen(true);
  };

  const handleCreateCourtSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClub || isCreatingCourt || isCreatingCourtRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(courtFormData.name, 'Pitch Name'), field: 'courtName' },
      { check: () => validatePositiveAmount(courtFormData.basePrice, 'Base Hourly Rate', false), field: 'basePrice' }
    ]);

    if (!isValid) return;

    isCreatingCourtRef.current = true;
    setIsCreatingCourt(true);
    try {
      addCourt(selectedClub.id, {
        name: courtFormData.name.trim(),
        type: courtFormData.type,
        surface: courtFormData.surface,
        basePrice: Number(courtFormData.basePrice) || 500,
        peakMultiplier: Number(courtFormData.peakMultiplier) || 1.5,
        weekendMultiplier: Number(courtFormData.weekendMultiplier) || 1.75,
        peakWindow: courtFormData.peakWindow,
        status: courtFormData.status,
        image: courtFormData.image
      });

      setIsAddCourtModalOpen(false);
    } catch (err) {
      logActionError('handleCreateCourtSubmit', err);
      toast.error(getErrorMessage(err, 'adding pitch'));
    } finally {
      setIsCreatingCourt(false);
      setTimeout(() => {
        isCreatingCourtRef.current = false;
      }, 400);
    }
  };

  const toggleAmenityInForm = (amenity) => {
    setClubFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const getManagerInfo = (managerIds) => {
    if (!managerIds || managerIds.length === 0) return null;
    const mgr = usersList.find(u => managerIds.includes(u.id));
    return mgr || null;
  };

  return (
    <div className="space-y-6 py-4 w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <AdminNav />

      {/* 1. PAGE HEADER & QUICK ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 bg-sport-500/10 dark:bg-sport-500/20 text-sport-600 dark:text-sport-400 rounded-xl border border-sport-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Venue & Club Approvals & Management
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Review venue registration applications, verify pitch quality, assign club managers, and oversee multi-city facilities.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {stats.pending > 0 && (
            <button
              onClick={() => setStatusFilter('PENDING')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all animate-pulse"
            >
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{stats.pending} Awaiting Review</span>
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            rainbowBorder={false}
            onClick={handleOpenAddClub}
            className="rounded-xl font-bold text-xs uppercase shadow-sm"
          >
            Register New Venue
          </Button>
        </div>
      </div>

      {/* 2. KPI ANALYTICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Total Venues */}
        <div 
          onClick={() => { setStatusFilter('ALL'); setCityFilter('ALL'); }}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' 
              ? 'ring-2 ring-sport-500 bg-sport-50/30 dark:bg-sport-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Venues</span>
            <Building2 className="w-4 h-4 text-sport-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <span>{cities.length} Cities Covered</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={() => setStatusFilter('PENDING')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'PENDING' 
              ? 'ring-2 ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
            {stats.pending}
            {stats.pending > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-[11px] font-semibold text-amber-600/80 dark:text-amber-400/80 mt-1">
            {stats.pending > 0 ? 'Requires Admin Action' : 'All Requests Cleared'}
          </div>
        </div>

        {/* Active & Verified */}
        <div 
          onClick={() => setStatusFilter('ACTIVE')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ACTIVE' 
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Grounds</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.active}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Live on Player App
          </div>
        </div>

        {/* Total Pitches / Courts */}
        <div className="admin-card p-4 rounded-xl border hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pitches</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalCourts}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            5v5 / 7v7 / Futsal Domes
          </div>
        </div>

        {/* Manager Assigned Health */}
        <div 
          onClick={() => setStatusFilter('UNASSIGNED')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'UNASSIGNED' 
              ? 'ring-2 ring-rose-500 bg-rose-50/30 dark:bg-rose-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unassigned</span>
            <UserPlus className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.unassigned}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            {stats.unassigned > 0 ? 'Venues Missing Manager' : '100% Manager Coverage'}
          </div>
        </div>
      </div>

      {/* 3. CONTROL TOOLBAR (Search, Status Filter, City Filter, Sort, View Toggle) */}
      <div className="admin-card p-3.5 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Left: Search Input & City Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by venue name, city, address, or manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
          </div>

          <div className="w-40 sm:w-44">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              aria-label="Filter venues by city"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Cities ({cities.length})</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto max-w-full scrollbar-none w-full lg:w-auto">
          {[
            { id: 'ALL', label: `All (${stats.total})` },
            { id: 'PENDING', label: `⏳ Pending (${stats.pending})` },
            { id: 'ACTIVE', label: `✅ Active (${stats.active})` },
            { id: 'UNASSIGNED', label: `⚠️ Unassigned (${stats.unassigned})` },
            { id: 'SUSPENDED', label: `⏸️ Inactive (${stats.suspended})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Sort & Grid/Table View Mode */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort venues by criteria"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
          >
            <option value="NEWEST">Sort: Newest</option>
            <option value="NAME">Sort: Name (A-Z)</option>
            <option value="RATING">Sort: Top Rated</option>
            <option value="COURTS">Sort: Most Pitches</option>
          </select>

          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
              aria-label="Grid Cards View"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-800 text-sport-500 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Data Table View"
              aria-label="Data Table View"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-800 text-sport-500 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. CONTENT DISPLAY (GRID CARDS OR TABLE VIEW) */}
      {filteredClubs.length === 0 ? (
        <div className="admin-card p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Venues Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No venue matches your current search criteria or status filter. Try clearing filters or register a new venue.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              rainbowBorder={false}
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setCityFilter('ALL'); }}
              className="rounded-xl text-xs font-bold"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* --- RICH GRID CARDS VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredClubs.map((club) => {
            const isPending = club.status === 'PENDING';
            const isSuspended = club.status === 'SUSPENDED' || club.status === 'REJECTED';
            const clubCourts = courts.filter(c => c.clubId === club.id);
            const manager = getManagerInfo(club.managerIds);

            return (
              <div 
                key={club.id}
                className="admin-card rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between hover:shadow-lg transition-all duration-200 group bg-white dark:bg-slate-900"
              >
                {/* Image & Overlay Banner */}
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img 
                      src={club.clubImageUrl || '/assets/images/courts/court-1.jpg'} 
                      alt={club.name}
                      onError={(e) => { 
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/courts/court-1.jpg'; 
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                    {/* City Tag & Status Pill */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sport-400" />
                        <span>{club.city}</span>
                      </span>

                      {isPending ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                          <AlertCircle className="w-3 h-3" /> PENDING REVIEW
                        </span>
                      ) : isSuspended ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE & VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay: Rating & Operating Hours */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{club.rating || 4.9}</span>
                        <span className="text-[10px] text-slate-300 font-normal">({club.reviewsCount || 85})</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-sport-400" />
                        <span>{club.operatingHours?.open || '06:00'} - {club.operatingHours?.close || '23:00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Main Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-sport-500 transition-colors">
                          {club.name}
                        </h3>
                        <button 
                          onClick={() => handleOpenEdit(club)}
                          title="Edit Venue Settings"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />
                        <span className="truncate">{club.address}</span>
                      </p>

                      {club.description && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {club.description}
                        </p>
                      )}
                    </div>

                    {/* Pitches summary */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-sport-500/10 text-sport-600 dark:text-sport-400 rounded-lg">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {clubCourts.length} Pitches Configured
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {clubCourts.map(c => c.surface).filter(Boolean).slice(0, 2).join(' • ') || '3G Artificial Grass'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenDetails(club)}
                        className="text-[11px] font-bold text-sport-600 dark:text-sport-400 hover:underline flex items-center gap-0.5"
                      >
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Amenities chips */}
                    {club.amenities && club.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {club.amenities.slice(0, 4).map((am, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {am}
                          </span>
                        ))}
                        {club.amenities.length > 4 && (
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-md text-[10px] font-bold">
                            +{club.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Assigned Manager Info Block */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      {manager ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <Avatar src={manager.profileImageUrl || manager.avatar} name={manager.name} size="sm" className="rounded-lg flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {manager.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {manager.email}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenApproveModal(club)}
                            title="Reassign or Change Manager"
                            className="text-[11px] font-semibold text-sport-600 dark:text-sport-400 hover:underline ml-2 flex-shrink-0"
                          >
                            Reassign
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-bold">No Manager Assigned</span>
                          </div>
                          <button
                            onClick={() => handleOpenApproveModal(club)}
                            className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[11px] font-black uppercase hover:bg-amber-400 transition-colors"
                          >
                            Assign Now
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2.5">
                  {isPending ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        rainbowBorder={false}
                        onClick={() => handleOpenApproveModal(club)}
                        className="flex-1 rounded-xl text-xs font-bold py-2 shadow-sm"
                      >
                        Approve & Assign
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={XCircle}
                        rainbowBorder={false}
                        onClick={() => handleOpenRejectModal(club)}
                        className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        rainbowBorder={false}
                        onClick={() => handleOpenDetails(club)}
                        className="flex-1 rounded-xl text-xs font-bold py-2"
                      >
                        Manage Pitches ({clubCourts.length})
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Plus}
                        rainbowBorder={false}
                        onClick={() => handleOpenAddCourt(club)}
                        className="rounded-xl text-xs font-bold"
                      >
                        Add Pitch
                      </Button>

                      <button
                        onClick={() => toggleClubStatus(club.id, isSuspended ? 'ACTIVE' : 'SUSPENDED')}
                        title={isSuspended ? 'Reactivate Ground' : 'Suspend Ground'}
                        className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                          isSuspended 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {isSuspended ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* --- COMPREHENSIVE DATA TABLE VIEW --- */
        <div className="admin-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto max-w-full scrollbar-none">
            <table className="w-full min-w-[720px] text-left text-xs font-medium border-collapse">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-5">Venue & Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Pitches & Facilities</th>
                  <th className="py-3.5 px-4">Operating Hours</th>
                  <th className="py-3.5 px-4">Assigned Manager</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredClubs.map((club) => {
                  const isPending = club.status === 'PENDING';
                  const isSuspended = club.status === 'SUSPENDED' || club.status === 'REJECTED';
                  const clubCourts = courts.filter(c => c.clubId === club.id);
                  const manager = getManagerInfo(club.managerIds);

                  return (
                    <tr key={club.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* VENUE COLUMN */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-900">
                            <img 
                              src={club.clubImageUrl || '/assets/images/courts/court-1.jpg'} 
                              alt={club.name} 
                              onError={(e) => { 
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/images/courts/court-1.jpg'; 
                              }}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{club.name}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {club.city}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium truncate block mt-0.5">
                              {club.address}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active & Verified
                          </span>
                        )}
                      </td>

                      {/* PITCHES COLUMN */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenDetails(club)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sport-500 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5 text-sport-500" />
                          <span>{clubCourts.length} Pitches</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>

                      {/* OPERATING HOURS & RATING */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{club.operatingHours?.open || '06:00'} - {club.operatingHours?.close || '23:00'}</span>
                          </div>
                          <div className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{club.rating || 4.9}</span>
                            <span className="text-slate-400 font-normal">({club.reviewsCount || 85})</span>
                          </div>
                        </div>
                      </td>

                      {/* MANAGER COLUMN */}
                      <td className="py-3.5 px-4">
                        {manager ? (
                          <div className="flex items-center space-x-2.5">
                            <Avatar src={manager.profileImageUrl || manager.avatar} name={manager.name} size="xs" className="rounded-md" />
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]">{manager.name}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{manager.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isPending ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={CheckCircle2}
                                rainbowBorder={false}
                                onClick={() => handleOpenApproveModal(club)}
                                className="rounded-lg text-xs font-bold py-1.5"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={XCircle}
                                rainbowBorder={false}
                                onClick={() => handleOpenRejectModal(club)}
                                className="rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-1.5"
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Eye}
                                rainbowBorder={false}
                                onClick={() => handleOpenDetails(club)}
                                className="rounded-lg text-xs font-bold py-1.5"
                              >
                                Pitches
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Edit3}
                                rainbowBorder={false}
                                onClick={() => handleOpenEdit(club)}
                                className="rounded-lg text-xs py-1.5"
                              >
                                Edit
                              </Button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. APPROVE & ASSIGN MANAGER MODAL */}
      <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve Venue & Assign Club Manager">
        {selectedClub && (
          <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs font-bold">
            
            {/* Club Preview Box */}
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-300 dark:border-slate-700">
                <img 
                  src={selectedClub.clubImageUrl || '/assets/images/courts/court-1.jpg'} 
                  alt={selectedClub.name}
                  onError={(e) => { 
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/images/courts/court-1.jpg'; 
                  }}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-slate-900 dark:text-white truncate">{selectedClub.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-sport-500" />
                  <span>{selectedClub.address} ({selectedClub.city})</span>
                </div>
              </div>
              <Badge variant="emerald" size="sm" className="rounded-lg">
                Verified FIFA 3G
              </Badge>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Assign General Manager Account
              </label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                aria-label="Assign General Manager Account"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500 transition-all"
              >
                <option value="">-- Leave Unassigned (Assign Later) --</option>
                {managerUsers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email}) - {m.role}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 font-normal mt-1">
                The assigned manager will receive management access to courts, bookings, pricing multipliers, and game sessions for this venue.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Verification & Approval Remarks (Optional)
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="E.g. Synthetic grass inspected and certified under 3G turf regulations..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sport-500 transition-all"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                rainbowBorder={false}
                isLoading={isApprovingClub}
                disabled={isApprovingClub}
              >
                Confirm & Activate Venue
              </Button>
            </div>

          </form>
        )}
      </Modal>

      {/* 6. REJECT VENUE MODAL */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Decline Venue Registration">
        {selectedClub && (
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs font-bold">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>You are rejecting: {selectedClub.name}</span>
              </div>
              <p className="text-[11px] font-normal text-slate-600 dark:text-slate-400">
                This will remove the venue application from the active onboarding pipeline and log an audit trail entry.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Select Rejection Reason
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                aria-label="Select Rejection Reason"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              >
                <option value="Venue fails synthetic pitch standard specifications">Venue fails synthetic pitch standard specifications</option>
                <option value="Incomplete business licensing and safety documentation">Incomplete business licensing and safety documentation</option>
                <option value="Duplicate ground registration request">Duplicate ground registration request</option>
                <option value="Non-responsive applicant contact">Non-responsive applicant contact</option>
                <option value="OTHER">Other Custom Reason</option>
              </select>
            </div>

            {rejectReason === 'OTHER' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                  Specify Rejection Reason
                </label>
                <textarea
                  name="customRejectReason"
                  rows={2}
                  required
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="Provide explicit reasons for the rejection..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                icon={XCircle}
                rainbowBorder={false}
                isLoading={isRejectingClub}
                disabled={isRejectingClub}
              >
                Confirm Rejection
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 7. VENUE DETAILS & PITCHES MODAL */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedClub ? `${selectedClub.name} - Pitch Overview` : 'Venue Details'}>
        {selectedClub && (
          <div className="space-y-5 text-xs">
            
            {/* Header summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedClub.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-sport-500" />
                  <span>{selectedClub.address}, {selectedClub.city}</span>
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                rainbowBorder={false}
                onClick={() => { setIsDetailModalOpen(false); handleOpenAddCourt(selectedClub); }}
                className="rounded-xl text-xs font-bold"
              >
                Add Pitch
              </Button>
            </div>

            {/* List of Pitches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                  Configured Pitches ({courts.filter(c => c.clubId === selectedClub.id).length})
                </span>
              </div>

              {courts.filter(c => c.clubId === selectedClub.id).length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                  No pitches configured for this venue yet. Click "Add Pitch" to add one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courts.filter(c => c.clubId === selectedClub.id).map((court) => (
                    <div 
                      key={court.courtId || court.id}
                      className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{court.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {court.type} • {court.surface}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          court.status === 'AVAILABLE' 
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' 
                            : court.status === 'MAINTENANCE'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                        }`}>
                          {court.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-black text-sport-600 dark:text-sport-400">
                          ₹{court.basePrice}/hr
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleCourtStatus(court.courtId || court.id, court.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE')}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                          >
                            {court.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities Section */}
            {selectedClub.amenities && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                  Amenities & Facilities
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedClub.amenities.map((am, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold">
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" size="sm" rainbowBorder={false} onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* 8. REGISTER / ADD NEW VENUE MODAL */}
      <Modal isOpen={isAddClubModalOpen} onClose={() => setIsAddClubModalOpen(false)} title="Register New Sports Facility">
        <form onSubmit={handleCreateNewClub} className="space-y-4 text-xs font-bold max-h-[75vh] overflow-y-auto px-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Venue Name *</label>
              <input
                name="name"
                type="text"
                required
                placeholder="E.g. Santiago Turf Arena"
                value={clubFormData.name}
                onChange={(e) => setClubFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">City *</label>
              <input
                name="city"
                type="text"
                required
                placeholder="E.g. Raipur, Bangalore, Pune, Mumbai"
                value={clubFormData.city}
                onChange={(e) => setClubFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Status</label>
              <select
                name="status"
                value={clubFormData.status}
                onChange={(e) => setClubFormData(prev => ({ ...prev, status: e.target.value }))}
                aria-label="Venue status"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              >
                <option value="ACTIVE">Active & Verified (Immediate Live)</option>
                <option value="PENDING">Pending Review (Draft Application)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Full Address *</label>
              <input
                name="address"
                type="text"
                required
                placeholder="E.g. Plot 42, Telibandha VIP Road"
                value={clubFormData.address}
                onChange={(e) => setClubFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Opening Time</label>
              <input
                name="openTime"
                type="time"
                value={clubFormData.openTime}
                onChange={(e) => setClubFormData(prev => ({ ...prev, openTime: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Closing Time</label>
              <input
                name="closeTime"
                type="time"
                value={clubFormData.closeTime}
                onChange={(e) => setClubFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Assign Manager</label>
              <select
                name="managerId"
                value={clubFormData.managerId}
                onChange={(e) => setClubFormData(prev => ({ ...prev, managerId: e.target.value }))}
                aria-label="Assign Manager"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="">-- No Manager Assigned --</option>
                {managerUsers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Cover Photo Asset</label>
              <select
                value={clubFormData.clubImageUrl}
                onChange={(e) => setClubFormData(prev => ({ ...prev, clubImageUrl: e.target.value }))}
                aria-label="Cover Photo Asset"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="/assets/images/courts/court-1.jpg">Turf Ground Alpha (VIP 3G)</option>
                <option value="/assets/images/courts/court-2.jpg">Floodlit Synthetic Arena</option>
                <option value="/assets/images/courts/court-4.jpg">Indoor Acrylic Futsal Dome</option>
                <option value="/assets/images/courts/court-5.jpg">Multi-Pitch Sports Complex</option>
                <option value="/assets/images/courts/court-6.jpg">Championship Stadium Turf</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Description</label>
              <textarea
                rows={2}
                placeholder="State-of-the-art turf facility featuring FIFA grade artificial grass..."
                value={clubFormData.description}
                onChange={(e) => setClubFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            {/* Amenities Checkboxes */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">Select Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_AMENITIES.map((am) => {
                  const isChecked = clubFormData.amenities.includes(am);
                  return (
                    <button
                      type="button"
                      key={am}
                      onClick={() => toggleAmenityInForm(am)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold border flex items-center justify-between transition-colors ${
                        isChecked 
                          ? 'bg-sport-500/10 border-sport-500 text-sport-600 dark:text-sport-400' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <span className="truncate">{am}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsAddClubModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              rainbowBorder={false}
              isLoading={isCreatingClub}
              disabled={isCreatingClub}
            >
              Save & Register Venue
            </Button>
          </div>

        </form>
      </Modal>

      {/* 9. EDIT VENUE MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Venue Profile">
        <form onSubmit={handleSaveEditClub} className="space-y-4 text-xs font-bold max-h-[75vh] overflow-y-auto px-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Venue Name *</label>
              <input
                name="name"
                type="text"
                required
                value={clubFormData.name}
                onChange={(e) => setClubFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">City *</label>
              <input
                name="city"
                type="text"
                required
                value={clubFormData.city}
                onChange={(e) => setClubFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Status</label>
              <select
                name="status"
                value={clubFormData.status}
                onChange={(e) => setClubFormData(prev => ({ ...prev, status: e.target.value }))}
                aria-label="Venue status"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="ACTIVE">ACTIVE & VERIFIED</option>
                <option value="PENDING">PENDING REVIEW</option>
                <option value="SUSPENDED">SUSPENDED / INACTIVE</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Full Address *</label>
              <input
                name="address"
                type="text"
                required
                value={clubFormData.address}
                onChange={(e) => setClubFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Opening Time</label>
              <input
                name="openTime"
                type="time"
                value={clubFormData.openTime}
                onChange={(e) => setClubFormData(prev => ({ ...prev, openTime: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Closing Time</label>
              <input
                name="closeTime"
                type="time"
                value={clubFormData.closeTime}
                onChange={(e) => setClubFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Assigned Manager</label>
              <select
                name="managerId"
                value={clubFormData.managerId}
                onChange={(e) => setClubFormData(prev => ({ ...prev, managerId: e.target.value }))}
                aria-label="Assigned Manager"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="">-- No Manager Assigned --</option>
                {managerUsers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Description</label>
              <textarea
                rows={2}
                value={clubFormData.description}
                onChange={(e) => setClubFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            {/* Amenities Checkboxes */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">Select Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_AMENITIES.map((am) => {
                  const isChecked = clubFormData.amenities.includes(am);
                  return (
                    <button
                      type="button"
                      key={am}
                      onClick={() => toggleAmenityInForm(am)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold border flex items-center justify-between transition-colors ${
                        isChecked 
                          ? 'bg-sport-500/10 border-sport-500 text-sport-600 dark:text-sport-400' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <span className="truncate">{am}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-sport-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Check}
              rainbowBorder={false}
              isLoading={isSavingClub}
              disabled={isSavingClub}
            >
              Save Changes
            </Button>
          </div>

        </form>
      </Modal>

      {/* 10. ADD PITCH / COURT MODAL */}
      <Modal isOpen={isAddCourtModalOpen} onClose={() => setIsAddCourtModalOpen(false)} title={selectedClub ? `Add Pitch to ${selectedClub.name}` : 'Add Pitch'}>
        <form onSubmit={handleCreateCourtSubmit} className="space-y-4 text-xs font-bold">
          
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Pitch Name *</label>
            <input
              name="courtName"
              type="text"
              required
              placeholder="E.g. Pitch Alpha (5v5)"
              value={courtFormData.name}
              onChange={(e) => setCourtFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Type</label>
              <select
                name="type"
                value={courtFormData.type}
                onChange={(e) => setCourtFormData(prev => ({ ...prev, type: e.target.value }))}
                aria-label="Pitch Type"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="Outdoor">Outdoor</option>
                <option value="Indoor">Indoor Dome</option>
                <option value="Covered">Covered Rooftop</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Surface Quality</label>
              <select
                name="surface"
                value={courtFormData.surface}
                onChange={(e) => setCourtFormData(prev => ({ ...prev, surface: e.target.value }))}
                aria-label="Pitch Surface Quality"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="3G Turf">3G Artificial Turf</option>
                <option value="Synthetic Grass">Synthetic Grass</option>
                <option value="Acrylic">Acrylic Futsal Hardcourt</option>
                <option value="Natural Grass">Natural Grass</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Base Hourly Rate (INR)</label>
              <input
                name="basePrice"
                type="number"
                min="100"
                step="50"
                value={courtFormData.basePrice}
                onChange={(e) => setCourtFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Initial Status</label>
              <select
                name="status"
                value={courtFormData.status}
                onChange={(e) => setCourtFormData(prev => ({ ...prev, status: e.target.value }))}
                aria-label="Initial Pitch Status"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="AVAILABLE">AVAILABLE (Open for Bookings)</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsAddCourtModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              rainbowBorder={false}
              isLoading={isCreatingCourt}
              disabled={isCreatingCourt}
            >
              Add Pitch to Venue
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default ClubApprovalsPage;
