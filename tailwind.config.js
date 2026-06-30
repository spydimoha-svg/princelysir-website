/** @type {import('tailwindcss').Config} */
// Mirrors the theme that previously lived in the inline `tailwind.config` script.
// Build the stylesheet with:  npm run build:css   (see package.json)
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F3EA',
        paper2: '#EFE8D9',
        ink: '#18191A',
        body: '#3A3C3B',
        muted: '#7A7D79',
        teal: '#1C6E66',
        tealdark: '#14534D',
        line: '#DED6C5',
        card: '#FDFBF6',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Spline Sans Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        photo: '0 2px 8px rgba(20,40,38,.06), 0 30px 60px -30px rgba(20,40,38,.30)',
        card: '0 1px 2px rgba(20,40,38,.04), 0 18px 40px -24px rgba(20,40,38,.22)',
      },
    },
  },
  plugins: [],
};
