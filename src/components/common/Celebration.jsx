import React from 'react';
import { motion } from 'framer-motion';

export const Celebration = ({ show = false }) => {
  if (!show) return null;

  const particles = Array.from({ length: 30 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
      {particles.map((_, i) => {
        const randomX = (Math.random() - 0.5) * 800;
        const randomY = -300 - Math.random() * 400;
        const randomRotate = Math.random() * 360;
        const colorList = ['#22c55e', '#eab308', '#38bdf8', '#f43f5e', '#a855f7'];
        const particleColor = colorList[i % colorList.length];

        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: randomX,
              y: randomY,
              rotate: randomRotate,
              scale: [1, 1.2, 0.5]
            }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            style={{ backgroundColor: particleColor }}
            className="w-3 h-3 rounded-full absolute shadow-lg"
          />
        );
      })}
    </div>
  );
};

export default Celebration;
