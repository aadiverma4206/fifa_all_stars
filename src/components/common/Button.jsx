import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import FootballKickLoader from './FootballKickLoader';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  rainbowBorder = true,
  effect,
  onClick,
  ...props
}) => {
  const buttonRef = useRef(null);
  const isClickLocked = useRef(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const baseStyles = 'relative inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] shadow-sm tracking-wide overflow-hidden select-none cursor-pointer';

  const variants = {
    primary:   'bg-sport-500 hover:bg-sport-600 text-white focus:ring-sport-500 shadow-sport-glow dark:bg-sport-500 dark:hover:bg-sport-600',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-500 border border-slate-700',
    gold:      'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black focus:ring-amber-400',
    outline:   'border-2 border-sport-500 text-sport-600 dark:text-sport-400 hover:bg-sport-500/10 focus:ring-sport-500',
    ghost:     'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400 shadow-none',
    danger:    'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-rose-500/20'
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 font-bold',
    md: 'px-5 py-2.5 text-sm gap-2 font-bold',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-extrabold'
  };

  const showLoading = isLoading || internalLoading;
  const hasRainbowBorder = rainbowBorder && !disabled && !showLoading;

  const handleClick = (e) => {
    // STRICT ANTI-DOUBLE-CLICK / SINGLE CLICK AT A TIME LOCK
    if (disabled || showLoading || isClickLocked.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Lock clicks for 750ms to prevent rapid double triggers
    isClickLocked.current = true;
    setTimeout(() => {
      isClickLocked.current = false;
    }, 750);

    const btn = buttonRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - diameter / 2;
      const y = e.clientY - rect.top - diameter / 2;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple-wave';
      ripple.style.width  = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left   = `${x}px`;
      ripple.style.top    = `${y}px`;

      btn.appendChild(ripple);
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 550);
    }

    if (onClick) {
      const result = onClick(e);
      // If onClick returns a Promise, trigger internal loading until resolved
      if (result && typeof result.then === 'function') {
        setInternalLoading(true);
        result.finally(() => setInternalLoading(false));
      }
    }
  };

  return (
    <button
      ref={buttonRef}
      disabled={disabled || showLoading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      onClick={handleClick}
      {...props}
    >
      {hasRainbowBorder && (
        <>
          <span className="btn-border-top"    aria-hidden="true" />
          <span className="btn-border-right"  aria-hidden="true" />
          <span className="btn-border-bottom" aria-hidden="true" />
          <span className="btn-border-left"   aria-hidden="true" />
        </>
      )}

      {showLoading ? (
        <FootballKickLoader size="sm" inline={true} />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0 relative z-10 pointer-events-none" />
      ) : null}
      <span className="relative z-10 pointer-events-none">{children}</span>
    </button>
  );
};

export default Button;
