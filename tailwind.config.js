/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Pacifico', 'cursive'], // For the title
        clock: ['Roboto Mono', 'monospace'], // For the clock
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'slow-pan': {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        'slide-down-fade': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'gradient': 'gradient-shift 2s ease infinite',
        'slow-pan': 'slow-pan 2s ease-in-out infinite',
        'slide-down': 'slide-down-fade 180ms ease-out',
      },
    },
  },
  plugins: [],
};
