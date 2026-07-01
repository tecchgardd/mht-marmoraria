/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0908',
          900: '#0d0c0a',
          800: '#15130f',
          700: '#1d1a15',
          600: '#27241d',
        },
        gold: {
          50: '#f8f1e0',
          100: '#efe0bb',
          200: '#e5cd90',
          300: '#d9b769',
          400: '#cda14f',
          500: '#b8863c',
          600: '#9a6e31',
        },
        stone: {
          150: '#d8d4cd',
          250: '#a8a29b',
        },
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.18em',
      },
      backgroundImage: {
        'gold-line': 'linear-gradient(90deg, #cda14f 0%, #e5cd90 100%)',
      },
    },
  },
  plugins: [],
};
