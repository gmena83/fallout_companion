/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pip-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        'pip-amber': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        'crt-dark': '#001100',
        'crt-darker': '#000800',
      },
      fontFamily: {
        'mono': ['Share Tech Mono', 'Courier New', 'monospace'],
        'pip': ['Orbitron', 'monospace'],
      },
      animation: {
        'crt-flicker': 'crt-flicker 0.15s linear infinite alternate',
        'crt-scan': 'crt-scan 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'crt-flicker': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.95' },
        },
        'crt-scan': {
          '0%': { top: '-100%' },
          '100%': { top: '100%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
      backdropBlur: {
        'crt': '1px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}