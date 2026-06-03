/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0D0D0D',
          secondary: '#111118',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#D4BA89',
          dark: '#B8934A',
        },
        'accent-rose': '#E8B4B8',
        'text-primary': '#F5F0E8',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderColor: {
        glass: 'rgba(255, 255, 255, 0.08)',
      },
      backgroundColor: {
        glass: 'rgba(255, 255, 255, 0.04)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}
