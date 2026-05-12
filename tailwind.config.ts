import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        surface: '#F3EDE4',
        'surface-2': '#EDE5D8',
        border: '#DDD4C6',
        terracotta: {
          DEFAULT: '#C4622D',
          light: '#D4734A',
          dark: '#A04E22',
        },
        olive: {
          DEFAULT: '#4A5240',
          light: '#5E6854',
        },
        ink: {
          DEFAULT: '#2C2416',
          dim: '#6B5B45',
          muted: '#9B8A74',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0px 1px 3px rgba(44,36,22,0.08)',
        md: '0px 4px 12px rgba(44,36,22,0.10)',
        lg: '0px 8px 24px rgba(44,36,22,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
