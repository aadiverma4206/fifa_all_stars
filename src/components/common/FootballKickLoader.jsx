import React from 'react';
import { motion } from 'framer-motion';

export const FootballKickLoader = ({ size = 'md', text = '', inline = false }) => {
  const sizeDimensions = {
    sm: { bootW: 36, bootH: 20, ballSize: 18, jumpY: -16, font: 'text-[10px]' },
    md: { bootW: 56, bootH: 30, ballSize: 28, jumpY: -26, font: 'text-xs' },
    lg: { bootW: 88, bootH: 48, ballSize: 44, jumpY: -42, font: 'text-sm' },
    xl: { bootW: 120, bootH: 64, ballSize: 60, jumpY: -58, font: 'text-base' }
  };

  const dim = sizeDimensions[size] || sizeDimensions.md;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2 select-none pointer-events-none">
      
      {/* KICK ANIMATION CONTAINER */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: dim.bootW + 20, height: dim.bootH + Math.abs(dim.jumpY) + 15 }}
      >
        
        {/* BOOT / SHOE (Tilted & Kicking) */}
        <motion.div
          animate={{
            rotate: [0, -8, 12, 0],
            y: [0, 2, -4, 0]
          }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
          className="absolute bottom-1 left-2 z-10"
        >
          <svg 
            width={dim.bootW} 
            height={dim.bootH} 
            viewBox="0 0 100 55" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md"
          >
            {/* Boot Base Shape (Turquoise / Teal) */}
            <path
              d="M10 38 C 15 38, 25 36, 35 34 C 42 25, 52 18, 65 18 C 72 18, 78 22, 85 24 C 92 26, 96 30, 96 36 C 96 42, 90 46, 80 46 C 55 47, 30 47, 10 46 C 4 46, 2 42, 10 38 Z"
              fill="#14b8a6"
              stroke="#0f766e"
              strokeWidth="2.5"
            />

            {/* Boot Heel Collar */}
            <path
              d="M72 19 C 78 12, 86 14, 94 20 C 97 26, 95 32, 90 34 Z"
              fill="#0d9488"
            />

            {/* Yellow Wave Accent Stripe */}
            <path
              d="M20 42 C 35 40, 50 36, 68 28 C 78 26, 88 32, 82 40 C 65 42, 40 44, 20 42 Z"
              fill="#f59e0b"
            />
            <path
              d="M30 40 C 45 38, 55 33, 72 26 C 76 25, 80 28, 76 34 Z"
              fill="#fbbf24"
            />

            {/* Laces (Yellow Dots/Stripes) */}
            <line x1="45" y1="26" x2="48" y2="23" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="24" x2="53" y2="21" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
            <line x1="55" y1="22" x2="58" y2="19" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />

            {/* Sole Cleat Studs */}
            <rect x="15" y="46" width="6" height="4" rx="1.5" fill="#334155" />
            <rect x="35" y="46.5" width="6" height="4" rx="1.5" fill="#334155" />
            <rect x="58" y="46.5" width="6" height="4" rx="1.5" fill="#334155" />
            <rect x="78" y="45.5" width="6" height="4" rx="1.5" fill="#334155" />
          </svg>
        </motion.div>


        {/* SOCCER BALL (Spinning & Bouncing Upward from Boot) */}
        <motion.div
          animate={{
            y: [0, dim.jumpY, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.08, 0.95, 1]
          }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
          className="absolute bottom-5 left-4 z-20"
        >
          <svg 
            width={dim.ballSize} 
            height={dim.ballSize} 
            viewBox="0 0 60 60" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Outer Ball Circle */}
            <circle cx="30" cy="30" r="28" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
            
            {/* Center Pentagon */}
            <polygon points="30,21 37,26 34,35 26,35 23,26" fill="#0f172a" />
            
            {/* Surrounding Seam Lines & Outer Pentagons */}
            <line x1="30" y1="21" x2="30" y2="10" stroke="#0f172a" strokeWidth="2" />
            <line x1="37" y1="26" x2="48" y2="22" stroke="#0f172a" strokeWidth="2" />
            <line x1="34" y1="35" x2="43" y2="44" stroke="#0f172a" strokeWidth="2" />
            <line x1="26" y1="35" x2="17" y2="44" stroke="#0f172a" strokeWidth="2" />
            <line x1="23" y1="26" x2="12" y2="22" stroke="#0f172a" strokeWidth="2" />

            {/* Corner Patch Fixtures */}
            <polygon points="30,2 35,9 25,9" fill="#0f172a" />
            <polygon points="56,20 48,22 51,31" fill="#0f172a" />
            <polygon points="50,49 43,44 41,53" fill="#0f172a" />
            <polygon points="10,49 17,44 19,53" fill="#0f172a" />
            <polygon points="4,20 12,22 9,31" fill="#0f172a" />
          </svg>
        </motion.div>

        {/* Dynamic Shadow underneath shoe */}
        <motion.div
          animate={{
            scaleX: [1, 0.7, 1],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
          className="absolute bottom-0 left-3 w-14 h-1.5 bg-slate-900/30 dark:bg-black/50 rounded-full blur-[2px]"
        />

      </div>

      {text && (
        <span className={`${dim.font} font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 animate-pulse`}>
          {text}
        </span>
      )}

    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="flex items-center justify-center p-4 bg-transparent">
      {content}
    </div>
  );
};

export default FootballKickLoader;
