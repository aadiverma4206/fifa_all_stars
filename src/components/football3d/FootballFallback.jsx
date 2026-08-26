import React from 'react';
import { motion } from 'framer-motion';

export const FootballFallback = ({ theme = 'dark' }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <motion.div
        animate={{
          y: [-15, 15, -15],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
        }}
        className="relative w-56 h-56 rounded-full flex items-center justify-center bg-gradient-to-tr from-sport-500 via-amber-400 to-sky-500 p-1 shadow-2xl"
      >
        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-7xl select-none">
          ⚽
        </div>
      </motion.div>
    </div>
  );
};

export default FootballFallback;
