import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Edit2, ShieldAlert, CheckCircle2, Lock, Wrench,
  Trash2, Building2, DollarSign, Clock, Sparkles, Check, X,
  Search, Filter, RotateCcw, Eye, Camera, Tag, Layers, Activity
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { validateTitle, validatePositiveAmount, validateLength, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import { validateFile, readFileAsDataUrl, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, DEFAULT_MAX_IMAGE_SIZE, formatFileSize } from '../../utils/fileValidationUtils';
import toast from 'react-hot-toast';

const SURFACE_TYPES = [
  '3G Turf',
  'Synthetic Grass',
  'Acrylic',
  'Wooden Parquet',
  'Natural Grass',
  'Hybrid Turf'
];

const ENVIRONMENT_TYPES = ['Outdoor', 'Indoor', 'Covered Roof'];
const FORMAT_OPTIONS = ['5v5', '7v7', '8v8', '11v11', 'Custom'];

const LOCAL_COURT_IMAGES = [
  '/assets/images/courts/court-1.jpg',
  '/assets/images/courts/court-2.jpg',
  '/assets/images/courts/court-3.jpg',
  '/assets/images/courts/court-4.jpg',
  '/assets/images/courts/court-5.jpg',
  '/assets/images/courts/court-6.jpg'
];

export const ManageCourtsPage = () => {
  const { currentUser } = useAuthStore();
  const { clubs, courts, addCourt, updateCourt, deleteCourt, toggleCourtStatus } = useDataStore();

  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id) || c.managerId === currentUser?.id) || clubs[0];
  const myCourts = courts.filter(c => c.clubId === myClub?.id);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [surfaceFilter, setSurfaceFilter] = useState('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);

  // Async Mutation Loading States
  const [isAddingCourt, setIsAddingCourt] = useState(false);
  const [isUpdatingCourt, setIsUpdatingCourt] = useState(false);
  const [togglingCourtId, setTogglingCourtId] = useState(null);
  const [deletingCourtId, setDeletingCourtId] = useState(null);
  const [courtToDelete, setCourtToDelete] = useState(null);

  const isAddingCourtRef = useRef(false);
  const isUpdatingCourtRef = useRef(false);
  const togglingCourtRef = useRef(false);
  const deletingCourtRef = useRef(false);

  // Add Pitch Form State
  const [courtName, setCourtName] = useState('');
  const [type, setType] = useState('Outdoor');
  const [surface, setSurface] = useState('3G Turf');
  const [basePrice, setBasePrice] = useState('500');
  const [format, setFormat] = useState('5v5');
  const [courtImage, setCourtImage] = useState('/assets/images/courts/court-1.jpg');
  const [dimensions, setDimensions] = useState('30m x 15m');
  const [description, setDescription] = useState('');

  // Edit Pitch Form State
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Outdoor');
  const [editSurface, setEditSurface] = useState('3G Turf');
  const [editBasePrice, setEditBasePrice] = useState('500');
  const [editFormat, setEditFormat] = useState('5v5');
  const [editImage, setEditImage] = useState('');
  const [editDimensions, setEditDimensions] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Pitch Photo Upload States
  const [addCourtFile, setAddCourtFile] = useState(null);
  const [editCourtFile, setEditCourtFile] = useState(null);
  const addCourtFileInputRef = useRef(null);
  const editCourtFileInputRef = useRef(null);

  const handleAddCourtFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setAddCourtFile(null);
      return;
    }
    const file = files[0];
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
      maxSizeBytes: DEFAULT_MAX_IMAGE_SIZE,
      fileCategoryName: 'pitch photo'
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      if (addCourtFileInputRef.current) addCourtFileInputRef.current.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAddCourtFile(file);
      setCourtImage(dataUrl);
      toast.success(`Pitch photo "${file.name}" ready (${formatFileSize(file.size)})`);
    } catch (err) {
      toast.error(err.message || 'Failed to read pitch image.');
    }
  };

  const handleEditCourtFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setEditCourtFile(null);
      return;
    }
    const file = files[0];
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
      maxSizeBytes: DEFAULT_MAX_IMAGE_SIZE,
      fileCategoryName: 'pitch photo'
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      if (editCourtFileInputRef.current) editCourtFileInputRef.current.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditCourtFile(file);
      setEditImage(dataUrl);
      toast.success(`Pitch photo "${file.name}" ready (${formatFileSize(file.size)})`);
    } catch (err) {
      toast.error(err.message || 'Failed to read pitch image.');
    }
  };

  // Stats Counters
  const availableCount = myCourts.filter(c => c.status === 'AVAILABLE').length;
  const blockedCount = myCourts.filter(c => c.status === 'BLOCKED').length;
  const maintCount = myCourts.filter(c => c.status === 'MAINTENANCE').length;
  const avgRate = myCourts.length > 0 
    ? Math.round(myCourts.reduce((acc, c) => acc + (parseFloat(c.basePrice) || 0), 0) / myCourts.length)
    : 0;

  // Main Filter Logic
  const filteredCourts = myCourts.filter(court => {
    // Status Filter
    const matchesStatus = statusFilter === 'all' || court.status === statusFilter;

    // Surface Filter
    const matchesSurface = surfaceFilter === 'all' || court.surface?.toLowerCase().includes(surfaceFilter.toLowerCase());

    // Search Filter
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search ||
      court.name?.toLowerCase().includes(search) ||
      court.type?.toLowerCase().includes(search) ||
      court.surface?.toLowerCase().includes(search);

    return matchesStatus && matchesSurface && matchesSearch;
  });

  // Handle Create Pitch
  const handleAddCourt = async (e) => {
    e.preventDefault();
    if (isAddingCourt || isAddingCourtRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(courtName, 'Pitch / Court Name'), field: 'courtName' },
      { check: () => validatePositiveAmount(basePrice, 'Base Hourly Rate', false), field: 'basePrice' },
      { check: () => validateLength(description, 0, 500, 'Description'), field: 'description' }
    ]);

    if (!isValid) return;

    const price = parseFloat(basePrice);

    isAddingCourtRef.current = true;
    setIsAddingCourt(true);
    try {
      addCourt(myClub.id, {
        name: courtName.trim(),
        type,
        surface,
        format,
        basePrice: price,
        image: courtImage || '/assets/images/courts/court-1.jpg',
        dimensions: dimensions.trim() || '30m x 15m',
        description: description.trim()
      });

      setIsAddModalOpen(false);
      setCourtName('');
      setBasePrice('500');
      setDimensions('30m x 15m');
      setDescription('');
      setAddCourtFile(null);
      if (addCourtFileInputRef.current) addCourtFileInputRef.current.value = '';
      toast.success('Pitch added successfully!');
    } catch (err) {
      logActionError('handleAddCourt', err);
      toast.error(getErrorMessage(err, 'creating pitch slot'));
    } finally {
      setIsAddingCourt(false);
      setTimeout(() => {
        isAddingCourtRef.current = false;
      }, 400);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (crt) => {
    setSelectedCourt(crt);
    setEditName(crt.name || '');
    setEditType(crt.type || 'Outdoor');
    setEditSurface(crt.surface || '3G Turf');
    setEditBasePrice(String(crt.basePrice || 500));
    setEditFormat(crt.format || '5v5');
    setEditImage(crt.image || '/assets/images/courts/court-1.jpg');
    setEditDimensions(crt.dimensions || '30m x 15m');
    setEditDescription(crt.description || '');
    setEditCourtFile(null);
    if (editCourtFileInputRef.current) editCourtFileInputRef.current.value = '';
    setIsEditModalOpen(true);
  };
  const handleOpenEdit = handleOpenEditModal;

  // Handle Save Edit
  const handleSaveCourtEdit = async (e) => {
    e.preventDefault();
    if (!selectedCourt || isUpdatingCourt || isUpdatingCourtRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(editName, 'Pitch Name'), field: 'editName' },
      { check: () => validatePositiveAmount(editBasePrice, 'Base Hourly Rate', false), field: 'editBasePrice' },
      { check: () => validateLength(editDescription, 0, 500, 'Description'), field: 'editDescription' }
    ]);

    if (!isValid) return;

    const price = parseFloat(editBasePrice);
    const trimmedName = editName.trim();
    const trimmedDims = editDimensions.trim();
    const trimmedDesc = editDescription.trim();

    // Detect whether anything actually changed
    const hasChanges =
      trimmedName !== (selectedCourt.name || '').trim() ||
      editType !== selectedCourt.type ||
      editSurface !== selectedCourt.surface ||
      editFormat !== selectedCourt.format ||
      price !== (parseFloat(selectedCourt.basePrice) || 0) ||
      editImage !== (selectedCourt.image || '') ||
      trimmedDims !== (selectedCourt.dimensions || '').trim() ||
      trimmedDesc !== (selectedCourt.description || '').trim();

    if (!hasChanges) {
      toast('No changes detected for this pitch.', { icon: 'ℹ️' });
      setIsEditModalOpen(false);
      setSelectedCourt(null);
      return;
    }

    isUpdatingCourtRef.current = true;
    setIsUpdatingCourt(true);
    try {
      updateCourt(selectedCourt.courtId || selectedCourt.id, {
        name: trimmedName,
        type: editType,
        surface: editSurface,
        format: editFormat,
        basePrice: price,
        image: editImage || selectedCourt.image || '/assets/images/courts/court-1.jpg',
        dimensions: trimmedDims || selectedCourt.dimensions,
        description: trimmedDesc || selectedCourt.description
      });

      setIsEditModalOpen(false);
      setSelectedCourt(null);
      setEditCourtFile(null);
      if (editCourtFileInputRef.current) editCourtFileInputRef.current.value = '';
    } catch (err) {
      logActionError('handleSaveCourtEdit', err);
      toast.error(getErrorMessage(err, 'updating pitch details'));
    } finally {
      setIsUpdatingCourt(false);
      setTimeout(() => {
        isUpdatingCourtRef.current = false;
      }, 400);
    }
  };

  const handleToggleStatus = async (courtId, status) => {
    if (togglingCourtId || togglingCourtRef.current) return;

    if (!checkNetworkOnline()) return;

    togglingCourtRef.current = true;
    setTogglingCourtId(courtId);
    try {
      toggleCourtStatus(courtId, status);
    } catch (err) {
      logActionError('handleToggleStatus', err);
      toast.error(getErrorMessage(err, 'changing pitch status'));
    } finally {
      setTogglingCourtId(null);
      setTimeout(() => {
        togglingCourtRef.current = false;
      }, 400);
    }
  };

  const handleRequestDeleteCourt = (court) => {
    if (deletingCourtId || deletingCourtRef.current) return;
    setCourtToDelete(court);
  };

  const handleConfirmDeleteCourt = async () => {
    if (!courtToDelete || deletingCourtId || deletingCourtRef.current) return;

    if (!checkNetworkOnline()) return;

    const court = courtToDelete;
    deletingCourtRef.current = true;
    setCourtToDelete(null);
    setDeletingCourtId(court.courtId || court.id);
    try {
      deleteCourt(court.courtId || court.id);
      toast.success(`Pitch "${court.name}" removed successfully.`);
    } catch (err) {
      logActionError('handleConfirmDeleteCourt', err);
      toast.error(getErrorMessage(err, 'removing pitch'));
    } finally {
      setDeletingCourtId(null);
      setTimeout(() => {
        deletingCourtRef.current = false;
      }, 400);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSurfaceFilter('all');
  };

  return (
    <div className="space-y-6 py-4 max-w-[1700px] w-full mx-auto px-2 sm:px-4">

      {/* ═══ TOP HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-sport-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{myClub?.name || 'Club Venue'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Manage Courts & Pitch Slots
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Configure individual pitches, set hourly base rates, control peak multipliers, and toggle live slot availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link to="/club/pricing">
            <Button
              variant="outline"
              size="md"
              icon={DollarSign}
              className="border-slate-300 dark:border-slate-700 text-xs font-bold"
            >
              Peak Pricing Engine
            </Button>
          </Link>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-lg shadow-sport-500/20 text-xs font-black"
          >
            Add New Pitch
          </Button>
        </div>
      </div>

      {/* ═══ KPI SUMMARY STATS CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {[
          { label: 'Total Pitches', value: myCourts.length, sub: 'Configured in venue', color: 'text-sport-500', bg: 'bg-sport-500/10 border-sport-500/20', filter: 'all' },
          { label: 'Available Now', value: availableCount, sub: 'Open for booking', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', filter: 'AVAILABLE' },
          { label: 'Blocked / Reserved', value: blockedCount, sub: 'Locked by manager', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20', filter: 'BLOCKED' },
          { label: 'Under Maintenance', value: maintCount, sub: 'Repairs in progress', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', filter: 'MAINTENANCE' },
          { label: 'Avg Hourly Rate', value: `₹${avgRate}`, sub: 'Base rate average', color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/20', filter: 'all' },
        ].map(stat => (
          <div
            key={stat.label}
            onClick={() => setStatusFilter(stat.filter)}
            className={`admin-card admin-card-hover p-4 rounded-xl border ${stat.bg} cursor-pointer transition-all ${statusFilter === stat.filter && stat.filter !== 'all' ? 'ring-2 ring-sport-500 shadow-md' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className={`block text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">➔</span>
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block mt-1 uppercase tracking-wide">{stat.label}</span>
            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* ═══ FILTER & SEARCH TOOLBAR ═══ */}
      <div className="admin-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pitches by name, surface (3G, Synthetic), environment (Indoor/Outdoor)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
            />
          </div>

          {/* Quick Clear */}
          {(searchTerm || statusFilter !== 'all' || surfaceFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Status Filter Buttons & Surface Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { key: 'all', label: `All Pitches (${myCourts.length})` },
              { key: 'AVAILABLE', label: `🟢 Available (${availableCount})` },
              { key: 'BLOCKED', label: `🔒 Blocked (${blockedCount})` },
              { key: 'MAINTENANCE', label: `🔧 Maintenance (${maintCount})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-sport-500 text-white shadow-xs font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Surface:</span>
            {['all', '3G Turf', 'Synthetic', 'Acrylic'].map(surf => (
              <button
                key={surf}
                onClick={() => setSurfaceFilter(surf)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  surfaceFilter === surf
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {surf === 'all' ? 'All Surfaces' : surf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RESPONSIVE PITCH CARDS GRID (3 Columns on Wide Screens) ═══ */}
      {filteredCourts.length === 0 ? (
        <div className="admin-card p-12 sm:p-16 text-center space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-3xl">🏟️</div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Pitches Found</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              No courts match your search or filters. Click "Add New Pitch" to add your venue courts.
            </p>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add New Pitch
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourts.map((court, idx) => {
            const isAvail = court.status === 'AVAILABLE';
            const isBlocked = court.status === 'BLOCKED';
            const isMaint = court.status === 'MAINTENANCE';
            const peakMultiplier = court.peakMultiplier || 1.5;
            const peakPrice = Math.round(court.basePrice * peakMultiplier);

            return (
              <motion.div
                key={court.courtId || court.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="admin-card admin-card-hover rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between group"
              >
                {/* Pitch Image Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                  <img
                    src={court.image || LOCAL_COURT_IMAGES[idx % LOCAL_COURT_IMAGES.length]}
                    alt={court.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { 
                      e.target.onerror = null;
                      e.target.src = '/assets/images/courts/court-1.jpg'; 
                    }}
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <Badge variant={court.type === 'Indoor' ? 'blue' : 'emerald'} size="sm" className="shadow-md font-black">
                      {court.type}
                    </Badge>
                    <Badge variant="gold" size="sm" className="shadow-md font-black">
                      {court.surface}
                    </Badge>
                  </div>

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 right-3">
                    {isAvail ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/90 backdrop-blur-md text-white font-black text-[10px] uppercase shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Available</span>
                      </span>
                    ) : isBlocked ? (
                      <span className="px-2.5 py-1 rounded-md bg-rose-600/90 backdrop-blur-md text-white font-black text-[10px] uppercase shadow-md flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Blocked</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] uppercase shadow-md flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        <span>Maintenance</span>
                      </span>
                    )}
                  </div>

                  {/* Format & Dimensions Bar */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-black text-white/90 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                    <span>⚽ Format: {court.format || '5v5'}</span>
                    <span>📏 {court.dimensions || '30m x 15m'}</span>
                  </div>
                </div>

                {/* Pitch Body Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight truncate">
                        {court.name}
                      </h3>
                      <button
                        onClick={() => handleOpenEdit(court)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sport-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Pitch Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                      {court.description || 'All-weather FIFA standard multi-purpose pitch with shock pad underlayment.'}
                    </p>
                  </div>

                  {/* Hourly Rate & Pricing Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider">Base Rate:</span>
                      <span className="text-xl font-black text-sport-500">₹{court.basePrice}<span className="text-xs font-semibold text-slate-400">/hr</span></span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-3 h-3" />
                        Peak Rate ({peakMultiplier}x):
                      </span>
                      <span className="font-black text-slate-800 dark:text-slate-200">₹{peakPrice}/hr</span>
                    </div>
                  </div>

                  {/* Interactive Status Switcher (Available, Blocked, Maintenance) */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Toggle Availability Status</span>
                    
                    <div className="grid grid-cols-3 gap-1.5 text-xs font-extrabold">
                      <button
                        type="button"
                        disabled={togglingCourtId === (court.courtId || court.id)}
                        onClick={() => handleToggleStatus(court.courtId || court.id, 'AVAILABLE')}
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-50 ${
                          isAvail 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md font-black' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {togglingCourtId === (court.courtId || court.id) ? <span className="animate-spin text-[10px]">⏳</span> : <CheckCircle2 className="w-3 h-3" />}
                        <span>Available</span>
                      </button>

                      <button
                        type="button"
                        disabled={togglingCourtId === (court.courtId || court.id)}
                        onClick={() => handleToggleStatus(court.courtId || court.id, 'BLOCKED')}
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-50 ${
                          isBlocked 
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md font-black' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {togglingCourtId === (court.courtId || court.id) ? <span className="animate-spin text-[10px]">⏳</span> : <Lock className="w-3 h-3" />}
                        <span>Blocked</span>
                      </button>

                      <button
                        type="button"
                        disabled={togglingCourtId === (court.courtId || court.id)}
                        onClick={() => handleToggleStatus(court.courtId || court.id, 'MAINTENANCE')}
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-50 ${
                          isMaint 
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {togglingCourtId === (court.courtId || court.id) ? <span className="animate-spin text-[10px]">⏳</span> : <Wrench className="w-3 h-3" />}
                        <span>Maint.</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Hub Footer */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleOpenEdit(court)}
                      className="text-xs font-bold flex-1"
                    >
                      Edit Pitch
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      isLoading={deletingCourtId === (court.courtId || court.id)}
                      disabled={deletingCourtId !== null}
                      onClick={() => handleRequestDeleteCourt(court)}
                      className="text-xs font-bold px-2.5"
                      title="Remove Pitch"
                    >
                      Delete
                    </Button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ ADD PITCH MODAL ═══ */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="🏟️ Add New Pitch / Court Slot" maxWidth="max-w-xl">
        <form onSubmit={handleAddCourt} className="space-y-4 text-xs font-bold">
          
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Pitch Name *
            </label>
            <input
              name="courtName"
              type="text"
              placeholder="e.g. Pitch Charlie (5v5)"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Environment
              </label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {ENVIRONMENT_TYPES.map(env => <option key={env} value={env}>{env}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Surface Type
              </label>
              <select
                name="surface"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {SURFACE_TYPES.map(surf => <option key={surf} value={surf}>{surf}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Format
              </label>
              <select
                name="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {FORMAT_OPTIONS.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Base Hourly Price (₹/hr) *
              </label>
              <input
                name="basePrice"
                type="number"
                min="50"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Pitch Dimensions
            </label>
            <input
              name="dimensions"
              type="text"
              placeholder="e.g. 30m x 15m"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Upload Pitch Photo (.jpg, .png, .webp · Max 10 MB)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={addCourtFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAddCourtFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sport-500/10 file:text-sport-600 dark:file:text-sport-400 hover:file:bg-sport-500/20 cursor-pointer"
              />
              {addCourtFile && (
                <button
                  type="button"
                  onClick={() => {
                    setAddCourtFile(null);
                    setCourtImage('/assets/images/courts/court-1.jpg');
                    if (addCourtFileInputRef.current) addCourtFileInputRef.current.value = '';
                  }}
                  className="text-rose-500 hover:text-rose-600 text-xs font-bold whitespace-nowrap p-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            {addCourtFile && (
              <div className="mb-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Selected: <strong className="text-slate-900 dark:text-white">{addCourtFile.name}</strong> ({formatFileSize(addCourtFile.size)})</span>
                <span className="text-emerald-500 font-bold">✓ Loaded</span>
              </div>
            )}
            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1.5 uppercase font-bold">
              Or Choose from Presets:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {LOCAL_COURT_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => { setCourtImage(img); setAddCourtFile(null); }}
                  className={`h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    courtImage === img ? 'border-sport-500 ring-2 ring-sport-500' : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Pitch ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Special pitch features, netting, lighting notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAddingCourt}
              disabled={isAddingCourt}
              className="shadow-md"
            >
              ✅ Create Pitch Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══ EDIT PITCH MODAL ═══ */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="✏️ Edit Pitch & Pricing Settings" maxWidth="max-w-xl">
        <form onSubmit={handleSaveCourtEdit} className="space-y-4 text-xs font-bold">
          
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Pitch Name *
            </label>
            <input
              name="editName"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Environment
              </label>
              <select
                name="editType"
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {ENVIRONMENT_TYPES.map(env => <option key={env} value={env}>{env}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Surface Type
              </label>
              <select
                name="editSurface"
                value={editSurface}
                onChange={(e) => setEditSurface(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {SURFACE_TYPES.map(surf => <option key={surf} value={surf}>{surf}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Format
              </label>
              <select
                name="editFormat"
                value={editFormat}
                onChange={(e) => setEditFormat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
              >
                {FORMAT_OPTIONS.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
                Base Hourly Price (₹/hr) *
              </label>
              <input
                name="editBasePrice"
                type="number"
                min="50"
                value={editBasePrice}
                onChange={(e) => setEditBasePrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Pitch Dimensions
            </label>
            <input
              name="editDimensions"
              type="text"
              value={editDimensions}
              onChange={(e) => setEditDimensions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Upload New Pitch Photo (.jpg, .png, .webp · Max 10 MB)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={editCourtFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleEditCourtFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sport-500/10 file:text-sport-600 dark:file:text-sport-400 hover:file:bg-sport-500/20 cursor-pointer"
              />
              {editCourtFile && (
                <button
                  type="button"
                  onClick={() => {
                    setEditCourtFile(null);
                    setEditImage(selectedCourt?.image || '/assets/images/courts/court-1.jpg');
                    if (editCourtFileInputRef.current) editCourtFileInputRef.current.value = '';
                  }}
                  className="text-rose-500 hover:text-rose-600 text-xs font-bold whitespace-nowrap p-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            {editCourtFile && (
              <div className="mb-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Selected: <strong className="text-slate-900 dark:text-white">{editCourtFile.name}</strong> ({formatFileSize(editCourtFile.size)})</span>
                <span className="text-emerald-500 font-bold">✓ Loaded</span>
              </div>
            )}
            <label className="block text-slate-700 dark:text-slate-300 mb-1 uppercase font-bold text-[11px]">
              Or Pitch Cover Image URL / Presets
            </label>
            <input
              name="editImage"
              type="text"
              value={editImage}
              onChange={(e) => setEditImage(e.target.value)}
              placeholder="Image URL or choose below"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none"
            />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
              {LOCAL_COURT_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => { setEditImage(img); setEditCourtFile(null); }}
                  className={`h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    editImage === img ? 'border-sport-500 ring-2 ring-sport-500' : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Pitch ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-black">
              Description
            </label>
            <textarea
              name="editDescription"
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              isLoading={isUpdatingCourt}
              disabled={isUpdatingCourt}
              className="shadow-md"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══ DELETE PITCH CONFIRM MODAL ═══ */}
    <Modal
      isOpen={!!courtToDelete}
      onClose={() => { if (!deletingCourtId) setCourtToDelete(null); }}
      title="🗑️ Remove Pitch / Court Slot"
      maxWidth="max-w-md"
    >
      {courtToDelete && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-2">
            <p className="text-sm font-bold">Are you sure you want to permanently remove this pitch?</p>
            <p className="text-xs font-semibold opacity-80">This cannot be undone. Any active bookings on this pitch may be affected.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-400">Pitch Name:</span>
              <span className="text-slate-900 dark:text-white font-bold">{courtToDelete.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Surface:</span>
              <span className="text-slate-700 dark:text-slate-300">{courtToDelete.surface} · {courtToDelete.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Base Rate:</span>
              <span className="text-sport-500 font-bold">₹{courtToDelete.basePrice}/hr</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCourtToDelete(null)}
              className="w-full sm:flex-1 border border-slate-200 dark:border-slate-700 justify-center"
            >
              Keep Pitch
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              isLoading={!!deletingCourtId}
              disabled={!!deletingCourtId}
              onClick={handleConfirmDeleteCourt}
              className="w-full sm:flex-1 justify-center"
            >
              Yes, Remove Pitch
            </Button>
          </div>
        </div>
      )}
    </Modal>
    </div>
  );
};

export default ManageCourtsPage;
