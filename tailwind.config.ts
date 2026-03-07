import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      // Raw palette (rarely used directly)
      colors: {
        slate: {
          50: "#F6F8FA",
          100: "#EEF2F6",
          200: "#DCE3EC",
          300: "#C4CFDD",
          400: "#97A8BC",
          500: "#6F8297",
          600: "#55667A",
          700: "#3F4E60",
          800: "#2C3847",
          900: "#1B2430",
        },
        blue: {
          50: "#F3F7FB",
          100: "#E3EEF8",
          200: "#C7DDF1",
          300: "#A7C6E6",
          400: "#7FA8D6",
          500: "#5F8FC4",
          600: "#4B73A2",
          700: "#3B5A7D",
          800: "#2D445E",
          900: "#1F2F41",
        },
        copper: {
          50: "#FBF6F1",
          100: "#F3E7DD",
          200: "#E6CDBB",
          300: "#D6B093",
          400: "#C3916D",
          500: "#A87350",
          600: "#875B3F",
          700: "#6B4732",
          800: "#533728",
          900: "#3B281D",
        },
        purple: {
          50: "#F7F3F7",
          100: "#EEE3EF",
          200: "#DDC6DE",
          300: "#C9A6C9",
          400: "#B085B1",
          500: "#926592",
          600: "#764F76",
          700: "#5C3E5C",
          800: "#442E44",
          900: "#2F1F2F",
        },

        // Existing app tokens (kept for compatibility)
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        toolbar: {
          DEFAULT: "hsl(var(--toolbar))",
          foreground: "hsl(var(--toolbar-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
        },
        json: {
          string: "hsl(var(--json-string))",
          number: "hsl(var(--json-number))",
          boolean: "hsl(var(--json-boolean))",
          null: "hsl(var(--json-null))",
          key: "hsl(var(--json-key))",
          bracket: "hsl(var(--json-bracket))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Buttons / accents (semantic helpers)
        "primary-hover": "hsl(var(--primary-hover))",
        "accent-2": "hsl(var(--accent-2))",
        warm: "hsl(var(--accent-warm))",

        // Status
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",
        "success-bg": "hsl(var(--success-bg))",
        "warning-bg": "hsl(var(--warning-bg))",
        "error-bg": "hsl(var(--error-bg))",
        "info-bg": "hsl(var(--info-bg))",
      },

      // Semantic background / text tokens
      backgroundColor: {
        bg: "hsl(var(--bg))",
        surface1: "hsl(var(--surface-1))",
        surface2: "hsl(var(--surface-2))",
        code: "hsl(var(--code-bg))",
      },
      textColor: {
        text1: "hsl(var(--text-1))",
        text2: "hsl(var(--text-2))",
        text3: "hsl(var(--text-3))",
        link: "hsl(var(--link))",
      },
      borderColor: {
        border: "hsl(var(--border))",
      },
      ringColor: {
        focus: "hsl(var(--focus))",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.9rem",
        "2xl": "1.25rem",
      },

      // Gradients
      backgroundImage: {
        "grad-brand": "linear-gradient(135deg, hsl(var(--grad-a)), hsl(var(--grad-b)))",
        "grad-hero":
          "radial-gradient(1200px circle at 20% 10%, hsl(var(--grad-a) / 0.22), transparent 55%), radial-gradient(900px circle at 80% 0%, hsl(var(--grad-b) / 0.18), transparent 60%)",
        "grad-divider": "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)",
        "grad-chip": "linear-gradient(135deg, hsl(var(--chip-a)), hsl(var(--chip-b)))",
        // Dark-mode accent gradients (use with text-white for contrast)
        "grad-teal": "linear-gradient(90deg, hsl(var(--teal-grad-from)), hsl(var(--teal-grad-to)))",
        "grad-orange": "linear-gradient(90deg, hsl(var(--orange-grad-from)), hsl(var(--orange-grad-to)))",
        "grad-fuchsia": "linear-gradient(90deg, hsl(var(--fuchsia-grad-from)), hsl(var(--fuchsia-grad-to)))",
      },

      // Typography scale
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.3rem" }],
        base: ["0.95rem", { lineHeight: "1.45rem" }],
        lg: ["1.05rem", { lineHeight: "1.55rem" }],
        xl: ["1.25rem", { lineHeight: "1.7rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.3rem" }],
      },

      // Shadows (calm)
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,0.06), 0 8px 24px rgba(16,24,40,0.08)",
        "soft-dark": "0 1px 2px rgba(0,0,0,0.25), 0 10px 28px rgba(0,0,0,0.35)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

