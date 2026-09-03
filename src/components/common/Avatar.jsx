import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

export const Avatar = ({ src, alt = 'Avatar', name = '', size = 'md', status, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

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

  const initials = getInitials(name || alt);
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={clsx('relative inline-block flex-shrink-0 select-none', sizeClass, className)}>
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full rounded-full object-cover ring-2 ring-sport-500/30 shadow-sm"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-sport-600 to-teal-500 text-white flex items-center justify-center font-bold tracking-wider ring-2 ring-sport-500/30 shadow-sm">
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
