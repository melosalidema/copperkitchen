import type { Config } from 'tailwindcss';
import { DESIGN_TOKENS } from '@copperkitchen/shared';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: DESIGN_TOKENS.colors
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      fontSize: {
        display: ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '1.05' }],
        h1: ['clamp(2.25rem, 5.5vw, 4rem)', { lineHeight: '1.1' }],
        h2: ['clamp(1.75rem, 4vw, 2.75rem)', { lineHeight: '1.15' }],
        h3: ['clamp(1.35rem, 2.5vw, 1.75rem)', { lineHeight: '1.25' }],
        'body-lg': ['clamp(1.05rem, 1.4vw, 1.25rem)', { lineHeight: '1.6' }]
      },
      maxWidth: {
        content: `${DESIGN_TOKENS.maxContentWidth}px`
      },
      spacing: {
        ...DESIGN_TOKENS.spacing
      }
    }
  },
  plugins: []
};

export default config;
