export const semanticTokens = {
  surfaces: {
    bg: "bg-bg",
    surface1: "bg-surface1",
    surface2: "bg-surface2",
    code: "bg-code",
  },
  text: {
    primary: "text-text1",
    secondary: "text-text2",
    subtle: "text-text3",
    link: "text-link",
  },
  borders: {
    default: "border-border",
    focusRing: "ring-focus",
  },
  accents: {
    primary: "bg-primary",
    primaryHover: "bg-primary-hover",
    accent2: "bg-accent-2",
    warm: "bg-warm",
  },
  status: {
    success: "text-success",
    successBg: "bg-success-bg",
    warning: "text-warning",
    warningBg: "bg-warning-bg",
    error: "text-error",
    errorBg: "bg-error-bg",
    info: "text-info",
    infoBg: "bg-info-bg",
  },
  gradients: {
    brand: "bg-grad-brand",
    hero: "bg-grad-hero",
    divider: "bg-grad-divider",
    chip: "bg-grad-chip",
  },
} as const;

export type SurfaceToken = keyof typeof semanticTokens.surfaces;
export type TextToken = keyof typeof semanticTokens.text;

