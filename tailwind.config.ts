import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyan-electric': {
          DEFAULT: '#00CFFF',
          hover: '#00B3FF',
          dark: '#0088CC',
          glow: 'rgba(0, 207, 255, 0.3)',
        },
        blackboard: {
          DEFAULT: '#0A0F1D',
          dark: '#030712',
          light: '#1E293B',
        },
        chalk: {
          DEFAULT: '#F8FAFC',
          muted: '#94A3B8',
          bright: '#FFFFFF',
        },
        'blue-ink': {
          DEFAULT: '#0284C7',
          hover: '#0369A1',
          light: '#38BDF8',
        },
        'red-pen': {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#B91C1C',
        },
        'brass-compass': {
          DEFAULT: '#38BDF8',
          light: '#7DD3FC',
          dark: '#0284C7',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'sans-serif'],
        math: ['KaTeX_Main', 'serif'],
      },
      backgroundImage: {
        'cyan-glow-radial': 'radial-gradient(circle at 50% 50%, rgba(0, 207, 255, 0.15) 0%, transparent 70%)',
        'dark-glass': 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(3, 7, 18, 0.8) 100%)',
      },
      boxShadow: {
        'cyan-glow': '0 0 25px -5px rgba(0, 207, 255, 0.3)',
        'cyan-glow-lg': '0 0 40px -5px rgba(0, 207, 255, 0.4)',
        'dark-card': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
};

export default config;
