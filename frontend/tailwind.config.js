/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0d0d0d',
          800: '#141414',
          700: '#1a1a1a',
          600: '#202020',
          500: '#2a2a2a',
          400: '#333333',
        },
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
          400: '#818cf8',
        },
      },
    },
  },
  plugins: [],
};
