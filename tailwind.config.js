/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        md: "2rem",
        lg: "3rem",
        xl: "4rem",
      },
      screens: { 
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        '2xl': '1536px',
        '3xl': '1920px', 
      },
    },

    extend: {
      fontFamily: {
        fontFamily: {
          sans: ["var(--font-sans)", "Manrope", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
          display: ["var(--font-display)", "DM Display", "serif"],
          manrope: ["Manrope", "sans-serif"],
          dmDisplay: ["DM Display", "serif"],
        },      },
      colors: {
        brandNavy: "#18335A",
        brandEmerald: "#00A884",
        outlineGray: "#E7EBF0",
        textNavy: "#2C3A4B",
      },
    },
    lineHeight: {
      tight: "1.2",
      snug: "1.3",
    },
  },
      plugins: [],
}