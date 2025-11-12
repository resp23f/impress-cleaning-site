/** 
 * This tells TypeScript/VSCode that this is a Tailwind configuration file.
 * It helps with autocomplete and error checking in your editor.
 * @type {import('tailwindcss').Config} 
 */
module.exports = {
  
  /**
   * CONTENT ARRAY
   * This tells Tailwind WHERE to look for class names in your project.
   * Tailwind scans these files and only includes the CSS for classes you actually use.
   * This keeps your final CSS file small and fast.
   */
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",        // Scans all files in the app folder (Next.js App Router)
    "./src/components/**/*.{js,jsx,ts,tsx}", // Scans all component files
    "./src/**/*.{js,jsx,ts,tsx}",            // Scans everything else in src folder (backup catch-all)
  ],

  /**
   * THEME OBJECT
   * This is where you customize Tailwind's default design system.
   * Two main sections: 
   * 1. Direct properties (like 'container') - these REPLACE Tailwind defaults
   * 2. 'extend' property - these ADD to Tailwind defaults without removing anything
   */
  
  safelist: [
    'bg-green',
    'hover:bg-green',
    'hover:bg-greenHover',
    'text-green',
    'bg-greenHover',
    'bg-navy',
    'text-navy',
    'bg-navyDark',
    'text-navyDark',
    'text-textPrimary',
    'text-textSecondary',
    'text-textLight',
    'border-borderGray',
    'text-borderGray',
    'bg-background',
  ],
  theme: {
    
    /**
     * CONTAINER CONFIGURATION
     * The 'container' class in Tailwind creates a max-width wrapper for content.
     * Example: <div className="container"> will be centered with max-width.
     */
    container: {
      
      /**
       * center: true
       * Automatically adds margin-left: auto and margin-right: auto
       * This centers your container on the page
       */
      center: true,
      
      /**
       * PADDING OBJECT
       * Adds horizontal padding (left and right) to containers at different screen sizes.
       * This creates "breathing room" between content and screen edges.
       * DEFAULT = mobile (0px and up)
       * sm, md, lg, xl = larger screens
       */
      padding: {
        DEFAULT: "1rem",   // 16px padding on mobile
        sm: "1.25rem",     // 20px padding on small screens (640px+)
        md: "2rem",        // 32px padding on medium screens (768px+)
        lg: "3rem",        // 48px padding on large screens (1024px+)
        xl: "4rem",        // 64px padding on extra large screens (1280px+)
      },
    },

    /**
     * EXTEND OBJECT
     * Everything inside 'extend' ADDS to Tailwind's defaults without replacing them.
     * This is safer than overriding - you keep all of Tailwind's built-in utilities
     * PLUS your custom ones.
     */
    extend: {
      
      /**
       * FONT FAMILY
       * Defines custom font stacks that you can use with utility classes.
       * 
       * How this works:
       * 1. var(--font-sans) - Uses the CSS variable from your layout.jsx
       * 2. "Manrope" - Fallback if CSS variable fails
       * 3. system-ui, sans-serif - System fallbacks if web fonts fail to load
       * 
       * Usage in your code:
       * - font-sans → Uses Manrope (body text)
       * - font-display → Uses Onest (headings, logo)
       * - font-manrope → Forces Manrope
       * - font-onest → Forces Onest
       */
      fontFamily: {
        sans: ["var(--font-sans)", "Manrope", "system-ui", "sans-serif"],      // Default body font
        display: ["var(--font-display)", "Onest", "ui-serif", "serif"],        // Headings & logo
        manrope: ["Manrope", "sans-serif"],                                     // Explicit Manrope
        onest: ["Onest", "sans-serif"],                                         // Explicit Onest
      },
      
      /**
       * COLORS
       * Custom colors from your brand that you can use with Tailwind utilities.
       * These are your exact logo colors + supporting colors for different contexts.
       * 
       * Usage examples:
       * - text-navy → Makes text navy blue
       * - bg-green → Makes background green
       * - border-borderGray → Makes border light gray
       * - hover:text-green → Text turns green on hover
       */
      colors: {
        
        // ========== SITE BACKGROUND ==========
        
        /**
         * background: "#FAFAF8"
         * Warm off-white for the main site background.
         * 
         * Why not pure white?
         * - Pure white (#FFFFFF) feels sterile and clinical
         * - This warm off-white is welcoming and reduces eye strain
         * - Barely noticeable but makes the site feel more comfortable
         * - Perfect for a home cleaning business (warm = home)
         * 
         * Use for:
         * - Main page backgrounds
         * - Section backgrounds (instead of bg-white)
         * 
         * Example: className="bg-background"
         */
        background: "#FAFAF8",
        
        // ========== BRAND COLORS (from your logo) ==========
        
        /**
         * navy: "#1C294E"
         * Your primary brand navy blue from the logo.
         * 
         * Use for:
         * - Headings (h1, h2, h3)
         * - Navigation links
         * - Card titles
         * - Logo text "IMPRESS"
         * 
         * Example: className="text-navy"
         */
        navy: "#1C294E",
        
        /**
         * green: "#079447"
         * Your primary brand green from the logo.
         * 
         * Use for:
         * - All CTA buttons
         * - Hover states on links
         * - Accent elements
         * - Icons
         * - Logo subtext "CLEANING SERVICES LLC"
         * 
         * Example: className="bg-green text-white"
         */
        green: "#079447",
        
        // ========== BACKGROUND COLORS ==========
        
        /**
         * navyDark: "#0B2850"
         * Darker navy for section backgrounds.
         * 
         * Use for:
         * - Dark sections like "Why Texas Families Trust Impress"
         * - Must pair with white text for contrast
         * 
         * Example: className="bg-navyDark text-white"
         */
        navyDark: "#0B2850",
        
        // ========== TEXT COLORS (for light backgrounds) ==========
        
        /**
         * textPrimary: "#1C294E"
         * Same as navy - for headings on white/light backgrounds.
         * 
         * Use for:
         * - H1, H2, H3 headings
         * - Important text that needs emphasis
         * 
         * Example: className="text-textPrimary"
         */
        textPrimary: "#1C294E",
        
        /**
         * textSecondary: "#2C3A4B"
         * Blue-tinted gray for body text on white/light backgrounds.
         * 
         * Why this gray?
         * - Has a blue undertone that matches your navy brand
         * - Dark enough for excellent readability (12:1 contrast)
         * - Softer than pure black for a modern, professional look
         * 
         * Use for:
         * - Paragraph text
         * - Card descriptions
         * - Body content
         * 
         * Example: className="text-textSecondary"
         */
        textSecondary: "#2C3A4B",
        
        /**
         * textLight: "#64748B"
         * Lighter gray for subtle text.
         * 
         * Use for:
         * - Captions
         * - Metadata (dates, authors)
         * - Less important information
         * - Placeholder text
         * 
         * Example: className="text-textLight"
         */
        textLight: "#64748B",
        
        // ========== TEXT COLORS (for dark backgrounds) ==========
        
        /**
         * textWhite: "#FFFFFF"
         * Pure white for text on dark navy backgrounds.
         * 
         * Use for:
         * - Headings in dark sections
         * - Important text on navyDark background
         * 
         * Note: You can also just use Tailwind's built-in "text-white"
         * This is here for consistency in your color system.
         * 
         * Example: className="text-white" (built-in works fine)
         */
        textWhite: "#FFFFFF",
        
        // ========== BORDERS & OUTLINES ==========
        
        /**
         * borderGray: "#E7EBF0"
         * Light gray for borders, dividers, and card outlines.
         * 
         * Use for:
         * - Card borders
         * - Divider lines
         * - Input borders
         * - Section separators
         * 
         * Example: className="border border-borderGray"
         */
        borderGray: "#E7EBF0",
        
        // ========== HOVER STATE VARIATIONS (optional) ==========
        
        /**
         * greenHover: "#08A855"
         * Slightly lighter green for hover effects.
         * 
         * Use for:
         * - Button hover states
         * - Link hover effects
         * 
         * Alternative: You can also use "hover:bg-green/90" (90% opacity)
         * which achieves a similar effect without a separate color.
         * 
         * Example: className="bg-green hover:bg-greenHover"
         */
        greenHover: "#08A855",
      },
      
      /**
       * CUSTOM BREAKPOINTS
       * Add custom screen sizes beyond Tailwind's defaults.
       * 
       * Tailwind's default breakpoints (these are built-in, you don't need to define them):
       * - sm: 640px   (small phones in landscape, tablets in portrait)
       * - md: 768px   (tablets) ← Your iPad Pro uses this
       * - lg: 1024px  (laptops, desktops)
       * - xl: 1280px  (large desktops)
       * - 2xl: 1536px (extra large desktops)
       * 
       * We're only adding ONE custom breakpoint here:
       */
      screens: {
        /**
         * 3xl: '1920px'
         * For ultra-wide monitors and 4K displays.
         * 
         * Usage: className="3xl:text-6xl"
         * This means: "On screens 1920px and wider, make text size 6xl"
         */
        '3xl': '1920px',
      },
    },
  },
  
  /**
   * PLUGINS ARRAY
   * Tailwind plugins add extra utilities or components.
   * Examples of popular plugins:
   * - @tailwindcss/forms (better form styling)
   * - @tailwindcss/typography (prose styling)
   * - @tailwindcss/aspect-ratio (aspect ratio utilities)
   * 
   * You have none installed currently - this is fine for most projects.
   * Add plugins here if you install any in the future.
   */
  plugins: [],
}