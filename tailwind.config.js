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
      screens: { "2xl": "1320px" },
    },

    

extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'ui-serif', 'Georgia', 'serif'],
        heading: ['var(--font-playfair)', 'Playfair Display', 'ui-serif', 'serif'],
      },
      lineHeight: {
        tight: "1.2",
        snug: "1.3",
      },
    },
  },
      plugins: [],
}