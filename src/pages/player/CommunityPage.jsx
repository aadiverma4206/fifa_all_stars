import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, MessageSquare, Send, Award, CheckCircle2, Vote, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { validateLength, validateFormAndFocus } from '../../utils/validationUtils';
import { getErrorMessage, logActionError, checkNetworkOnline } from '../../utils/errorUtils';
import { validateFile, readFileAsDataUrl, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, DEFAULT_MAX_AVATAR_SIZE, formatFileSize } from '../../utils/fileValidationUtils';
import toast from 'react-hot-toast';

export const CommunityPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { communityPosts, challenges, polls, addCommunityPost, addComment, votePoll, likePost } = useDataStore();

  const [selectedCity, setSelectedCity] = useState('all');
  const [postText, setPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [isPosting, setIsPosting] = useState(false);
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState(null);
  const [votingPollId, setVotingPollId] = useState(null);

  // Post Media Attachment State
  const [postImageFile, setPostImageFile] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const postImageInputRef = useRef(null);

  const handlePostImageChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPostImageFile(null);
      setPostImagePreview('');
      return;
    }
    const file = files[0];
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
      maxSizeBytes: DEFAULT_MAX_AVATAR_SIZE,
      fileCategoryName: 'post image'
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      if (postImageInputRef.current) postImageInputRef.current.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPostImageFile(file);
      setPostImagePreview(dataUrl);
      toast.success(`Attached "${file.name}" (${formatFileSize(file.size)})`);
    } catch (err) {
      toast.error(err.message || 'Failed to process selected image.');
    }
  };

  const isPostingRef = useRef(false);
  const submittingCommentRef = useRef(false);
  const votingPollRef = useRef(false);

  const filteredPosts = selectedCity === 'all'
    ? communityPosts
    : communityPosts.filter(p => p.city?.toLowerCase() === selectedCity.toLowerCase());

  const handleCreatePost = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isPosting || isPostingRef.current) return;

    if (!checkNetworkOnline()) return;

    const isValid = validateFormAndFocus(e || document, [
      { check: () => !currentUser ? { isValid: false, message: 'Please sign in to publish community posts.' } : { isValid: true }, field: 'postText' },
      { check: () => validateLength(postText, 3, 500, 'Community post'), field: 'postText' }
    ]);

    if (!isValid) return;

    isPostingRef.current = true;
    setIsPosting(true);
    try {
      addCommunityPost({
        city: currentUser?.city || 'Raipur',
        authorId: currentUser?.id || 'usr_player_demo',
        authorName: currentUser?.name || 'Arjun Mehta',
        authorAvatar: currentUser?.profileImageUrl || currentUser?.avatar,
        authorElo: currentUser?.eloRating || currentUser?.elo || 1840,
        content: postText.trim(),
        tags: ['FIFAAllStars', currentUser?.city || 'Raipur'],
        ...(postImagePreview ? { image: postImagePreview } : {})
      });

      toast.success('Post published to community feed!');
      setPostText('');
      setPostImageFile(null);
      setPostImagePreview('');
      if (postImageInputRef.current) postImageInputRef.current.value = '';
    } catch (err) {
      logActionError('handleCreatePost', err);
      toast.error(getErrorMessage(err, 'publishing community post'));
    } finally {
      setIsPosting(false);
      setTimeout(() => {
        isPostingRef.current = false;
      }, 400);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (votingPollId || votingPollRef.current) return;

    if (!checkNetworkOnline()) return;

    if (!currentUser) {
      toast.error('Please sign in to vote on polls.');
      navigate('/login');
      return;
    }

    votingPollRef.current = true;
    setVotingPollId(pollId);
    try {
      votePoll(pollId, optionId, currentUser?.id);
      toast.success('Vote recorded!');
    } catch (err) {
      logActionError('handleVote', err);
      toast.error(getErrorMessage(err, 'recording vote'));
    } finally {
      setVotingPollId(null);
      setTimeout(() => {
        votingPollRef.current = false;
      }, 400);
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    if (submittingCommentPostId || submittingCommentRef.current) return;

    if (!checkNetworkOnline()) return;

    const text = commentInputs[postId];
    const isValid = validateFormAndFocus(e, [
      { check: () => !currentUser ? { isValid: false, message: 'Please sign in to add comments.' } : { isValid: true }, field: 'commentText' },
      { check: () => validateLength(text, 1, 300, 'Comment'), field: 'commentText' }
    ]);

    if (!isValid) return;

    submittingCommentRef.current = true;
    setSubmittingCommentPostId(postId);
    try {
      addComment(postId, {
        id: `c_${Date.now()}`,
        author: currentUser?.name || 'Player',
        avatar: currentUser?.profileImageUrl || currentUser?.avatar,
        content: text.trim(),
        createdAt: 'Just now'
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added!');
    } catch (err) {
      logActionError('handleAddComment', err);
      toast.error(getErrorMessage(err, 'adding comment'));
    } finally {
      setSubmittingCommentPostId(null);
      setTimeout(() => {
        submittingCommentRef.current = false;
      }, 400);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
          <Users className="w-8 h-8 text-sport-500" />
          <span>Community & Monthly Challenges</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          City-wise player discussions, active polls, and monthly reward achievements
        </p>
      </div>

      {/* Monthly Challenges Ribbon */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Active Monthly Challenges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {challenges.map((ch) => {
            const currentCount = ch.userProgress[currentUser?.id] || 1;
            const percentage = Math.min(100, Math.round((currentCount / ch.target) * 100));

            return (
              <div key={ch.id} className="footy-card p-5 space-y-3 border-amber-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ch.title}</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{ch.description}</p>
                  </div>
                  <Badge variant="gold" size="sm">+₹{ch.rewardWalletBonus}</Badge>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Progress: {currentCount}/{ch.target}</span>
                    <span className="text-sport-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-sport-500 h-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* City Filter Bar */}
      <div className="footy-card p-3 flex items-center space-x-2 overflow-x-auto">
        <span className="text-xs font-extrabold text-slate-400 uppercase px-2">Filter City:</span>
        {['all', 'Raipur', 'Bangalore', 'Mumbai', 'Delhi', 'Pune'].map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCity(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all uppercase whitespace-nowrap ${
              selectedCity === c
                ? 'bg-sport-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Community Polls Section */}
      {polls.length > 0 && (
        <div className="footy-card p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Vote className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Community Poll ({polls[0].city})</h3>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{polls[0].question}</p>

          <div className="space-y-2">
            {polls[0].options.map(opt => {
              const hasVoted = polls[0].votedUserIds?.includes(currentUser?.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(polls[0].id, opt.id)}
                  disabled={hasVoted || votingPollId === polls[0].id}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all disabled:opacity-60 ${
                    hasVoted ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-sport-500'
                  }`}
                >
                  <span>{opt.text}</span>
                  <span className="text-sport-500 font-extrabold">
                    {votingPollId === polls[0].id ? '⏳ Recording...' : `${opt.votes} Votes`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Post Box */}
      <div className="footy-card p-5 space-y-4">
        <div className="flex items-start space-x-3">
          <Avatar src={currentUser?.profileImageUrl || currentUser?.avatar} name={currentUser?.name} size="md" />
          <textarea
            name="postText"
            rows="3"
            placeholder={`Share match updates or looking-for-players notice in ${currentUser?.city || 'Raipur'}...`}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="flex-1 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sport-500"
          />
        </div>

        {postImagePreview && (
          <div className="relative inline-block ml-11">
            <img src={postImagePreview} alt="Attached preview" className="max-h-36 rounded-xl border border-slate-200 dark:border-slate-700 object-cover shadow-xs" />
            <button
              type="button"
              onClick={() => { setPostImageFile(null); setPostImagePreview(''); if (postImageInputRef.current) postImageInputRef.current.value = ''; }}
              className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <input
              ref={postImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePostImageChange}
              className="hidden"
              id="community-post-photo"
            />
            <label
              htmlFor="community-post-photo"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-sport-500" />
              <span>{postImageFile ? 'Change Photo' : 'Attach Photo'}</span>
            </label>
            {postImageFile && (
              <span className="ml-2 text-[10px] text-slate-400 font-bold">({formatFileSize(postImageFile.size)})</span>
            )}
          </div>
          <Button variant="primary" size="sm" icon={Send} isLoading={isPosting} disabled={isPosting} onClick={handleCreatePost}>
            Post to {currentUser?.city || 'Raipur'} Feed
          </Button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="footy-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{post.authorName}</h4>
                    <Badge variant="emerald" size="sm">{post.authorElo} Elo</Badge>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{post.city || 'Raipur'} • {post.timestamp}</span>
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
              {post.content}
            </p>

            {post.image && (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80">
                <img src={post.image} alt="Community match visual" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {post.tags?.map((tag, i) => (
                <span key={i} className="text-[10px] font-extrabold text-sport-500 bg-sport-500/10 px-2.5 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => likePost(post.id)}
                className="flex items-center space-x-1.5 text-slate-500 hover:text-rose-500 transition-colors"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>{post.likes} Likes</span>
              </button>

              <div className="flex items-center space-x-1.5 text-slate-500">
                <MessageSquare className="w-4 h-4 text-sport-500" />
                <span>{post.comments?.length || 0} Comments</span>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-2 pt-2">
              {post.comments?.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{c.author}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{c.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-semibold">{c.text}</p>
                </div>
              ))}

              <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2 pt-2">
                <input
                  name="commentText"
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500"
                />
                <Button type="submit" variant="primary" size="sm" icon={Send} isLoading={submittingCommentPostId === post.id} disabled={submittingCommentPostId === post.id} />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage;
