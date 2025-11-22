/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A19C',
        second: '#c1dade',
        third: '#F2F7FF',
      },
    },
  },

  plugins: [],
}
