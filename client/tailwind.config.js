/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EFECE6',
        cream: '#F7F4EE',
        ink: '#141613',
        muted: '#5C564E',
        stone: '#8A847A',
        line: '#DDD6CC',
        accent: '#FF4D1C',
        'accent-deep': '#D4360B',
        forest: '#1E4A38',
        danger: '#B42318',
      },
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      maxWidth: {
        site: '1180px',
      },
      boxShadow: {
        card: '0 24px 60px -36px rgba(20, 22, 19, 0.45)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};
