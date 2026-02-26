/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark theme inspired by VSCode
        editor: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          active: '#37373d',
          border: '#3c3c3c',
          hover: '#2a2d2e',
        },
        accent: {
          primary: '#0098ff',
          secondary: '#00d4aa',
          warning: '#ffcc00',
          error: '#ff5555',
        },
        text: {
          primary: '#cccccc',
          secondary: '#858585',
          muted: '#6e6e6e',
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
        sans: ["'Inter'", 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
