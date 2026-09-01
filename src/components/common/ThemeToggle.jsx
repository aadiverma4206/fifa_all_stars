import React, { useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, applyTheme, listenToSystemChanges } = useThemeStore();

  useEffect(() => {
    applyTheme();
    const cleanup = listenToSystemChanges();
    return () => {
      if (cleanup) cleanup();
    };
  }, [applyTheme, listenToSystemChanges]);

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme mode"
      title={`Current Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / System)`}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md transition-colors duration-150 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sport-500 text-xs font-semibold ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : theme === 'light' ? (
        <>
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Laptop className="w-4 h-4 text-cyan-500" />
          <span className="hidden sm:inline">System</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
