module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        default: ['Inter'],
      },
      spacing: {
        '54': '13.5rem',
        '180': '45rem',
        '160': '40rem',
      }
    },
  },
  plugins: [],
}