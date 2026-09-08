import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

export const ROLE_DEFAULT_AVATARS = {
  SUPER_ADMIN: '/assets/images/avatars/admin-avatar.jpg',
  CLUB_MANAGER: '/assets/images/avatars/manager-avatar.jpg',
  PLAYER: '/assets/images/avatars/player-avatar.jpg',
};

export const getDefaultAvatarForRole = (role) => {
  const normalized = (role || '').toUpperCase();
  if (normalized.includes('ADMIN')) return ROLE_DEFAULT_AVATARS.SUPER_ADMIN;
  if (normalized.includes('MANAGER')) return ROLE_DEFAULT_AVATARS.CLUB_MANAGER;
  if (normalized.includes('PLAYER')) return ROLE_DEFAULT_AVATARS.PLAYER;
  return ROLE_DEFAULT_AVATARS.PLAYER;
};

export const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  name = '', 
  role = '', 
  size = 'md', 
  status, 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute effective image source: passed src, or role default
  const defaultRoleSrc = role ? getDefaultAvatarForRole(role) : null;
  const effectiveSrc = src || defaultRoleSrc;

  useEffect(() => {
    setImageError(false);
  }, [src, role]);

  const getInitials = (str) => {
    if (!str && !alt) return 'FA';
    const words = (str || alt).trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return (words[0]?.[0] || 'F').toUpperCase();
  };

  const sizes = {
    xs: 'w-6 h-6 text-[9px] font-extrabold',
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-black',
    lg: 'w-14 h-14 text-base font-black',
    xl: 'w-20 h-20 text-xl font-black'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4'
  };

  // Distinct gradients based on role
  const getRoleGradient = () => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) {
      return 'from-amber-600 via-amber-500 to-yellow-400 ring-amber-500/40 text-white';
    }
    if (r.includes('MANAGER')) {
      return 'from-sky-600 via-indigo-600 to-blue-500 ring-sky-500/40 text-white';
    }
    return 'from-emerald-600 via-teal-600 to-sport-500 ring-emerald-500/40 text-white';
  };

  const initials = getInitials(name || alt);
  const sizeClass = sizes[size] || sizes.md;

  const handleImgError = () => {
    // If a custom image failed but we have a role fallback that wasn't already tried, fallback to it
    if (effectiveSrc !== defaultRoleSrc && defaultRoleSrc) {
      // Let it fall back to default role avatar
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className={clsx('relative inline-block flex-shrink-0 select-none', sizeClass, className)}>
      {!imageError && effectiveSrc ? (
        <img
          src={effectiveSrc}
          alt={alt}
          onError={handleImgError}
          className="w-full h-full rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm"
        />
      ) : (
        <div className={clsx('w-full h-full rounded-full bg-gradient-to-tr flex items-center justify-center font-bold tracking-wider ring-2 shadow-sm', getRoleGradient())}>
          {initials}
        </div>
      )}

      {status && (
        <span
          className={clsx(
            statusSizes[size],
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900',
            status === 'online' || status === 'active' ? 'bg-sport-500' : 'bg-slate-400'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
