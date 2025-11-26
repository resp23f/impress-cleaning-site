/** @type {import('tailwindcss').Config} */
module.exports = {  
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",        
    "./src/app/(routes)/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}",            
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",   // 16px padding on mobile
        sm: "1.25rem",     // 20px padding on small screens (640px+)
        md: "2rem",        // 32px padding on medium screens (768px+)
        lg: "3rem",        // 48px padding on large screens (1024px+)
        xl: "4rem",        // 64px padding on extra large screens (1280px+)
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Manrope", "system-ui", "sans-serif"],      // Default body font
        display: ["var(--font-display)", "Onest", "ui-serif", "serif"],        // Headings & logo
        manrope: ["Manrope", "sans-serif"],                                     // Explicit Manrope
        onest: ["Onest", "sans-serif"],                                         // Explicit Onest
      },
      colors: {
        background: "#FAFAF8",
        navy: "#1C294E",        
        green: "#5FB87E",
        '--softgreen': "var(--softgreen)",
        navyDark: "#0B2850",
        textPrimary: "#1C294E",
        textSecondary: "#2C3A4B",
        textLight: "#64748B",
        textWhite: "#FFFFFF",
        borderGray: "#E7EBF0",
        greenHover: "#08A855",
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}