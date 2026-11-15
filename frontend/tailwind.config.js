/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F5EFEB',
          300: '#EAE2DA',
          400: '#DDD2C6',
        },
        lavender: {
          50: '#F7F3FD',
          100: '#EFE7FC',
          200: '#DFCFF9',
          300: '#C8AFF5',
          400: '#AA85EE',
          500: '#8E5DE4',
          600: '#753BD1',
          700: '#6028B4',
          800: '#4C208E',
        },
        ink: {
          900: '#262238',
          800: '#3A3552',
          700: '#524C6F',
          600: '#706B8E',
          500: '#948FAe',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(117, 59, 209, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(117, 59, 209, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
