import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light' | 'dark' | 'system'
      
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        get().applyTheme(newTheme);
      },

      toggleTheme: () => {
        const current = get().theme;
        let next = 'dark';
        if (current === 'system') next = 'dark';
        else if (current === 'dark') next = 'light';
        else if (current === 'light') next = 'system';
        
        set({ theme: next });
        get().applyTheme(next);
      },

      applyTheme: (overrideTheme) => {
        const activeTheme = overrideTheme || get().theme;
        let isDark = false;

        if (activeTheme === 'dark') {
          isDark = true;
        } else if (activeTheme === 'light') {
          isDark = false;
        } else {
          // 'system' mode: follow system prefers-color-scheme
          isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      listenToSystemChanges: () => {
        if (!window.matchMedia) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          if (get().theme === 'system') {
            get().applyTheme('system');
          }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }),
    {
      name: 'fifa_all_stars_theme_preference',
    }
  )
);
