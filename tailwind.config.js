/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#030712',
          navy: '#050B1E',
          surface: '#0B1536',
          surfaceHover: '#101F4E',
          card: '#08102B',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(56, 189, 248, 0.3)',
          blue: '#2563EB',
          blueHover: '#1D4ED8',
          cyan: '#38BDF8',
          accent: '#60A5FA',
          glow: 'rgba(37, 99, 235, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(37, 99, 235, 0.15)',
        'glow-md': '0 0 25px rgba(37, 99, 235, 0.25)',
        'glow-cyan': '0 0 25px rgba(56, 189, 248, 0.25)',
        'card': '0 10px 30px -10px rgba(2, 6, 23, 0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
