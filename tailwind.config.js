/** @type {import('tailwindcss').Config} */
module.exports = {

  // Membaca styling dari App.tsx dan seluruh file di dalam folder src
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};