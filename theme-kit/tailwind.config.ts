import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },

      // 1) Raw palette (stable; rarely used directly in components)
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

        // Buttons / accents
        primary: "hsl(var(--primary))",
        "primary-hover": "hsl(var(--primary-hover))",
        "accent-2": "hsl(var(--accent-2))", // purple
        warm: "hsl(var(--accent-warm))", // copper

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

      // 2) Semantic tokens (use these in components)
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

      // Gradients: defined as backgroundImage utilities
      backgroundImage: {
        // Subtle, professional gradients
        "grad-brand": "linear-gradient(135deg, hsl(var(--grad-a)), hsl(var(--grad-b)))",
        "grad-hero":
          "radial-gradient(1200px circle at 20% 10%, hsl(var(--grad-a) / 0.22), transparent 55%), radial-gradient(900px circle at 80% 0%, hsl(var(--grad-b) / 0.18), transparent 60%)",
        "grad-divider": "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)",
        "grad-chip": "linear-gradient(135deg, hsl(var(--chip-a)), hsl(var(--chip-b)))",
      },

      // Typography tokens
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
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
    },
  },
  plugins: [],
};

export default config;

