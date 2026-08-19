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
          main: '#000066',
          deep: '#0A0A3D',
          light: '#23237A',
          hover: '#1a1a7e',
        },
        tan: {
          gold: '#C89D7C',
          light: '#F7ECE1',
          hover: '#b58866',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
