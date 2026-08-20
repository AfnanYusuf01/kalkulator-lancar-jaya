/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          main: '#3B82F6',       // Vibrant Dodger Blue
          deep: '#0F172A',       // Deep Slate-Indigo
          light: '#60A5FA',      // Light Dodger Blue
          hover: '#2563EB',      // Hover Dodger Blue
        },
        tan: {
          gold: '#3B82F6',       // Vibrant Dodger Blue
          light: '#EFF6FF',      // Soft Dodger Blue Tint
          hover: '#2563EB',      // Hover Dodger Blue
        }
      },




      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
