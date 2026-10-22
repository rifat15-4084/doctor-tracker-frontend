import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        'bg-elevated': 'hsl(var(--bg-elevated) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
        'surface-3': 'hsl(var(--surface-3) / <alpha-value>)',
        line: 'hsl(var(--border) / <alpha-value>)',
        'line-strong': 'hsl(var(--border-strong) / <alpha-value>)',
        fg: 'hsl(var(--fg) / <alpha-value>)',
        muted: 'hsl(var(--fg-muted) / <alpha-value>)',
        subtle: 'hsl(var(--fg-subtle) / <alpha-value>)',
        accent: {
          cyan: 'hsl(var(--cyan) / <alpha-value>)',
          violet: 'hsl(var(--violet) / <alpha-value>)',
        },
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'var(--font-inter)', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px hsl(var(--shadow) / 0.4), 0 8px 24px -16px hsl(var(--shadow) / 0.6)',
        glow: '0 0 0 1px hsl(var(--cyan) / 0.28), 0 10px 40px -18px hsl(var(--cyan) / 0.55)',
        'glow-violet': '0 0 0 1px hsl(var(--violet) / 0.3), 0 10px 40px -18px hsl(var(--violet) / 0.6)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(6px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out both',
        'scale-in': 'scale-in 150ms ease-out both',
        'slide-up': 'slide-up 150ms ease-out both',
      },
      transitionTimingFunction: {
        swift: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
