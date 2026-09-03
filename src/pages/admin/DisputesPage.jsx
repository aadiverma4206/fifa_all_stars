import React, { useState, useMemo, useRef } from 'react';
import { 
  AlertTriangle, CheckCircle2, Shield, Edit3, Search, Filter, 
  Clock, ArrowUpDown, ChevronRight, User, Building2, Layers, 
  ShieldCheck, Eye, Trophy, Scale, XCircle, FileText, Check, Plus, AlertCircle,
  Camera, Paperclip, X
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import AdminNav from '../../components/admin/AdminNav';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { validateTitle, validateNonEmpty, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import { validateFile, readFileAsDataUrl, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, DEFAULT_MAX_IMAGE_SIZE, formatFileSize } from '../../utils/fileValidationUtils';
import toast from 'react-hot-toast';

export const DisputesPage = () => {
  const { disputes, games, resolveDispute, dismissDispute } = useDataStore();
  const { usersList } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewDisputeModalOpen, setIsNewDisputeModalOpen] = useState(false);

  // Loading & Concurrency Locks
  const [isResolving, setIsResolving] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isCreatingDispute, setIsCreatingDispute] = useState(false);

  const isResolvingRef = useRef(false);
  const isDismissingRef = useRef(false);
  const isCreatingDisputeRef = useRef(false);

  const [winnerTeam, setWinnerTeam] = useState('Team A');
  const [scoreStr, setScoreStr] = useState('Team A 4 - 3 Team B');
  const [adjudicatorNotes, setAdjudicatorNotes] = useState('After reviewing pitch surveillance footage and referee logs, Team A 4th goal is confirmed valid within stoppage time.');

  const [dismissReason, setDismissReason] = useState('Referee whistle was blown prior to ball crossing the goal line as per footage');
  const [customDismissReason, setCustomDismissReason] = useState('');

  const [newDisputeForm, setNewDisputeForm] = useState({
    gameId: games[0]?.id || 'game_1',
    reportedBy: '',
    disputedScore: 'Team A 3 - 3 Team B',
    reason: ''
  });

  // Dispute Evidence Attachment State
  const [disputeEvidenceFile, setDisputeEvidenceFile] = useState(null);
  const [disputeEvidencePreview, setDisputeEvidencePreview] = useState('');
  const disputeFileInputRef = useRef(null);

  const handleDisputeFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setDisputeEvidenceFile(null);
      setDisputeEvidencePreview('');
      return;
    }
    const file = files[0];
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
      maxSizeBytes: DEFAULT_MAX_IMAGE_SIZE,
      fileCategoryName: 'evidence file'
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      if (disputeFileInputRef.current) disputeFileInputRef.current.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDisputeEvidenceFile(file);
      setDisputeEvidencePreview(dataUrl);
      toast.success(`Attached evidence "${file.name}" (${formatFileSize(file.size)})`);
    } catch (err) {
      toast.error(err.message || 'Failed to process evidence file.');
    }
  };

  const stats = useMemo(() => {
    const total = disputes.length;
    const openCount = disputes.filter(d => d.status === 'OPEN' || !d.status).length;
    const resolvedCount = disputes.filter(d => d.status === 'RESOLVED').length;
    const dismissedCount = disputes.filter(d => d.status === 'DISMISSED').length;
    return { total, openCount, resolvedCount, dismissedCount };
  }, [disputes]);

  const filteredDisputes = useMemo(() => {
    return disputes
      .filter(dsp => {
        const matchesSearch = 
          dsp.gameTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dsp.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dsp.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dsp.id?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'OPEN') {
          return dsp.status === 'OPEN' || !dsp.status;
        } else if (statusFilter === 'RESOLVED') {
          return dsp.status === 'RESOLVED';
        } else if (statusFilter === 'DISMISSED') {
          return dsp.status === 'DISMISSED';
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return (b.id || '').localeCompare(a.id || '');
        if (sortBy === 'TITLE') return (a.gameTitle || '').localeCompare(b.gameTitle || '');
        if (sortBy === 'REPORTER') return (a.reportedBy || '').localeCompare(b.reportedBy || '');
        return 0;
      });
  }, [disputes, searchTerm, statusFilter, sortBy]);

  const handleOpenResolve = (dispute) => {
    setSelectedDispute(dispute);
    setWinnerTeam(dispute.winnerOverride || 'Team A');
    setScoreStr(dispute.disputedScore || 'Team A 4 - 3 Team B');
    setAdjudicatorNotes('Reviewed video replay and referee log. Official result confirmed.');
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!selectedDispute || isResolving || isResolvingRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateNonEmpty(scoreStr, 'Official Final Score'), field: 'scoreStr' },
      { check: () => validateNonEmpty(adjudicatorNotes, 'Adjudication Verdict'), field: 'adjudicatorNotes' }
    ]);

    if (!isValid) return;

    isResolvingRef.current = true;
    setIsResolving(true);
    try {
      resolveDispute(selectedDispute.id, winnerTeam, scoreStr.trim(), adjudicatorNotes.trim());
      setIsResolveModalOpen(false);
      setSelectedDispute(null);
    } catch (err) {
      logActionError('handleConfirmResolve', err);
      toast.error(getErrorMessage(err, 'resolving dispute'));
    } finally {
      setIsResolving(false);
      setTimeout(() => {
        isResolvingRef.current = false;
      }, 400);
    }
  };

  const handleOpenDismiss = (dispute) => {
    setSelectedDispute(dispute);
    setDismissReason('Referee whistle was blown prior to ball crossing the goal line as per footage');
    setCustomDismissReason('');
    setIsDismissModalOpen(true);
  };

  const handleConfirmDismiss = async (e) => {
    e.preventDefault();
    if (!selectedDispute || isDismissing || isDismissingRef.current) return;

    if (!checkNetworkOnline()) return;

    if (dismissReason === 'OTHER') {
      const isValid = validateFormAndFocus(e, [
        { check: () => validateNonEmpty(customDismissReason, 'Dismissal Reason'), field: 'customDismissReason' }
      ]);
      if (!isValid) return;
    }

    isDismissingRef.current = true;
    setIsDismissing(true);
    try {
      const finalReason = dismissReason === 'OTHER' ? customDismissReason.trim() : dismissReason;
      dismissDispute(selectedDispute.id, finalReason || 'Dispute dismissed by match commissioner');
      setIsDismissModalOpen(false);
      setSelectedDispute(null);
    } catch (err) {
      logActionError('handleConfirmDismiss', err);
      toast.error(getErrorMessage(err, 'dismissing dispute'));
    } finally {
      setIsDismissing(false);
      setTimeout(() => {
        isDismissingRef.current = false;
      }, 400);
    }
  };

  const handleOpenDetails = (dispute) => {
    setSelectedDispute(dispute);
    setIsDetailModalOpen(true);
  };

  const handleCreateNewDispute = async (e) => {
    e.preventDefault();
    if (isCreatingDispute || isCreatingDisputeRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(newDisputeForm.reportedBy, 'Reporter Name'), field: 'reportedBy' },
      { check: () => validateNonEmpty(newDisputeForm.disputedScore, 'Claimed Scoreline'), field: 'disputedScore' },
      { check: () => validateNonEmpty(newDisputeForm.reason, 'Dispute Grievance Reason'), field: 'reason' }
    ]);

    if (!isValid) return;

    isCreatingDisputeRef.current = true;
    setIsCreatingDispute(true);
    try {
      const game = games.find(g => g.id === newDisputeForm.gameId) || games[0];
      const newEntry = {
        id: `dsp_${Date.now()}`,
        gameId: newDisputeForm.gameId,
        gameTitle: game ? game.title : 'Pickup Super Match',
        reportedBy: newDisputeForm.reportedBy.trim(),
        disputedScore: newDisputeForm.disputedScore.trim(),
        reason: newDisputeForm.reason.trim(),
        status: 'OPEN',
        createdAt: new Date().toISOString().substring(0, 10),
        ...(disputeEvidencePreview ? { evidenceUrl: disputeEvidencePreview, evidenceFileName: disputeEvidenceFile?.name } : {})
      };

      useDataStore.setState(state => ({
        disputes: [newEntry, ...state.disputes]
      }));

      toast.success('New match dispute logged for adjudication!');
      setIsNewDisputeModalOpen(false);
      setDisputeEvidenceFile(null);
      setDisputeEvidencePreview('');
      if (disputeFileInputRef.current) disputeFileInputRef.current.value = '';
    } catch (err) {
      logActionError('handleCreateNewDispute', err);
      toast.error(getErrorMessage(err, 'creating dispute'));
    } finally {
      setIsCreatingDispute(false);
      setTimeout(() => {
        isCreatingDisputeRef.current = false;
      }, 400);
    }
  };

  const getReporterUser = (name) => {
    return usersList.find(u => u.name?.toLowerCase() === name?.toLowerCase()) || null;
  };

  return (
    <div className="space-y-6 py-4 w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <AdminNav />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 bg-sport-500/10 dark:bg-sport-500/20 text-sport-600 dark:text-sport-400 rounded-xl border border-sport-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Match Disputes & Result Overrides
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Review disputed pick-up games, adjudicate match winners, resolve contested scores, and adjust player Elo ratings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {stats.openCount > 0 && (
            <button
              onClick={() => setStatusFilter('OPEN')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{stats.openCount} Disputes Requiring Ruling</span>
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            rainbowBorder={false}
            onClick={() => setIsNewDisputeModalOpen(true)}
            className="rounded-xl font-bold text-xs uppercase shadow-sm"
          >
            Log Incident / Dispute
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' 
              ? 'ring-2 ring-sport-500 bg-sport-50/30 dark:bg-sport-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Disputes</span>
            <Scale className="w-4 h-4 text-sport-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Recorded match grievances
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('OPEN')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'OPEN' 
              ? 'ring-2 ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open for Ruling</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
            {stats.openCount}
            {stats.openCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-[11px] font-bold text-amber-600/90 dark:text-amber-400/90 mt-1">
            {stats.openCount > 0 ? 'Awaiting Commissioner Verdict' : 'All disputes resolved'}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('RESOLVED')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'RESOLVED' 
              ? 'ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overridden & Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.resolvedCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Elo adjusted & points credited
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('DISMISSED')}
          className={`admin-card p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'DISMISSED' 
              ? 'ring-2 ring-slate-500 bg-slate-100 dark:bg-slate-800/40' 
              : 'hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dismissed / Upheld</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.dismissedCount}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Original referee call upheld
          </div>
        </div>
      </div>

      <div className="admin-card p-3.5 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by match title, reporting player, incident keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'ALL', label: `All (${stats.total})` },
            { id: 'OPEN', label: `⚠️ Open (${stats.openCount})` },
            { id: 'RESOLVED', label: `✅ Resolved (${stats.resolvedCount})` },
            { id: 'DISMISSED', label: `🛡️ Dismissed (${stats.dismissedCount})` }
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

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort disputes"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500 transition-all cursor-pointer"
          >
            <option value="NEWEST">Sort: Newest First</option>
            <option value="TITLE">Sort: Match Title</option>
            <option value="REPORTER">Sort: Reporter Name</option>
          </select>
        </div>

      </div>

      <div className="space-y-4">
        {filteredDisputes.length > 0 ? (
          filteredDisputes.map((dsp) => {
            const isResolved = dsp.status === 'RESOLVED';
            const isDismissed = dsp.status === 'DISMISSED';
            const isOpen = !isResolved && !isDismissed;
            const reporter = getReporterUser(dsp.reportedBy);

            return (
              <div 
                key={dsp.id} 
                className="admin-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {dsp.gameTitle}
                      </h3>
                      {isOpen ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" /> OPEN FOR RULING
                        </span>
                      ) : isResolved ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> RULING EXECUTED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> DISMISSED
                        </span>
                      )}
                      <span className="font-mono text-slate-400 text-xs font-semibold">
                        ({dsp.id})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Avatar 
                          src={reporter?.profileImageUrl || reporter?.avatar} 
                          name={dsp.reportedBy || 'Player'} 
                          size="xs" 
                          className="rounded-md" 
                        />
                        <span>Reported by: <strong className="text-slate-900 dark:text-white font-bold">{dsp.reportedBy}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Filed: {dsp.createdAt || 'Recent'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {isOpen ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Scale}
                          rainbowBorder={false}
                          onClick={() => handleOpenResolve(dsp)}
                          className="rounded-xl text-xs font-bold py-2 px-4 shadow-sm"
                        >
                          Adjudicate & Override
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={XCircle}
                          rainbowBorder={false}
                          onClick={() => handleOpenDismiss(dsp)}
                          className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-2 px-3"
                        >
                          Dismiss
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FileText}
                        rainbowBorder={false}
                        onClick={() => handleOpenDetails(dsp)}
                        className="rounded-xl text-xs font-bold py-2 px-3.5"
                      >
                        Commissioner Ledger
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  <div className="md:col-span-2 p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Dispute Grievance Statement
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic">
                      "{dsp.reason}"
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Scoreboard Claim
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {dsp.disputedScore || 'Claimed Score Pending'}
                    </div>
                    {isResolved && dsp.winnerOverride && (
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Winner: {dsp.winnerOverride}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isResolved && dsp.adjudicatorNotes && (
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">Official Ruling Notes:</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{dsp.adjudicatorNotes}</p>
                  </div>
                )}

                {isDismissed && dsp.dismissalReason && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-500">Dismissal Rationale:</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{dsp.dismissalReason}</p>
                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="admin-card p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Match Disputes Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No dispute records match your filter criteria. All match results are validated and undisputed.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                rainbowBorder={false}
                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                className="rounded-xl text-xs font-bold"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Adjudicate & Override Match Result">
        {selectedDispute && (
          <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs font-bold">
            
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {selectedDispute.gameTitle}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Reported by: <strong>{selectedDispute.reportedBy}</strong></span>
                <span className="text-rose-500 font-bold">Claimed: {selectedDispute.disputedScore}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Declared Winner & Elo Allocation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Team A', label: 'Team A Win', desc: '+25 Elo to Team A' },
                  { id: 'Team B', label: 'Team B Win', desc: '+25 Elo to Team B' },
                  { id: 'Draw', label: 'Official Draw', desc: '50/50 Elo split' }
                ].map(w => (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => setWinnerTeam(w.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      winnerTeam === w.id
                        ? 'bg-sport-500/10 border-sport-500 text-sport-600 dark:text-sport-400 ring-1 ring-sport-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs">{w.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{w.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Official Final Scoreline
              </label>
              <input
                name="scoreStr"
                type="text"
                required
                value={scoreStr}
                onChange={(e) => setScoreStr(e.target.value)}
                placeholder="E.g. Team A 4 - 3 Team B"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Commissioner Verdict & Evidence Notes
              </label>
              <textarea
                name="adjudicatorNotes"
                rows={3}
                required
                value={adjudicatorNotes}
                onChange={(e) => setAdjudicatorNotes(e.target.value)}
                placeholder="Log video review details and official reasoning..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                rainbowBorder={false}
                isLoading={isResolving}
                disabled={isResolving}
              >
                Confirm Ruling & Recalculate Elo
              </Button>
            </div>

          </form>
        )}
      </Modal>

      <Modal isOpen={isDismissModalOpen} onClose={() => setIsDismissModalOpen(false)} title="Dismiss Match Dispute">
        {selectedDispute && (
          <form onSubmit={handleConfirmDismiss} className="space-y-4 text-xs font-bold">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Dismissing grievance for: {selectedDispute.gameTitle}</span>
              </div>
              <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                The original on-field referee result will remain active and no Elo modifications will be applied.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Select Dismissal Reason
              </label>
              <select
                name="dismissReason"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                aria-label="Select Dismissal Reason"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
              >
                <option value="Referee whistle was blown prior to ball crossing the goal line as per footage">Referee whistle was blown prior to ball crossing the goal line as per footage</option>
                <option value="Dispute lodged after 24-hour statutory deadline">Dispute lodged after 24-hour statutory deadline</option>
                <option value="Insufficient video evidence to overturn on-field official call">Insufficient video evidence to overturn on-field official call</option>
                <option value="Mutual agreement reached between team captains">Mutual agreement reached between team captains</option>
                <option value="OTHER">Other custom reason</option>
              </select>
            </div>

            {dismissReason === 'OTHER' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Specify Dismissal Reason
                </label>
                <textarea
                  name="customDismissReason"
                  rows={2}
                  required
                  value={customDismissReason}
                  onChange={(e) => setCustomDismissReason(e.target.value)}
                  placeholder="State the exact reason for dismissal..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsDismissModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                icon={XCircle}
                rainbowBorder={false}
                isLoading={isDismissing}
                disabled={isDismissing}
              >
                Confirm Dismissal
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedDispute ? `Ruling Record — ${selectedDispute.id}` : 'Dispute Details'}>
        {selectedDispute && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedDispute.gameTitle}</div>
                  <div className="font-mono text-[11px] text-slate-400">{selectedDispute.id}</div>
                </div>
                <Badge variant={selectedDispute.status === 'RESOLVED' ? 'emerald' : selectedDispute.status === 'DISMISSED' ? 'slate' : 'danger'} size="sm" className="rounded-lg">
                  {selectedDispute.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Reporting Player</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDispute.reportedBy}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Filed Date</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDispute.createdAt || 'Recent'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Contested Score</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDispute.disputedScore}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Overridden Winner</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedDispute.winnerOverride || 'None (Upheld)'}</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Grievance Details</div>
              <div className="text-slate-700 dark:text-slate-300 font-medium mt-1">{selectedDispute.reason}</div>
            </div>

            {selectedDispute.adjudicatorNotes && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs space-y-0.5">
                <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">Commissioner Verdict</div>
                <div className="text-slate-700 dark:text-slate-300 font-medium mt-1">{selectedDispute.adjudicatorNotes}</div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" size="sm" rainbowBorder={false} onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isNewDisputeModalOpen} onClose={() => setIsNewDisputeModalOpen(false)} title="Log New Match Dispute Incident">
        <form onSubmit={handleCreateNewDispute} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Select Match Session</label>
            <select
              name="gameId"
              value={newDisputeForm.gameId}
              onChange={(e) => setNewDisputeForm(prev => ({ ...prev, gameId: e.target.value }))}
              aria-label="Select Match Session"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sport-500"
            >
              {games.map(g => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.format || '5v5'}) - {g.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Reported By (Player / Captain)</label>
            <input
              name="reportedBy"
              type="text"
              required
              value={newDisputeForm.reportedBy}
              onChange={(e) => setNewDisputeForm(prev => ({ ...prev, reportedBy: e.target.value }))}
              placeholder="E.g. Arjun Mehta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Contested / Claimed Scoreline</label>
            <input
              name="disputedScore"
              type="text"
              required
              value={newDisputeForm.disputedScore}
              onChange={(e) => setNewDisputeForm(prev => ({ ...prev, disputedScore: e.target.value }))}
              placeholder="E.g. Team A 4 - 3 Team B"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Dispute Grievance Reason</label>
            <textarea
              name="reason"
              rows={2}
              required
              value={newDisputeForm.reason}
              onChange={(e) => setNewDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Describe the rule infringement or scorekeeping anomaly..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              Attach Evidence Photo / Screenshot (Optional, .jpg, .png, .webp · Max 10 MB)
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={disputeFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleDisputeFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sport-500/10 file:text-sport-600 dark:file:text-sport-400 hover:file:bg-sport-500/20 cursor-pointer"
              />
              {disputeEvidenceFile && (
                <button
                  type="button"
                  onClick={() => {
                    setDisputeEvidenceFile(null);
                    setDisputeEvidencePreview('');
                    if (disputeFileInputRef.current) disputeFileInputRef.current.value = '';
                  }}
                  className="text-rose-500 hover:text-rose-600 text-xs font-bold whitespace-nowrap p-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            {disputeEvidenceFile && (
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Selected: <strong className="text-slate-900 dark:text-white">{disputeEvidenceFile.name}</strong> ({formatFileSize(disputeEvidenceFile.size)})</span>
                <span className="text-emerald-500 font-bold">✓ Evidence Attached</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" rainbowBorder={false} onClick={() => setIsNewDisputeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              rainbowBorder={false}
              isLoading={isCreatingDispute}
              disabled={isCreatingDispute}
            >
              Submit Incident Log
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DisputesPage;
