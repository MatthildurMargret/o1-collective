/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        parchment: {
          50: '#FDFCF9',
          100: '#F4F1EB',
          200: '#E8E3D8',
          300: '#DDD9CF',
          400: '#C8C3B8',
        },
        ink: {
          900: '#1A1815',
          700: '#3D3A34',
          500: '#6B6760',
          300: '#A8A49C',
          100: '#D4D0C8',
        },
      },
    },
  },
  plugins: [],
}
