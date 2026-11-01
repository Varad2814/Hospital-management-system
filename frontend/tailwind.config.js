/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Hospital Palette ──────────────────────────────────────────────
        sage: {
          50:  '#f0faf4',
          100: '#dcf5e5',
          200: '#bbebcc',
          300: '#8dd9ab',
          400: '#57c082',
          500: '#32a661',
          600: '#2E7D63',   // Primary accent
          700: '#1f5c47',
          800: '#1a4a39',
          900: '#163d2f',
        },
        beige: {
          50:  '#F7F6F2',   // Main background
          100: '#EAE8E1',   // Card surface
          200: '#dbd8ce',
          300: '#c9c5b8',
          400: '#b0ab9d',
        },
        // Emergency triage palette (softened)
        triage: {
          critical: '#E57373',  // Soft Red/Coral
          urgent:   '#FFB74D',  // Soft Amber
          minor:    '#81C784',  // Soft Green
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
