/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6ecff',
          100: '#b3c5ff',
          200: '#809eff',
          300: '#4d77ff',
          400: '#1a50ff',
          500: '#003999', // Egyptian Blue
          600: '#002d7a', // Egyptian Blue Dark
          700: '#002166',
          800: '#001552',
          900: '#000a3d',
        },
        rojo: {
          500: '#005FFF', // Rojo (Primary 02)
          600: '#0050d9',
        },
        yellow: {
          400: '#F0C808', // Jonquil
          500: '#F0C808',
          600: '#c8a600',
        },
        accent: {
          DEFAULT: '#FFF1D0', // Papaya Whip
          light: '#FFF8ED',
        },
        brand: {
          black: '#101010', // Smoky Black
        },
      },
      fontFamily: {
        sans: ['Coolvetica', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        secondary: ['Miguer Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
