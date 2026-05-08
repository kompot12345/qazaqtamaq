import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1A2F23',
        'primary-light': '#2D4A3B',
        'primary-dark': '#0F1A16',
        accent: '#D4AF37',
        'accent-light': '#E8C547',
        'accent-dark': '#B8941E',
      },
      animation: {
        slideUp: 'slideUp 0.6s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
        scaleIn: 'scaleIn 0.6s ease-out forwards',
        fadeIn: 'fadeIn 0.6s ease-in forwards',
      },
      keyframes: {
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        pulseSoft: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.8',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        glow: '0 0 20px rgba(212, 175, 55, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
