/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sport: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e', // Vibrant Footy Sport Green
          600: '#16a34a',
          700: '#15803d',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b', // Energetic Tournament Orange/Yellow
          600: '#d97706',
        },
        darkbg: {
          base: '#0b0f17',
          surface: '#111827',
          card: '#1f2937',
          border: '#374151'
        },
        lightbg: {
          base: '#f8fafc',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
        'sport-glow': '0 0 20px -3px rgba(34, 197, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
