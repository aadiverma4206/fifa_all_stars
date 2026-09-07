import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlertStore } from '../../store/useAlertStore';

export const GlobalAlertModal = () => {
  const { 
    isOpen, 
    type, 
    title, 
    message, 
    duration,
    confirmText, 
    cancelText, 
    onConfirm, 
    onCancel, 
    showCancelButton, 
    closeAlert 
  } = useAlertStore();

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning' || type === 'confirm';

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeAlert();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeAlert();
  };

  const handleDismiss = () => {
    if (isSuccess && !showCancelButton) {
      handleConfirm();
    } else {
      handleCancel();
    }
  };

  // Auto-dismiss for success alerts without action confirmation button
  useEffect(() => {
    let timer = null;
    if (isOpen && isSuccess && !showCancelButton) {
      const delay = duration || 2400;
      timer = setTimeout(() => {
        handleConfirm();
      }, delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, isSuccess, showCancelButton, duration]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSuccess, showCancelButton]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 overflow-y-auto select-none pointer-events-auto"
          style={{ margin: 0, padding: '1rem' }}
        >
          {/* 1. Full-screen Dimmed Backdrop with Fade In */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px]"
            onClick={handleDismiss}
          />

          {/* 2. Dead-Center Modal Box matching exact reference styling */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={
              isError 
                ? { opacity: 1, scale: 1, y: 0, x: [0, -6, 6, -4, 4, -2, 2, 0] }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={
              isError
                ? { 
                    scale: { type: 'spring', stiffness: 350, damping: 25 },
                    y: { type: 'spring', stiffness: 350, damping: 25 },
                    x: { duration: 0.45, delay: 0.1 }
                  }
                : { type: 'spring', stiffness: 380, damping: 26 }
            }
            className="relative w-full max-w-[360px] sm:max-w-[390px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 text-center my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle Close '✕' on Top-Right for Instant Dismissal */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* ── SUCCESS ANIMATION (Circular Icon with Checkmark SVG draw matching reference) ── */}
            {isSuccess && (
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: [0, 1.12, 1], rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
                className="w-16 h-16 rounded-full border-[1.5px] border-[#27ae60] bg-[#f4fbf6] dark:bg-[#27ae60]/10 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-[#27ae60]/20"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="#27ae60"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>
            )}

            {/* ── WRONG / ERROR ANIMATION (Animated Crossing X Strokes) ── */}
            {isError && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.05 }}
                className="w-16 h-16 rounded-full border-[1.5px] border-[#e74c3c] bg-[#fdf6f5] dark:bg-[#e74c3c]/10 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-[#e74c3c]/20"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M6 18L18 6"
                    stroke="#e74c3c"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.28, delay: 0.12, ease: 'easeOut' }}
                  />
                  <motion.path
                    d="M6 6l12 12"
                    stroke="#e74c3c"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.28, delay: 0.2, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>
            )}

            {/* ── WARNING / CONFIRMATION ANIMATION ── */}
            {isWarning && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.12, 1] }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-16 h-16 rounded-full border-[1.5px] border-[#e07a5f] bg-[#fffaf8] dark:bg-[#e07a5f]/10 flex items-center justify-center mx-auto mb-3.5"
              >
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="text-[#e07a5f] text-3xl font-light leading-none select-none"
                >
                  !
                </motion.span>
              </motion.div>
            )}

            {/* Title - Responsive typography matching reference */}
            <motion.h3 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-100 tracking-normal mb-1.5 font-sans"
            >
              {title}
            </motion.h3>

            {/* Subtitle / Description */}
            <motion.p 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className={`text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 leading-relaxed max-w-[310px] mx-auto ${
                showCancelButton || isError ? 'mb-6' : 'mb-2'
              }`}
            >
              {message}
            </motion.p>

            {/* Subtle Progress Bar for Auto-dismiss on Success */}
            {isSuccess && !showCancelButton && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (duration || 2400) / 1000, ease: 'linear' }}
                  className="h-full bg-[#27ae60] rounded-full"
                />
              </div>
            )}

            {/* Action Buttons: (Yes, Proceed) removed on success as requested */}
            {(showCancelButton || isError) && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
              >
                {showCancelButton ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm text-white bg-[#2b90d9] hover:bg-[#2380c2] active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      {confirmText || 'Yes, Proceed'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm text-white bg-[#d9534f] hover:bg-[#c9302c] active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      {cancelText || 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-7 py-2 sm:px-8 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm text-white bg-[#d9534f] hover:bg-[#c9302c] active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      {confirmText || 'Close'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalAlertModal;
