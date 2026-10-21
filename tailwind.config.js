/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // Prefix styles to preserve the existing HOXO application UI.
  prefix: 'halo-',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: { halopage: '#F5F5F5', halonight: '#2B2644' },
      fontFamily: { sans: ['TT Norms Pro', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      maxWidth: { halo: '88rem' },
    },
  },
  plugins: [],
}
