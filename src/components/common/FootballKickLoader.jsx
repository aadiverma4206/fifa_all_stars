import React from 'react';
import { motion } from 'framer-motion';

/**
 * FootballKickLoader
 * Premium 100% SVG football kick & juggle animation.
 * Mathematically calibrated physical contact:
 * - Ball rests squarely on top of the boot laces sweet spot (X=26px, Y=24px for lg).
 * - Zero clipping/penetration: ball never sinks into the boot.
 * - Zero hovering: ball never floats in thin air.
 * - Perfectly timed kick: boot snaps up at contact, launching the ball into a smooth parabolic jump.
 */
export const FootballKickLoader = ({ size = 'md', text = '', inline = false, fullScreen = false }) => {
  // Calibrated coordinates: ball sits right on the laces sweet spot without overlapping or hovering
  const sizeDimensions = {
    sm: { bootW: 46, bootH: 24, ballSize: 22, jumpY: -24, font: 'text-[10px]', ballLeft: 4, ballBottom: 13, bootLeft: 0 },
    md: { bootW: 68, bootH: 36, ballSize: 32, jumpY: -34, font: 'text-xs', ballLeft: 6, ballBottom: 19, bootLeft: 0 },
    lg: { bootW: 86, bootH: 46, ballSize: 38, jumpY: -44, font: 'text-sm', ballLeft: 7, ballBottom: 24, bootLeft: 0 },
    xl: { bootW: 108, bootH: 58, ballSize: 48, jumpY: -54, font: 'text-base', ballLeft: 9, ballBottom: 30, bootLeft: 0 }
  };

  const dim = sizeDimensions[size] || sizeDimensions.md;
  const JUGGLE_CYCLE_DURATION = 0.90; // Natural juggle cadence

  // 1. COMPACT BUTTON SPINNER: Only when explicitly inline and small (e.g. inside a <Button>)
  if (inline && size === 'sm') {
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 flex-shrink-0 relative z-10 pointer-events-none" aria-hidden="true">
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="30" cy="30" r="27" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <polygon points="30,21.5 38.1,27.4 35.0,37.0 25.0,37.0 21.9,27.4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <line x1="30" y1="21.5" x2="30" y2="12" stroke="#0f172a" strokeWidth="2" />
          <line x1="38.1" y1="27.4" x2="46.5" y2="23.5" stroke="#0f172a" strokeWidth="2" />
          <line x1="35.0" y1="37.0" x2="42.5" y2="45.0" stroke="#0f172a" strokeWidth="2" />
          <line x1="25.0" y1="37.0" x2="17.5" y2="45.0" stroke="#0f172a" strokeWidth="2" />
          <line x1="21.9" y1="27.4" x2="13.5" y2="23.5" stroke="#0f172a" strokeWidth="2" />
        </svg>
      </span>
    );
  }

  // 2. FULL KICK & JUGGLE ANIMATION CONTENT
  const content = (
    <div className="flex flex-col items-center justify-center select-none pointer-events-none">
      
      {/* JUGGLING STAGE */}
      <div 
        className="relative flex items-center justify-center"
        style={{ 
          width: dim.bootW + 16, 
          height: dim.bootH + Math.abs(dim.jumpY) + 14 
        }}
      >
        
        {/* SOCCER BALL CONTAINER (Direct contact with shoe at y=0, pushed up by kick to apex, falls back onto shoe) */}
        <motion.div
          animate={{
            y: [0, -4, dim.jumpY, 0, 0]
          }}
          transition={{
            duration: JUGGLE_CYCLE_DURATION,
            repeat: Infinity,
            repeatType: 'loop',
            times: [0, 0.10, 0.50, 0.90, 1],
            ease: ['easeOut', 'easeOut', 'easeIn', 'linear']
          }}
          className="absolute z-20 drop-shadow-md"
          style={{ 
            left: dim.ballLeft,
            bottom: dim.ballBottom // EXACT TOUCH CONTACT WITH BOOT LACES
          }}
        >
          {/* INNER BALL (Continuous Ultra-Smooth 360° Spin) */}
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              duration: JUGGLE_CYCLE_DURATION * 1.8,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <svg 
              width={dim.ballSize} 
              height={dim.ballSize} 
              viewBox="0 0 60 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <clipPath id="ball-circle-clip">
                  <circle cx="30" cy="30" r="27" />
                </clipPath>
                <radialGradient id="ball-sphere-lighting" cx="36%" cy="32%" r="68%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="72%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </radialGradient>
              </defs>

              {/* Spherical Base */}
              <circle cx="30" cy="30" r="27" fill="url(#ball-sphere-lighting)" stroke="#0f172a" strokeWidth="2.2" />
              
              {/* Telstar Geometry (Clipped to Spherical Edge) */}
              <g clipPath="url(#ball-circle-clip)">
                {/* Center Pentagon with Sport Green Trim */}
                <polygon points="30,21.5 38.1,27.4 35.0,37.0 25.0,37.0 21.9,27.4" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />
                
                {/* Seam Lines Radiating to 5 Outer Pentagons */}
                <line x1="30" y1="21.5" x2="30" y2="12" stroke="#475569" strokeWidth="1.8" />
                <line x1="38.1" y1="27.4" x2="46.5" y2="23.5" stroke="#475569" strokeWidth="1.8" />
                <line x1="35.0" y1="37.0" x2="42.5" y2="45.0" stroke="#475569" strokeWidth="1.8" />
                <line x1="25.0" y1="37.0" x2="17.5" y2="45.0" stroke="#475569" strokeWidth="1.8" />
                <line x1="21.9" y1="27.4" x2="13.5" y2="23.5" stroke="#475569" strokeWidth="1.8" />

                {/* 5 Outer Edge Pentagons with Sport Green Trim */}
                <polygon points="30,12 37,5 44,7 30,-8 16,7 23,5" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />
                <polygon points="46.5,23.5 54,17 63,22 59,34 50,32" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />
                <polygon points="42.5,45.0 51,44 54,56 42,64 35,54" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />
                <polygon points="17.5,45.0 25,54 18,64 6,56 9,44" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />
                <polygon points="13.5,23.5 10,32 1,34 -3,22 6,17" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />

                {/* Perimeter Seam Lines Connecting Outer Pentagons */}
                <line x1="37" y1="5" x2="54" y2="17" stroke="#64748b" strokeWidth="1.5" />
                <line x1="50" y1="32" x2="51" y2="44" stroke="#64748b" strokeWidth="1.5" />
                <line x1="35" y1="54" x2="25" y2="54" stroke="#64748b" strokeWidth="1.5" />
                <line x1="9" y1="44" x2="10" y2="32" stroke="#64748b" strokeWidth="1.5" />
                <line x1="6" y1="17" x2="23" y2="5" stroke="#64748b" strokeWidth="1.5" />

                {/* Realistic Specular Gloss Curve */}
                <ellipse cx="23" cy="19" rx="7.5" ry="3.8" transform="rotate(-30 23 19)" fill="#ffffff" opacity="0.45" />
              </g>
            </svg>
          </motion.div>
        </motion.div>

        {/* SOCCER CLEAT / BOOT (Gentle 10° toe flick to launch the ball) */}
        <motion.div
          animate={{
            rotate: [0, 12, 0, 0],
            y: [0, -3, 0, 0]
          }}
          transition={{
            duration: JUGGLE_CYCLE_DURATION,
            repeat: Infinity,
            repeatType: 'loop',
            times: [0, 0.10, 0.28, 1],
            ease: ['easeOut', 'easeInOut', 'linear']
          }}
          className="absolute bottom-1 z-10"
          style={{ 
            left: dim.bootLeft,
            transformOrigin: '82% 80%' // Ankle/heel pivot
          }}
        >
          <svg 
            width={dim.bootW} 
            height={dim.bootH} 
            viewBox="0 0 105 55" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <defs>
              <linearGradient id="boot-teal-grad" x1="10" y1="20" x2="95" y2="45" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <linearGradient id="boot-volt-stripe" x1="15" y1="42" x2="80" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>

            {/* Aerodynamic Boot Body */}
            <path
              d="M10 37 C 15 37, 24 35, 34 32 C 42 24, 52 17, 66 17 C 74 17, 80 20, 87 23 C 94 25, 98 29, 98 35 C 98 42, 92 46, 82 46 C 56 47, 30 47, 10 46 C 4 46, 3 41, 10 37 Z"
              fill="url(#boot-teal-grad)"
              stroke="#0f766e"
              strokeWidth="2.5"
            />

            {/* Ankle Collar & Heel Counter */}
            <path
              d="M72 18 C 78 11, 87 13, 95 19 C 99 25, 97 31, 91 33 Z"
              fill="#0f766e"
            />
            <path
              d="M76 17 C 81 13, 88 15, 93 20"
              stroke="#2dd4bf"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* High-Speed Volt Accent Swoop */}
            <path
              d="M18 42 C 34 40, 50 35, 68 27 C 78 24, 88 30, 83 39 C 66 42, 40 44, 18 42 Z"
              fill="url(#boot-volt-stripe)"
            />
            <path
              d="M28 40 C 42 38, 55 33, 72 26 C 76 25, 80 28, 76 34 Z"
              fill="#fef08a"
              opacity="0.8"
            />

            {/* Sleek Laces */}
            <line x1="44" y1="26" x2="48" y2="22" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="50" y1="24" x2="54" y2="20" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="56" y1="22" x2="60" y2="18" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />

            {/* Molded Soleplate Cleat Studs */}
            <rect x="14" y="46" width="6.5" height="4.5" rx="2" fill="#1e293b" />
            <rect x="34" y="46.5" width="6.5" height="4.5" rx="2" fill="#1e293b" />
            <rect x="58" y="46.5" width="6.5" height="4.5" rx="2" fill="#1e293b" />
            <rect x="78" y="45.5" width="6.5" height="4.5" rx="2" fill="#1e293b" />

            {/* Stud Volt Tips */}
            <circle cx="17.25" cy="49.5" r="1.2" fill="#facc15" />
            <circle cx="37.25" cy="50" r="1.2" fill="#facc15" />
            <circle cx="61.25" cy="50" r="1.2" fill="#facc15" />
            <circle cx="81.25" cy="49" r="1.2" fill="#facc15" />
          </svg>
        </motion.div>

        {/* Dynamic Ground Shadow Synchronized with Ball Altitude */}
        <motion.div
          animate={{
            scaleX: [1, 0.55, 1],
            opacity: [0.45, 0.12, 0.45]
          }}
          transition={{
            duration: JUGGLE_CYCLE_DURATION,
            repeat: Infinity,
            repeatType: 'loop',
            times: [0, 0.50, 1],
            ease: ['easeOut', 'easeIn']
          }}
          className="absolute bottom-0 left-2 w-16 h-1.5 bg-slate-900/40 dark:bg-black/60 rounded-full blur-[2px]"
        />

      </div>

      {/* Optional Pulsing Status Text */}
      {text && (
        <span className={`${dim.font} font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mt-2 animate-pulse`}>
          {text}
        </span>
      )}

    </div>
  );

  // 3. FULLSCREEN MODAL OVERLAY
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 dark:bg-slate-950/50 backdrop-blur-sm transition-all duration-300 pointer-events-auto select-none">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center space-y-3">
          {content}
        </div>
      </div>
    );
  }

  // 4. STANDARD KICK LOADER (e.g. Hero Section on Landing Page)
  return (
    <div className="flex items-center justify-center p-2 bg-transparent select-none">
      {content}
    </div>
  );
};

export default FootballKickLoader;
