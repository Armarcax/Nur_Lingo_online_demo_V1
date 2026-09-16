/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── COLOR SYSTEM ──────────────────────────────────────────────
      colors: {
        // shadcn/Radix semantic tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        background: {
          DEFAULT: 'hsl(var(--background))',
          light: '#faf8f6',
          dark: '#0c0c12',
          card: {
            light: 'rgba(255,255,255,0.55)',
            dark: 'rgba(20,20,30,0.55)',
          }
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
        },
        // Armenian Flag Colors
        hy: {
          red: '#D90012',
          blue: '#0033A0',
          orange: '#F2A800',
        },
        // Pomegranate Palette
        pomegranate: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Cream Neutrals
        cream: {
          50: '#fcf9f7',
          100: '#f8f3ef',
          200: '#f0e7e0',
          300: '#e5d8cd',
          400: '#d4c2b3',
          500: '#c4ac9a',
        },
        // Glass effects
        glass: {
          light: 'rgba(255,255,255,0.12)',
          medium: 'rgba(255,255,255,0.08)',
          dark: 'rgba(255,255,255,0.04)',
        },
      },

      // ─── FONTS ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        armenian: ['"Noto Serif Armenian"', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },

      // ─── BACKGROUND IMAGES ─────────────────────────────────────────
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
      },

      // ─── SHADOWS ────────────────────────────────────────────────────
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        'glass-xl': '0 30px 80px rgba(0,0,0,0.15), 0 6px 24px rgba(0,0,0,0.08)',
        'premium': '0 10px 40px rgba(217,0,18,0.2), 0 2px 12px rgba(217,0,18,0.08)',
        'premium-orange': '0 10px 40px rgba(242,168,0,0.25), 0 2px 12px rgba(242,168,0,0.1)',
        'soft': '0 2px 8px rgba(0,0,0,0.04)',
        'soft-lg': '0 8px 24px rgba(0,0,0,0.06)',
      },

      // ─── BACKDROP BLUR ─────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        glass: '16px saturate(1.4)',
        soft: '8px saturate(1.2)',
      },

      // ─── ANIMATIONS ────────────────────────────────────────────────
      animation: {
        // Floating
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        // Slide
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        // Bounce
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'mascot-bounce': 'mascot-bounce 3s ease-in-out infinite',
        // Pulse
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        // Effects
        'shimmer': 'shimmer 2s linear infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        // Glass
        'glass-appear': 'glassAppear 0.4s ease-out forwards',
        // Nuri
        'nuri-float': 'nuriFloat 3.5s ease-in-out infinite',
        'nuri-glow': 'nuriGlow 3s ease-in-out infinite',
        'nuri-celebrate': 'nuriCelebrate 0.8s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        mascotBounce: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        glassAppear: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        nuriFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        nuriGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(217,0,18,0.15))' },
          '50%': { filter: 'drop-shadow(0 0 40px rgba(217,0,18,0.3))' },
        },
        nuriCelebrate: {
          '0%, 100%': { transform: 'rotate(-5deg) scale(1)' },
          '25%': { transform: 'rotate(5deg) scale(1.05)' },
          '50%': { transform: 'rotate(-5deg) scale(1)' },
          '75%': { transform: 'rotate(5deg) scale(1.05)' },
        },
      },

      // ─── BORDER RADIUS ────────────────────────────────────────────
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },

      // ─── SPACING ───────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },

      // ─── Z-INDEX ───────────────────────────────────────────────────
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}