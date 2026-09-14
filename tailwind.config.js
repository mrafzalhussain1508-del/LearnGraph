/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        traffic: {
          green: '#10b981',
          'green-light': '#ecfdf5',
          'green-border': '#a7f3d0',
          yellow: '#f59e0b',
          'yellow-light': '#fffbeb',
          'yellow-border': '#fde68a',
          red: '#ef4444',
          'red-light': '#fef2f2',
          'red-border': '#fecaca',
        },
        notebook: {
          paper: '#fcfbf7',
          line: '#e8e5dc',
          margin: '#f87171',
          grid: '#f1efe9',
          ink: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        handwriting: ['Caveat', 'Patrick Hand', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'notebook': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'paper': '0 1px 3px rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
