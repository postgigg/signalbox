import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        paper: '#FAFAFA',
        signal: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
        stone: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#CBD5E1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8FAFC',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#CA8A04',
          light: '#FEFCE8',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        tier: {
          hot: '#DC2626',
          warm: '#CA8A04',
          cold: '#94A3B8',
        },
      },
      fontFamily: {
        display: ['Newsreader', 'Instrument Serif', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Instrument Sans', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
        '6xl': '60px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.04)',
        md: '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.04)',
        xl: '0 25px 50px -12px rgba(0,0,0,0.12)',
      },
      maxWidth: {
        content: '1140px',
        prose: '672px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        spring: '350ms',
      },
      spacing: {
        sidebar: '240px',
        'slide-over': '480px',
      },
    },
  },
  plugins: [],
};

export default config;
