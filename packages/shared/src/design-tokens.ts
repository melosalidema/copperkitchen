/**
 * Design tokens for Copper Kitchen (Bicester).
 * Shared by the web app (Tailwind config) and the API (e.g. email templates).
 * Single source of truth for brand colours, fonts and spacing.
 */
export const DESIGN_TOKENS = {
  colors: {
    // Canonical palette
    primary: '#B87333',
    primary_hover: '#9A5F28',
    secondary: '#2C2C2C',
    accent: '#D4AF37',
    background: '#FDFBF7',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    text_muted: '#6E655A',
    text_on_dark: '#F5EFE4',
    border: '#E8DFD2',
    error: '#B3402E',
    success: '#3E7B52',
    warning: '#B98A2F',
    // Backwards-compatible aliases (existing components use these class names).
    text_primary: '#1A1A1A',
    text_secondary: '#6E655A'
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Inter'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  maxContentWidth: 1280
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
