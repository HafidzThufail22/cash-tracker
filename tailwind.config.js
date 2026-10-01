/** @type {import('tailwindcss').Config} */
module.exports = {

  // Membaca styling dari App.tsx dan seluruh file di dalam folder src
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: {
          DEFAULT: "#18181B",
          dark: "#131316",
          lowest: "#0E0E11",
          low: "#1B1B1E",
          card: "#18181B",
          high: "#27272A",
          highest: "#353438",
        },
        gold: {
          DEFAULT: "#EAB308",
          primary: "#FFD165",
          container: "#EAB308",
          hover: "#CA8A04",
          surface: "#422006",
          dim: "#F7BE1D",
        },
        semantic: {
          income: "#10B981",
          expense: "#EF4444",
          transfer: "#EAB308",
        },
        border: {
          DEFAULT: "#27272A",
          subtle: "#1F1F23",
          light: "#3F3F46",
        },
      },
      fontFamily: {
        grotesk: ["SpaceGrotesk_600SemiBold"],
        "grotesk-bold": ["SpaceGrotesk_700Bold"],
        manrope: ["Manrope_400Regular"],
        "manrope-medium": ["Manrope_500Medium"],
        "manrope-semibold": ["Manrope_600SemiBold"],
        "manrope-bold": ["Manrope_700Bold"],
        mono: ["JetBrainsMono_500Medium"],
      },
    },
  },
  plugins: [],
};