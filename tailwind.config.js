/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // Prefix styles to preserve the existing HOXO application UI.
  prefix: 'halo-',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: { halopage: '#F5F5F5', halonight: '#2B2644' },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['P22 Mackinac W01 Book', 'Georgia', 'serif'],
      },
      spacing: { 26: '6.5rem' },
      maxWidth: { halo: '88rem' },
    },
  },
  plugins: [],
}
