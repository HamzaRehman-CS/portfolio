/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#151515',
          secondary: '#202020',
          tertiary: '#232323',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B7B7B7',
          tertiary: '#878787',
        },
        accent: '#00D4FF',
        success: '#00FF94',
        danger: '#FF3333',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.5rem',
        sm: '0.75rem',
        pill: '2em',
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        xs: "calc(var(--radius) - 6px)",
      },
      maxWidth: {
        container: '1440px',
        narrow: '1200px',
        content: '800px',
      },
      zIndex: {
        cursor: '9999',
        nav: '100',
        overlay: '50',
        floating: '10',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.5" },
        },
        "scroll-circle": {
          "0%, 100%": { top: "0%" },
          "50%": { top: "100%" },
        },
        "cursor-ring": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "scroll-circle": "scroll-circle 1.5s ease-in-out infinite",
        "cursor-ring": "cursor-ring 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
