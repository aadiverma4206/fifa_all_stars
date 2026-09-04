import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Shield, ArrowLeft, Send, CheckCircle, Trophy, UserCheck, AlertTriangle, CreditCard, Lock, Play, Film, Plus, Edit2, Trash2 } from 'lucide-react';
import { useDataStore, MATCH_FORMAT_SLOTS } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { validateTitle, validateTimeRange, validatePositiveAmount, validateIntegerRange, validateUrl, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import { validateFile, readFileAsDataUrl, ALLOWED_VIDEO_TYPES, ALLOWED_VIDEO_EXTENSIONS, DEFAULT_MAX_VIDEO_SIZE, formatFileSize } from '../../utils/fileValidationUtils';
import toast from 'react-hot-toast';

export const GameDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { games, gameVideos, joinGame, leaveGame, submitGameScore, updateLiveScore, updateGameLifecycle, addGameVideo, switchPlayerTeam, updateGameDetails, removeGame } = useDataStore();
  const { currentUser, updateWallet, usersList, setCurrentUser } = useAuthStore();

  const [scoreTeamA, setScoreTeamA] = useState('');
  const [scoreTeamB, setScoreTeamB] = useState('');
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  // Live Score Modal State (Screen Score Only)
  const [isLiveScoreModalOpen, setIsLiveScoreModalOpen] = useState(false);
  const [liveScoreTeamA, setLiveScoreTeamA] = useState('');
  const [liveScoreTeamB, setLiveScoreTeamB] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('TEAM_A');

  // Edit Game Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('19:00');
  const [editEndTime, setEditEndTime] = useState('20:30');
  const [editFormat, setEditFormat] = useState('5v5');
  const [editMaxPlayers, setEditMaxPlayers] = useState('10');
  const [editEntryFee, setEditEntryFee] = useState('0');
  const [editSkill, setEditSkill] = useState('Intermediate');
  const [editPrivacy, setEditPrivacy] = useState('PUBLIC');
  const [editDescription, setEditDescription] = useState('');

  // Video Upload Form States
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoFileInputRef = useRef(null);

  const handleVideoFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setVideoFile(null);
      return;
    }
    const file = files[0];
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_VIDEO_TYPES,
      allowedExtensions: ALLOWED_VIDEO_EXTENSIONS,
      maxSizeBytes: DEFAULT_MAX_VIDEO_SIZE,
      fileCategoryName: 'video'
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
      setVideoFile(null);
      return;
    }

    // Duplicate check
    const isDuplicate = (gameVideos || []).some(
      v => v.gameId === game?.id && v.title?.toLowerCase().trim() === file.name.toLowerCase().trim()
    );
    if (isDuplicate) {
      toast.error(`"${file.name}" has already been uploaded for this match.`);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    if (!videoTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setVideoTitle(cleanName);
    }
    toast.success(`Video "${file.name}" selected (${formatFileSize(file.size)})`);
  };

  // Button Safety & Loading States
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isSubmittingLiveScore, setIsSubmittingLiveScore] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSwitchingTeam, setIsSwitchingTeam] = useState(false);

  // Concurrency Mutex Refs
  const isJoiningRef = useRef(false);
  const isLeavingRef = useRef(false);
  const isSubmittingScoreRef = useRef(false);
  const isSubmittingLiveScoreRef = useRef(false);
  const isSubmittingEditRef = useRef(false);
  const isSubmittingVideoRef = useRef(false);
  const isActionLoadingRef = useRef(false);
  const isSwitchingTeamRef = useRef(false);

  // Confirmation Modal States
  const [isCancelMatchModalOpen, setIsCancelMatchModalOpen] = useState(false);
  const [isLeaveMatchModalOpen, setIsLeaveMatchModalOpen] = useState(false);

  const game = games.find(g => g.id === id) || games[0];
  const maxSlots = game?.maxPlayers || MATCH_FORMAT_SLOTS[game?.format] || 10;
  const teamCapacity = Math.ceil(maxSlots / 2);

  const confirmedPlayers = game?.confirmedPlayers || [];
  const teamAPlayers = confirmedPlayers.filter((p, i) => p.team === 'TEAM_A' || (!p.team && i < teamCapacity));
  const teamBPlayers = confirmedPlayers.filter((p, i) => p.team === 'TEAM_B' || (!p.team && i >= teamCapacity));

  const spotsLeft = Math.max(0, maxSlots - confirmedPlayers.length);
  const isConfirmed = confirmedPlayers.some(p => p.id === currentUser?.id);
  const isWaitlisted = game?.waitlist?.some(p => p.id === currentUser?.id);
  const waitlistIndex = game?.waitlist?.findIndex(p => p.id === currentUser?.id);
  const isFull = confirmedPlayers.length >= maxSlots || game?.status === 'FULL';
  const isGameCompleted = game?.status === 'COMPLETED' || (game?.score !== null && game?.score !== undefined && game?.score?.teamA !== null && game?.score?.teamA !== undefined);
  const linkedVideos = (gameVideos || []).filter(v => v.gameId === game?.id);
  const hasLinkedVideo = linkedVideos.length > 0 || !!game?.videoReference;
  const isManagerOrAdmin = currentUser?.role === 'CLUB_MANAGER' || currentUser?.role === 'SUPER_ADMIN';
  const canUploadVideo = isManagerOrAdmin || !hasLinkedVideo;
  const isAuthorizedManager = isManagerOrAdmin || game?.organizer?.id === currentUser?.id;

  const handleOpenEditModal = () => {
    setEditTitle(game.title || '');
    setEditDate(game.dateTime?.date || '');
    setEditStartTime(game.dateTime?.startTime || '19:00');
    setEditEndTime(game.dateTime?.endTime || '20:30');
    setEditFormat(game.format || '5v5');
    setEditMaxPlayers(String(game.maxPlayers || 10));
    setEditEntryFee(String(game.entryFee || 0));
    setEditSkill(game.skill || 'Intermediate');
    setEditPrivacy(game.privacy || 'PUBLIC');
    setEditDescription(game.description || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditGame = async (e) => {
    e.preventDefault();
    if (isSubmittingEdit || isSubmittingEditRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateTitle(editTitle, 'Game Name'), field: 'editTitle' },
      { check: () => validateTimeRange(editStartTime, editEndTime), field: 'editStartTime' },
      { check: () => validateIntegerRange(editMaxPlayers, 2, 50, 'Max Players'), field: 'editMaxPlayers' },
      { check: () => validatePositiveAmount(editEntryFee, 'Entry Fee', true), field: 'editEntryFee' }
    ]);

    if (!isValid) return;

    const feeVal = parseFloat(editEntryFee) || 0;
    const computedSlots = parseInt(editMaxPlayers, 10) || MATCH_FORMAT_SLOTS[editFormat] || 10;
    const trimmedTitle = editTitle.trim();
    const trimmedDesc = editDescription.trim();

    // Detect whether anything actually changed
    const hasChanges =
      trimmedTitle !== (game?.title || '').trim() ||
      editFormat !== game?.format ||
      computedSlots !== (game?.maxPlayers || MATCH_FORMAT_SLOTS[game?.format] || 10) ||
      feeVal !== (game?.entryFee || 0) ||
      editSkill !== game?.skill ||
      editPrivacy !== game?.privacy ||
      editDate !== game?.dateTime?.date ||
      editStartTime !== game?.dateTime?.startTime ||
      editEndTime !== game?.dateTime?.endTime ||
      trimmedDesc !== (game?.description || '').trim();

    if (!hasChanges) {
      toast('No changes detected for this match.', { icon: 'ℹ️' });
      setIsEditModalOpen(false);
      return;
    }

    isSubmittingEditRef.current = true;
    setIsSubmittingEdit(true);
    try {
      updateGameDetails(game.id, {
        title: trimmedTitle,
        format: editFormat,
        maxPlayers: computedSlots,
        entryFee: feeVal,
        skill: editSkill,
        privacy: editPrivacy,
        dateTime: {
          date: editDate,
          startTime: editStartTime,
          endTime: editEndTime
        },
        description: trimmedDesc
      });

      setIsEditModalOpen(false);
      toast.success('Match details updated!');
    } catch (err) {
      logActionError('handleSaveEditGame', err);
      toast.error(getErrorMessage(err, 'updating game details'));
    } finally {
      setIsSubmittingEdit(false);
      setTimeout(() => {
        isSubmittingEditRef.current = false;
      }, 400);
    }
  };

  const matchVideo = (gameVideos || []).find(v => v.gameId === game?.id);

  const handleOpenPaymentModal = () => {
    if (!currentUser) {
      toast.error('Please sign in to join pick-up matches.');
      navigate('/login');
      return;
    }
    if (currentUser.role === 'CLUB_MANAGER') {
      toast.error('Club Managers are not allowed to join games as players.');
      return;
    }
    // Default to the team with fewer players if needed
    if (teamAPlayers.length >= teamCapacity && teamBPlayers.length < teamCapacity) {
      setSelectedTeam('TEAM_B');
    } else {
      setSelectedTeam('TEAM_A');
    }
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPaymentAndJoin = async (e) => {
    e.preventDefault();
    if (!currentUser || isJoining || isJoiningRef.current) return;

    if (!checkNetworkOnline()) return;

    const fee = game.entryFee || 0;

    if (fee > 0 && (currentUser.walletBalance || 0) < fee) {
      toast.error(`Insufficient wallet balance! Match fee is ₹${fee}. Top up in Profile.`);
      return;
    }

    isJoiningRef.current = true;
    setIsJoining(true);
    try {
      const res = joinGame(game.id, currentUser, selectedTeam);

      if (res && res.success) {
        if (fee > 0) {
          updateWallet(-fee, `Entry Fee: ${game.title}`);
        }
        toast.success(fee > 0
          ? `Payment of ₹${fee} confirmed! ${res.message || 'Slot reserved.'}`
          : `${res.message || 'You have joined the match roster!'}`);
        setIsPaymentModalOpen(false);
      } else {
        const safeMsg = (res?.message && res.message.length < 200)
          ? res.message
          : 'Unable to join match. Please try again.';
        toast.error(safeMsg);
      }
    } catch (err) {
      logActionError('handleConfirmPaymentAndJoin', err);
      toast.error(getErrorMessage(err, 'joining match'));
    } finally {
      setIsJoining(false);
      setTimeout(() => {
        isJoiningRef.current = false;
      }, 400);
    }
  };

  const handleLeaveMatch = async () => {
    if (isLeaving || isLeavingRef.current) return;
    if (!checkNetworkOnline()) return;

    isLeavingRef.current = true;
    setIsLeaving(true);
    try {
      leaveGame(game.id, currentUser.id);
      if (game.entryFee > 0) {
        updateWallet(game.entryFee, `Refund: Left match ${game.title}`);
        toast.success(`You have left the match. ₹${game.entryFee} has been refunded to your wallet.`);
      } else {
        toast.success('You have left the match roster.');
      }
      setIsLeaveMatchModalOpen(false);
    } catch (err) {
      logActionError('handleLeaveMatch', err);
      toast.error(getErrorMessage(err, 'leaving match'));
    } finally {
      setIsLeaving(false);
      setTimeout(() => {
        isLeavingRef.current = false;
      }, 400);
    }
  };

  const handleRequestCancelMatch = () => {
    if (isActionLoading || isActionLoadingRef.current) return;
    setIsCancelMatchModalOpen(true);
  };

  const handleConfirmCancelMatch = async () => {
    if (isActionLoading || isActionLoadingRef.current) return;
    if (!checkNetworkOnline()) return;

    isActionLoadingRef.current = true;
    setIsActionLoading(true);
    try {
      removeGame(game.id, 'Cancelled by venue manager');
      toast.success(`Match session "${game.title}" has been cancelled and removed.`);
      setIsCancelMatchModalOpen(false);
      navigate('/games');
    } catch (err) {
      logActionError('handleConfirmCancelMatch', err);
      toast.error(getErrorMessage(err, 'cancelling match'));
    } finally {
      setIsActionLoading(false);
      setTimeout(() => {
        isActionLoadingRef.current = false;
      }, 400);
    }
  };

  const handleStartMatch = () => {
    if (isActionLoading || isActionLoadingRef.current) return;
    if (!checkNetworkOnline()) return;

    isActionLoadingRef.current = true;
    setIsActionLoading(true);
    try {
      updateGameLifecycle(game.id, 'ONGOING');
      toast.success('Match is now LIVE! Good luck to both teams.');
    } catch (err) {
      logActionError('handleStartMatch', err);
      toast.error(getErrorMessage(err, 'starting match'));
    } finally {
      setTimeout(() => {
        setIsActionLoading(false);
        isActionLoadingRef.current = false;
      }, 500);
    }
  };

  const handleOpenLiveScoreModal = () => {
    if (game?.liveScore) {
      setLiveScoreTeamA(game.liveScore.teamA !== undefined ? String(game.liveScore.teamA) : '0');
      setLiveScoreTeamB(game.liveScore.teamB !== undefined ? String(game.liveScore.teamB) : '0');
    } else if (game?.score) {
      setLiveScoreTeamA(String(game.score.teamA));
      setLiveScoreTeamB(String(game.score.teamB));
    } else {
      setLiveScoreTeamA('0');
      setLiveScoreTeamB('0');
    }
    setIsLiveScoreModalOpen(true);
  };

  const handleSubmitLiveScore = (e) => {
    e.preventDefault();
    if (isSubmittingLiveScore || isSubmittingLiveScoreRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateIntegerRange(liveScoreTeamA, 0, 99, 'Team A Live Goals'), field: 'liveScoreTeamA' },
      { check: () => validateIntegerRange(liveScoreTeamB, 0, 99, 'Team B Live Goals'), field: 'liveScoreTeamB' }
    ]);

    if (!isValid) return;

    const scoreA = parseInt(liveScoreTeamA, 10);
    const scoreB = parseInt(liveScoreTeamB, 10);

    // Change Detection: if live score is already exactly identical
    if (game?.liveScore && game.liveScore.teamA === scoreA && game.liveScore.teamB === scoreB) {
      toast('Live score is already up to date.', { icon: 'ℹ️' });
      setIsLiveScoreModalOpen(false);
      return;
    }

    isSubmittingLiveScoreRef.current = true;
    setIsSubmittingLiveScore(true);
    try {
      updateLiveScore(game.id, { teamAScore: scoreA, teamBScore: scoreB }, currentUser?.name || 'Host');
      setIsLiveScoreModalOpen(false);
      toast.success('Live score updated!');
    } catch (err) {
      logActionError('handleSubmitLiveScore', err);
      toast.error(getErrorMessage(err, 'updating live score'));
    } finally {
      setIsSubmittingLiveScore(false);
      setTimeout(() => {
        isSubmittingLiveScoreRef.current = false;
      }, 400);
    }
  };

  const handleOpenScoreModal = () => {
    if (game?.score) {
      setScoreTeamA(game.score.teamA !== undefined ? String(game.score.teamA) : '');
      setScoreTeamB(game.score.teamB !== undefined ? String(game.score.teamB) : '');
    } else if (game?.liveScore) {
      setScoreTeamA(String(game.liveScore.teamA));
      setScoreTeamB(String(game.liveScore.teamB));
    } else {
      setScoreTeamA('');
      setScoreTeamB('');
    }
    setIsScoreModalOpen(true);
  };

  const handleSubmitScore = (e) => {
    e.preventDefault();
    if (isSubmittingScore || isSubmittingScoreRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e, [
      { check: () => validateIntegerRange(scoreTeamA, 0, 99, 'Team A Final Goals'), field: 'scoreTeamA' },
      { check: () => validateIntegerRange(scoreTeamB, 0, 99, 'Team B Final Goals'), field: 'scoreTeamB' }
    ]);

    if (!isValid) return;

    const scoreA = parseInt(scoreTeamA, 10);
    const scoreB = parseInt(scoreTeamB, 10);

    // Change Detection: if final score has already been submitted with identical numbers
    if (game?.score && game.score.teamA === scoreA && game.score.teamB === scoreB && game.status === 'COMPLETED') {
      toast('Final match score is already recorded.', { icon: 'ℹ️' });
      setIsScoreModalOpen(false);
      return;
    }

    isSubmittingScoreRef.current = true;
    setIsSubmittingScore(true);
    try {
      submitGameScore(game.id, { teamAScore: scoreA, teamBScore: scoreB }, usersList, (updatedUsers) => {
        if (currentUser?.id) {
          const myUpdated = updatedUsers?.find(u => u.id === currentUser.id);
          if (myUpdated) setCurrentUser(myUpdated);
        }
      }, currentUser?.name || 'Host');
      setIsScoreModalOpen(false);
    } catch (err) {
      logActionError('handleSubmitScore', err);
      toast.error(getErrorMessage(err, 'submitting match score'));
    } finally {
      setIsSubmittingScore(false);
      setTimeout(() => {
        isSubmittingScoreRef.current = false;
      }, 400);
    }
  };

  const handleAddVideoSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingVideo || isSubmittingVideoRef.current) return;

    if (!checkNetworkOnline()) return;

    if (videoFile) {
      const fileCheck = validateFile(videoFile, {
        allowedTypes: ALLOWED_VIDEO_TYPES,
        allowedExtensions: ALLOWED_VIDEO_EXTENSIONS,
        maxSizeBytes: DEFAULT_MAX_VIDEO_SIZE,
        fileCategoryName: 'video'
      });
      if (!fileCheck.isValid) {
        toast.error(fileCheck.message);
        return;
      }
    } else {
      const isValid = validateFormAndFocus(e, [
        { check: () => validateTitle(videoTitle, 'Video Title'), field: 'videoTitle' },
        { check: () => validateUrl(videoUrl, 'Video URL'), field: 'videoUrl' }
      ]);
      if (!isValid) return;
    }

    isSubmittingVideoRef.current = true;
    setIsSubmittingVideo(true);
    setUploadProgress(0);
    try {
      let finalVideoUrl = videoUrl.trim();
      if (videoFile) {
        finalVideoUrl = await readFileAsDataUrl(videoFile, (percent) => {
          setUploadProgress(percent);
        });
      }

      addGameVideo({
        gameId: game.id,
        clubId: game.venueReference?.clubId,
        courtId: game.venueReference?.courtId,
        title: videoTitle.trim(),
        videoUrl: finalVideoUrl,
        description: videoDesc.trim() || (videoFile ? `Uploaded file: ${videoFile.name} (${formatFileSize(videoFile.size)})` : 'Official match footage'),
        uploadedBy: `${currentUser.name} (${currentUser.role})`
      });

      toast.success(videoFile ? `Video "${videoFile.name}" uploaded & linked!` : 'Match video linked successfully!');
      setIsVideoModalOpen(false);
      setVideoTitle('');
      setVideoFile(null);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    } catch (err) {
      logActionError('handleAddVideoSubmit', err);
      toast.error(getErrorMessage(err, 'uploading video'));
    } finally {
      setIsSubmittingVideo(false);
      setUploadProgress(0);
      setTimeout(() => {
        isSubmittingVideoRef.current = false;
      }, 400);
    }
  };

  const handleSwitchTeam = async (targetTeam) => {
    if (isSwitchingTeam || isSwitchingTeamRef.current) return;
    if (!checkNetworkOnline()) return;

    isSwitchingTeamRef.current = true;
    setIsSwitchingTeam(true);
    try {
      const res = switchPlayerTeam(game.id, currentUser.id, targetTeam);
      if (res && !res.success) {
        const safeMsg = (res?.message && res.message.length < 200)
          ? res.message
          : 'Unable to switch teams. Please try again.';
        toast.error(safeMsg);
      }
    } catch (err) {
      logActionError('handleSwitchTeam', err);
      toast.error(getErrorMessage(err, 'switching team'));
    } finally {
      setIsSwitchingTeam(false);
      setTimeout(() => {
        isSwitchingTeamRef.current = false;
      }, 400);
    }
  };

  if (!game) {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-12 px-4 text-center space-y-4">
        <BackButton fallback="/player/find-games" label="Back to All Pick-Up Games" />
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-w-md mx-auto shadow-sm">
          <div className="text-4xl">⚽</div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase">Match Session Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            This match session may have ended, expired, or been removed by the host.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/player/find-games')} className="font-bold text-xs uppercase">
            Browse Live Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto py-2 px-2 sm:px-4 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
        <BackButton fallback="/player/find-games" label="Back to All Pick-Up Games" />
        <div className="flex items-center space-x-2">
          <Badge variant={game.format === '5v5' ? 'emerald' : 'blue'}>{game.format}</Badge>
          <Badge variant={game.privacy === 'PRIVATE' ? 'danger' : 'gold'}>
            {game.privacy || 'PUBLIC'}
          </Badge>
          {game.status === 'ONGOING' ? (
            <Badge variant="danger" size="sm">🔥 LIVE MATCH</Badge>
          ) : game.status === 'COMPLETED' ? (
            <Badge variant="emerald" size="sm">🏆 COMPLETED</Badge>
          ) : (
            <Badge variant={isFull ? 'danger' : 'emerald'} size="sm">
              {isFull ? 'ROSTER FULL' : `${spotsLeft} SLOTS LEFT`}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Player Lineups & Squad Names (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ROSTERS HEADER */}
          <div className="footy-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-sport-500" />
                  <span>Squad Rosters ({confirmedPlayers.length} / {maxSlots} Confirmed)</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">Teams balance dynamically based on player Elo ratings</p>
              </div>

              {isConfirmed && !isGameCompleted && (
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Spot Confirmed
                </span>
              )}
            </div>

            {/* 2 TEAMS BALANCED ROSTER CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* TEAM A ROSTER */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 border-l-4 border-l-sky-500 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-xs text-sky-500 uppercase tracking-wider">TEAM A LINEUP</h4>
                    <Badge variant="blue" size="sm">{teamAPlayers.length} / {teamCapacity}</Badge>
                  </div>

                  {isGameCompleted ? (
                    <Badge variant="default" size="sm">🔒 Locked</Badge>
                  ) : currentUser && currentUser.role !== 'CLUB_MANAGER' && (
                    isConfirmed ? (
                      teamBPlayers.some(p => p.id === currentUser.id) && teamAPlayers.length < teamCapacity && (
                        <button
                          type="button"
                          disabled={isSwitchingTeam}
                          onClick={() => handleSwitchTeam('TEAM_A')}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-extrabold text-[10px] hover:bg-sky-500 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSwitchingTeam ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="animate-spin text-[10px]">⏳</span> Switching...
                            </span>
                          ) : (
                            '⚡ Switch to Team A'
                          )}
                        </button>
                      )
                    ) : (
                      !isWaitlisted && teamAPlayers.length < teamCapacity && (
                        <button
                          type="button"
                          onClick={() => { setSelectedTeam('TEAM_A'); handleOpenPaymentModal(); }}
                          className="px-2.5 py-1 rounded-lg bg-sky-500 text-white font-extrabold text-[10px] hover:bg-sky-600 shadow-sm transition-all cursor-pointer"
                        >
                          + Join Team A
                        </button>
                      )
                    )
                  )}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {teamAPlayers.length > 0 ? (
                    teamAPlayers.map((player, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800/80 shadow-xs">
                        <div className="flex items-center space-x-2.5">
                          <Avatar src={player.avatar} name={player.name} size="sm" />
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block text-xs">{player.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{player.position || 'ST'}</span>
                          </div>
                        </div>
                        <Badge variant={player.id === game.organizer?.id ? 'gold' : 'emerald'} size="sm">
                          {player.id === game.organizer?.id ? 'Host' : 'Confirmed'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2 text-center">No players assigned to Team A yet</p>
                  )}
                </div>
              </div>

              {/* TEAM B ROSTER */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-xs text-rose-500 uppercase tracking-wider">TEAM B LINEUP</h4>
                    <Badge variant="danger" size="sm">{teamBPlayers.length} / {teamCapacity}</Badge>
                  </div>

                  {isGameCompleted ? (
                    <Badge variant="default" size="sm">🔒 Locked</Badge>
                  ) : currentUser && currentUser.role !== 'CLUB_MANAGER' && (
                    isConfirmed ? (
                      teamAPlayers.some(p => p.id === currentUser.id) && teamBPlayers.length < teamCapacity && (
                        <button
                          type="button"
                          disabled={isSwitchingTeam}
                          onClick={() => handleSwitchTeam('TEAM_B')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] hover:bg-rose-500 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSwitchingTeam ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="animate-spin text-[10px]">⏳</span> Switching...
                            </span>
                          ) : (
                            '⚡ Switch to Team B'
                          )}
                        </button>
                      )
                    ) : (
                      !isWaitlisted && teamBPlayers.length < teamCapacity && (
                        <button
                          type="button"
                          onClick={() => { setSelectedTeam('TEAM_B'); handleOpenPaymentModal(); }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-[10px] hover:bg-rose-600 shadow-sm transition-all cursor-pointer"
                        >
                          + Join Team B
                        </button>
                      )
                    )
                  )}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {teamBPlayers.length > 0 ? (
                    teamBPlayers.map((player, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800/80 shadow-xs">
                        <div className="flex items-center space-x-2.5">
                          <Avatar src={player.avatar} name={player.name} size="sm" />
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block text-xs">{player.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{player.position || 'MID'}</span>
                          </div>
                        </div>
                        <Badge variant="emerald" size="sm">Confirmed</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2 text-center">No players assigned to Team B yet</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {game.description && (
            <div className="footy-card p-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-black text-slate-900 dark:text-white uppercase block">Match Rules & Guidance:</span>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">{game.description}</p>
            </div>
          )}

          {isWaitlisted && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>You are currently <strong>#{waitlistIndex + 1}</strong> on the waitlist.</span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Match Details, Scoreboard, Live Score & Controls */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5">
          
          <div className="footy-card p-4 sm:p-6 space-y-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    MATCH SESSION
                  </span>
                  <span className="text-xs font-bold text-slate-400">ID: {game.id}</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white break-words">
                  {game.title}
                </h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{game.venueReference?.clubName} • {game.venueReference?.courtName || 'Pitch Alpha'} ({game.venueReference?.city})</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">ENTRY FEE</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{game.entryFee}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-500" /> Date
                </span>
                <span className="text-slate-900 dark:text-white text-xs font-extrabold mt-0.5 block">{game.dateTime?.date}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-500" /> Time
                </span>
                <span className="text-slate-900 dark:text-white text-xs font-extrabold mt-0.5 block truncate">{game.dateTime?.startTime} - {game.dateTime?.endTime || '20:30'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" /> Format
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black mt-0.5 block">{game.format} ({maxSlots})</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Users className="w-3 h-3 text-rose-500" /> Roster
                </span>
                <span className="text-slate-900 dark:text-white text-xs font-extrabold mt-0.5 block">{confirmedPlayers.length} / {maxSlots}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xs">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3 text-purple-500" /> Host
                </span>
                <span className="text-slate-900 dark:text-white text-xs font-extrabold mt-0.5 block truncate">{game.organizer?.name}</span>
              </div>
            </div>

            {/* LIVE SCOREBOARD */}
            {game.liveScore && game.status !== 'COMPLETED' && (
              <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white space-y-2 border-2 border-rose-500/60 text-center shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-center space-x-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-black uppercase text-rose-400 tracking-widest">🔴 LIVE IN-GAME SCORE (SCREEN DISPLAY ONLY)</span>
                </div>

                <div className="flex items-center justify-center space-x-4 sm:space-x-8 py-2">
                  <div className="text-center">
                    <span className="text-[10px] font-black text-sky-400 block uppercase mb-0.5">TEAM A</span>
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">{game.liveScore.teamA}</span>
                  </div>
                  <div className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40">
                    <span className="text-base sm:text-lg font-black text-rose-400">VS</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-rose-400 block uppercase mb-0.5">TEAM B</span>
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">{game.liveScore.teamB}</span>
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-slate-400">
                  ⏳ Live match score in progress. Match remains Active and will NOT enter Match History until "Enter Score & Finish Match" is submitted.
                </p>
              </div>
            )}

            {/* OFFICIAL FINAL SCOREBOARD */}
            {game.score && (() => {
              const outcomeInfo = (() => {
                const teamA = parseInt(game.score.teamA, 10);
                const teamB = parseInt(game.score.teamB, 10);
                const isDraw = teamA === teamB;
                const teamAWon = teamA > teamB;

                const playerIndex = confirmedPlayers.findIndex(p => p.id === currentUser?.id);
                if (currentUser && playerIndex !== -1) {
                  const playerObj = confirmedPlayers[playerIndex];
                  let playerTeam = playerObj.team;
                  if (!playerTeam) {
                    playerTeam = playerIndex < teamCapacity ? 'TEAM_A' : 'TEAM_B';
                  }

                  if (isDraw) return { text: '🤝 RESULT: DRAW', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
                  
                  const won = (playerTeam === 'TEAM_A' && teamAWon) || (playerTeam === 'TEAM_B' && !teamAWon);
                  if (won) {
                    return { text: '🎉 VICTORY! YOU WON THIS MATCH', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
                  } else {
                    return { text: '❌ DEFEAT: YOU LOST THIS MATCH', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
                  }
                }

                if (isDraw) return { text: '🏆 MATCH RESULT: DRAW', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
                return {
                  text: `🏆 WINNER: ${teamAWon ? 'TEAM A' : 'TEAM B'}`,
                  color: teamAWon ? 'text-sky-400' : 'text-rose-400',
                  border: teamAWon ? 'border-sky-500/30' : 'border-rose-500/30',
                  bg: teamAWon ? 'bg-sky-500/10' : 'bg-rose-500/10'
                };
              })();

              return (
                <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white space-y-3 border border-slate-800 text-center shadow-lg relative overflow-hidden">
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase text-amber-400 tracking-widest">OFFICIAL MATCH SCORE RESULT</span>
                  </div>

                  <div className="flex items-center justify-center space-x-4 sm:space-x-8 py-2">
                    <div className="text-center">
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase mb-0.5">TEAM A</span>
                      <span className="text-4xl sm:text-5xl font-black text-white font-mono">{game.score.teamA}</span>
                    </div>
                    <div className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-base sm:text-lg font-black text-amber-500">VS</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase mb-0.5">TEAM B</span>
                      <span className="text-4xl sm:text-5xl font-black text-white font-mono">{game.score.teamB}</span>
                    </div>
                  </div>

                  <div className={`inline-flex flex-wrap items-center justify-center gap-1.5 px-4 py-1.5 rounded-full ${outcomeInfo.bg} border ${outcomeInfo.border} ${outcomeInfo.color} text-xs font-black max-w-full`}>
                    <span>{outcomeInfo.text}</span>
                    <span className="hidden xs:inline">•</span>
                    <span>⚡ Elo Recalculated</span>
                  </div>
                </div>
              );
            })()}

            {/* LIVE SCORE AUDIT TIMELINE */}
            {game.liveScoreHistory?.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200">
                      ⏱️ Live Score Updates Timeline & Log ({game.liveScoreHistory.length})
                    </h4>
                  </div>
                  <Badge variant="gold" size="sm">Audit Log</Badge>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {game.liveScoreHistory.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs border ${
                        item.isFinal 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          ⏰ {item.time}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          Team A <span className="font-mono text-amber-500 font-black px-0.5">{item.score?.teamA ?? 0}</span> – <span className="font-mono text-amber-500 font-black px-0.5">{item.score?.teamB ?? 0}</span> Team B
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        <span>{item.isFinal ? '🏆 Final Result' : `by ${item.updatedBy || 'Host'}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTION & ENTRY HUB */}
          <div className="footy-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Match Action & Entry Hub</span>
              </span>
              <span className="text-xs font-bold text-slate-400">
                Wallet: <strong className="text-emerald-500 font-black">₹{currentUser?.walletBalance?.toFixed(2)}</strong>
              </span>
            </div>

            {isAuthorizedManager && (
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="text-[11px] font-black uppercase text-amber-500 flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Manager Controls ({currentUser?.role})</span>
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {isGameCompleted ? (
                    <>
                      <Link to="/history" className="col-span-1">
                        <Button variant="emerald" size="sm" icon={Trophy} className="w-full justify-center">
                          View History
                        </Button>
                      </Link>

                      {canUploadVideo && (
                        <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsVideoModalOpen(true)} className="w-full justify-center text-[11px]">
                          Link Video
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {game.status !== 'ONGOING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Play}
                          isLoading={isActionLoading}
                          disabled={isActionLoading}
                          onClick={handleStartMatch}
                          className="w-full justify-center text-[11px]"
                        >
                          Start Match
                        </Button>
                      )}

                      <Button variant="emerald" size="sm" icon={CheckCircle} onClick={handleOpenScoreModal} className="w-full justify-center text-[11px]">
                        Finish Match
                      </Button>

                      <Button variant="gold" size="sm" icon={Trophy} onClick={handleOpenLiveScoreModal} className="w-full justify-center text-[11px]">
                        Live Score
                      </Button>

                      <Button variant="outline" size="sm" icon={Edit2} onClick={handleOpenEditModal} className="w-full justify-center text-[11px]">
                        Edit Match
                      </Button>

                      {canUploadVideo && (
                        <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsVideoModalOpen(true)} className="w-full justify-center text-[11px]">
                          Link Video
                        </Button>
                      )}

                      <Button 
                        variant="danger" 
                        size="sm" 
                        icon={Trash2} 
                        isLoading={isActionLoading}
                        disabled={isActionLoading}
                        onClick={handleRequestCancelMatch}
                        className="w-full justify-center text-[11px]"
                      >
                        Cancel Match
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              {isGameCompleted ? (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-inner">
                  <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>MATCH COMPLETED — ROSTER LOCKED</span>
                </div>
              ) : currentUser?.role === 'CLUB_MANAGER' ? (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center space-x-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Club Managers cannot join games as players.</span>
                </div>
              ) : isConfirmed || isWaitlisted ? (
                <Button
                  variant="danger"
                  size="md"
                  isLoading={isLeaving}
                  disabled={isLeaving}
                  onClick={() => setIsLeaveMatchModalOpen(true)}
                  className="w-full justify-center"
                >
                  Leave Match & Refund ₹{game.entryFee}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={CheckCircle}
                  onClick={handleOpenPaymentModal}
                  className="w-full justify-center py-3 text-sm font-black"
                >
                  {isFull ? `Join Waitlist (₹${game.entryFee})` : `Join Match Now (₹${game.entryFee})`}
                </Button>
              )}
            </div>
          </div>

          {/* VIDEO HIGHLIGHTS */}
          {linkedVideos.length > 0 && (
            <div className="footy-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2">
                  <Film className="w-4 h-4 text-sky-500" />
                  <span>Official Match Video Highlights {linkedVideos.length > 1 ? `(${linkedVideos.length} Videos)` : ''}</span>
                </h3>
                <Badge variant="emerald" size="sm">{linkedVideos[0].videoStatus || 'AVAILABLE'}</Badge>
              </div>

              <div className="space-y-4">
                {linkedVideos.map((videoItem, vIdx) => (
                  <div key={videoItem.id || vIdx} className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center border border-slate-800">
                      <video
                        src={videoItem.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster="/assets/images/courts/court-1.jpg"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <h4 className="font-extrabold text-slate-900 dark:text-white">{videoItem.title}</h4>
                      <p className="text-slate-400 font-semibold">{videoItem.description}</p>
                      <span className="text-[10px] font-bold text-slate-500 block pt-0.5">Uploaded by: {videoItem.uploadedBy} • {videoItem.uploadDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* PAYMENT-BEFORE-CONFIRMED-SLOT MODAL */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Confirm Payment & Secure Player Slot">
        <form onSubmit={handleConfirmPaymentAndJoin} className="space-y-4 text-xs font-bold">
          
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-900 dark:text-white font-black text-sm">
              <span>{game.title}</span>
              <Badge variant="emerald" size="sm">{game.format}</Badge>
            </div>
            <p className="text-slate-400 text-[11px]">
              {game.venueReference?.clubName} • {game.dateTime?.date} ({game.dateTime?.startTime}-{game.dateTime?.endTime || '20:30'})
            </p>
          </div>

          {/* TEAM SELECTION CHOICE */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200">
              Select Team Roster *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={teamAPlayers.length >= teamCapacity}
                onClick={() => setSelectedTeam('TEAM_A')}
                className={`p-3 rounded-xl border font-extrabold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedTeam === 'TEAM_A'
                    ? 'bg-sky-500 text-white border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                } ${teamAPlayers.length >= teamCapacity ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="font-black text-sm">Team A Lineup</span>
                <span className="text-[10px] mt-0.5">{teamAPlayers.length} / {teamCapacity} Players {teamAPlayers.length >= teamCapacity ? '(Full)' : ''}</span>
              </button>

              <button
                type="button"
                disabled={teamBPlayers.length >= teamCapacity}
                onClick={() => setSelectedTeam('TEAM_B')}
                className={`p-3 rounded-xl border font-extrabold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedTeam === 'TEAM_B'
                    ? 'bg-rose-500 text-white border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                } ${teamBPlayers.length >= teamCapacity ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="font-black text-sm">Team B Lineup</span>
                <span className="text-[10px] mt-0.5">{teamBPlayers.length} / {teamCapacity} Players {teamBPlayers.length >= teamCapacity ? '(Full)' : ''}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Match Entry Fee:</span>
              <span className="font-black text-slate-900 dark:text-white">₹{game.entryFee}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Your Current Wallet Balance:</span>
              <span className="font-black text-amber-500">₹{currentUser?.walletBalance?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Remaining Balance After Payment:</span>
              <span className={(currentUser?.walletBalance || 0) >= game.entryFee ? 'text-emerald-500' : 'text-rose-500'}>
                ₹{((currentUser?.walletBalance || 0) - game.entryFee).toFixed(2)}
              </span>
            </div>
          </div>

          {(currentUser?.walletBalance || 0) < game.entryFee ? (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] font-bold">
              Insufficient wallet balance! Please top up your wallet in Profile to secure this slot.
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center space-x-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Payment authorization will instantly confirm your player slot in the match roster.</span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsPaymentModalOpen(false)} className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={CreditCard}
              isLoading={isJoining}
              disabled={isJoining || (currentUser?.walletBalance || 0) < game.entryFee}
              className="w-full sm:w-auto justify-center"
            >
              Pay ₹{game.entryFee} & Confirm Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter Final Score & Finish Match Modal */}
      <Modal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} title="🏁 Enter Final Score & Finish Match">
        <form onSubmit={handleSubmitScore} className="space-y-4 text-xs font-bold">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold">
            🏆 <strong>FINAL RESULT SUBMISSION:</strong> Entering the final score will mark the match as <strong>COMPLETED</strong>, trigger standard Elo rating calculations (K=32 factor) for all confirmed players, and move the match into <strong>Match History</strong>.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team A Final Goals</label>
              <input
                name="scoreTeamA"
                type="number"
                min="0"
                max="99"
                placeholder="0"
                value={scoreTeamA}
                onChange={(e) => setScoreTeamA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xl font-black text-center"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team B Final Goals</label>
              <input
                name="scoreTeamB"
                type="number"
                min="0"
                max="99"
                placeholder="0"
                value={scoreTeamB}
                onChange={(e) => setScoreTeamB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xl font-black text-center"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsScoreModalOpen(false)} className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm" isLoading={isSubmittingScore} disabled={isSubmittingScore} className="w-full sm:w-auto justify-center">
              🏁 Finish Match & Publish Final Score
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Live Score Modal (Screen Display Only) */}
      <Modal isOpen={isLiveScoreModalOpen} onClose={() => setIsLiveScoreModalOpen(false)} title="🔴 Record Live Score (Screen Only)">
        <form onSubmit={handleSubmitLiveScore} className="space-y-4 text-xs font-bold">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold">
            ⚡ <strong>SCREEN SCORE ONLY:</strong> Live score updates the on-screen display for spectators & players. It will <strong>NOT</strong> mark the match as Completed, will <strong>NOT</strong> calculate Elo, and will <strong>NOT</strong> move it to Match History until you submit via "Enter Score & Finish Match".
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team A Live Goals</label>
              <input
                name="liveScoreTeamA"
                type="number"
                min="0"
                max="99"
                placeholder="0"
                value={liveScoreTeamA}
                onChange={(e) => setLiveScoreTeamA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-500/40 bg-white dark:bg-slate-900 text-rose-500 text-xl font-black text-center"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Team B Live Goals</label>
              <input
                name="liveScoreTeamB"
                type="number"
                min="0"
                max="99"
                placeholder="0"
                value={liveScoreTeamB}
                onChange={(e) => setLiveScoreTeamB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-500/40 bg-white dark:bg-slate-900 text-rose-500 text-xl font-black text-center"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsLiveScoreModalOpen(false)} className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSubmittingLiveScore} disabled={isSubmittingLiveScore} className="w-full sm:w-auto justify-center">
              🔴 Update Live Screen Score
            </Button>
          </div>
        </form>
      </Modal>

      {/* Link Match Video Reference Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title="Link Match Video Footage">
        <form onSubmit={handleAddVideoSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Video Title</label>
            <input
              name="videoTitle"
              type="text"
              placeholder="e.g. Full Match Highlights - Pitch 1"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">
              Select Video File (.mp4, .webm, .mov, max 50 MB)
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={videoFileInputRef}
                type="file"
                accept=".mp4,.webm,.mov,.mkv,video/mp4,video/webm,video/quicktime"
                onChange={handleVideoFileChange}
                disabled={isSubmittingVideo}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sport-500/10 file:text-sport-600 dark:file:text-sport-400 hover:file:bg-sport-500/20 cursor-pointer"
              />
              {videoFile && (
                <button
                  type="button"
                  onClick={() => { setVideoFile(null); if (videoFileInputRef.current) videoFileInputRef.current.value = ''; }}
                  disabled={isSubmittingVideo}
                  className="text-rose-500 hover:text-rose-600 text-xs font-bold whitespace-nowrap p-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            {videoFile && (
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Selected: <strong className="text-slate-900 dark:text-white">{videoFile.name}</strong> ({formatFileSize(videoFile.size)})</span>
                <span className="text-emerald-500 font-bold">✓ Ready</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Or Video MP4 / Embed Stream URL</label>
            <input
              name="videoUrl"
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={!!videoFile || isSubmittingVideo}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold disabled:opacity-50"
              required={!videoFile}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Video Description / Highlights</label>
            <textarea
              name="videoDesc"
              rows="2"
              placeholder="Key goals, saves, penalty shootout footage..."
              value={videoDesc}
              onChange={(e) => setVideoDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>

          {isSubmittingVideo && uploadProgress > 0 && (
            <div className="space-y-1 py-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Uploading & Processing Video Footage...</span>
                <span className="text-sport-500">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sport-500 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isSubmittingVideo) {
                  toast('Upload in progress...', { icon: '⏳' });
                  return;
                }
                setIsVideoModalOpen(false);
                setVideoFile(null);
                if (videoFileInputRef.current) videoFileInputRef.current.value = '';
              }}
              disabled={isSubmittingVideo}
              className="w-full sm:w-auto justify-center"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Film} isLoading={isSubmittingVideo} disabled={isSubmittingVideo} className="w-full sm:w-auto justify-center">
              {isSubmittingVideo ? `Uploading (${uploadProgress}%)...` : 'Upload & Link Match Video'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT GAME DETAILS MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Game Details" maxWidth="max-w-2xl">
        <form onSubmit={handleSaveEditGame} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <p className="text-slate-500 dark:text-slate-400 -mt-3 text-[11px]">
            Update match details, format, timings, entry fee, or match rules.
          </p>

          {/* Game Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Game Name <span className="text-rose-500">*</span>
            </label>
            <input
              name="editTitle"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Date, Start Time, End Time (3 Cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                name="editDate"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                name="editStartTime"
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                name="editEndTime"
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Format & Skill Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Game Type / Format <span className="text-rose-500">*</span>
              </label>
              <select
                name="editFormat"
                value={editFormat}
                onChange={(e) => {
                  setEditFormat(e.target.value);
                  if (MATCH_FORMAT_SLOTS[e.target.value]) {
                    setEditMaxPlayers(String(MATCH_FORMAT_SLOTS[e.target.value]));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                required
              >
                <option value="1v1">1v1 (2 Players - Singles)</option>
                <option value="2v2">2v2 (4 Players - Doubles)</option>
                <option value="3v3">3v3 (6 Players)</option>
                <option value="4v4">4v4 (8 Players)</option>
                <option value="5v5">5v5 (10 Players)</option>
                <option value="6v6">6v6 (12 Players)</option>
                <option value="7v7">7v7 (14 Players)</option>
                <option value="8v8">8v8 (16 Players)</option>
                <option value="11v11">11v11 (22 Players)</option>
                <option value="custom">Custom Format</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Skill Level
              </label>
              <select
                name="editSkill"
                value={editSkill}
                onChange={(e) => setEditSkill(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner Friendly</option>
                <option value="Advanced">Advanced / Competitive</option>
                <option value="All Levels">All Levels Welcome</option>
              </select>
            </div>
          </div>

          {/* Max Players, Fee, Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Max Players <span className="text-rose-500">*</span>
              </label>
              <input
                name="editMaxPlayers"
                type="number"
                min="1"
                max="50"
                value={editMaxPlayers}
                onChange={(e) => setEditMaxPlayers(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Entry Fee (₹)
              </label>
              <input
                name="editEntryFee"
                type="number"
                min="0"
                step="50"
                value={editEntryFee}
                onChange={(e) => setEditEntryFee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Privacy
              </label>
              <select
                value={editPrivacy}
                onChange={(e) => setEditPrivacy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Match Description / Rules
            </label>
            <textarea
              rows="3"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              {isSubmittingEdit ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══ CANCEL MATCH CONFIRM MODAL ═══ */}
    <Modal
      isOpen={isCancelMatchModalOpen}
      onClose={() => { if (!isActionLoading) setIsCancelMatchModalOpen(false); }}
      title="🗑️ Cancel & Remove Match Session"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-2">
          <p className="text-sm font-bold">Are you sure you want to cancel and remove this match?</p>
          <p className="text-xs font-semibold opacity-80">This action cannot be undone. All players will be removed from the roster and entry fees refunded.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-semibold">
          <div className="flex justify-between">
            <span className="text-slate-400">Match:</span>
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]">{game?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Format:</span>
            <span className="text-slate-700 dark:text-slate-300">{game?.format}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Players Registered:</span>
            <span className="text-slate-700 dark:text-slate-300">{game?.confirmedPlayers?.length || 0} players</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCancelMatchModalOpen(false)}
            className="w-full sm:flex-1 border border-slate-200 dark:border-slate-700 justify-center"
          >
            Keep Match
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={Trash2}
            isLoading={isActionLoading}
            disabled={isActionLoading}
            onClick={handleConfirmCancelMatch}
            className="w-full sm:flex-1 justify-center"
          >
            Yes, Cancel Match
          </Button>
        </div>
      </div>
    </Modal>

    {/* ═══ LEAVE MATCH CONFIRM MODAL ═══ */}
    <Modal
      isOpen={isLeaveMatchModalOpen}
      onClose={() => { if (!isLeaving) setIsLeaveMatchModalOpen(false); }}
      title="⚠️ Leave Match & Refund"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-2">
          <p className="text-sm font-bold">Are you sure you want to leave this match?</p>
          <p className="text-xs font-semibold opacity-80">Your roster spot will be freed for another player. Your entry fee will be refunded to your wallet.</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-semibold">
          <div className="flex justify-between">
            <span className="text-slate-400">Match:</span>
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]">{game?.title}</span>
          </div>
          {game?.entryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Refund Amount:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{game.entryFee} → Wallet</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsLeaveMatchModalOpen(false)}
            className="w-full sm:flex-1 border border-slate-200 dark:border-slate-700 justify-center"
          >
            Stay in Match
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isLeaving}
            disabled={isLeaving}
            onClick={handleLeaveMatch}
            className="w-full sm:flex-1 justify-center"
          >
            Yes, Leave Match
          </Button>
        </div>
      </div>
    </Modal>
    </div>
  );
};

export default GameDetailsPage;
