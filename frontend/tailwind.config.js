/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#333333",
        "secondary": "#5f6368",
        "accent": "#4a5d4e",
        "background": "#fdfaf1",
        "surface": "#f5f2e8",
        "text-primary": "#333333",
        "text-secondary": "#5a5a5a",
        "terminal-bg": "#1a1a1a",
        "terminal-green": "#4ade80",
        "terminal-blue": "#60a5fa",
      },
      fontFamily: {
        headline: ["'Merriweather'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
