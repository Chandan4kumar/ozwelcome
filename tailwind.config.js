/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ochre: {
          50: '#fef9f0',
          100: '#fdf0db',
          200: '#f9dfb5',
          300: '#f4c87e',
          400: '#eeab47',
          500: '#e8922a',
          600: '#d9741a',
          700: '#b55518',
          800: '#92441b',
          900: '#773a1a',
        },
        eucalyptus: {
          50: '#f0f7f2',
          100: '#d9edde',
          200: '#b6dbc1',
          300: '#86c29c',
          400: '#5aa57a',
          500: '#3d8b62',
          600: '#2d6f4e',
          700: '#265a40',
          800: '#214835',
          900: '#1c3c2d',
        },
        sky: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfddfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sand: {
          50: '#faf8f5',
          100: '#f3efe7',
          200: '#e8e0d2',
          300: '#d5c9b4',
          400: '#c1ad94',
          500: '#ad9779',
          600: '#9a8368',
          700: '#7f6b55',
          800: '#685748',
          900: '#56493e',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'Helvetica Neue', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
