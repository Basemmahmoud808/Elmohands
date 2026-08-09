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
        blackboard: {
          DEFAULT: '#22322A',
          dark: '#18241E',
          light: '#2E4238',
        },
        chalk: {
          DEFAULT: '#E7E2D3',
          muted: '#B5AF9D',
          bright: '#FAF8F0',
        },
        'blue-ink': {
          DEFAULT: '#1F3A5F',
          hover: '#162A45',
          light: '#2C5082',
        },
        'red-pen': {
          DEFAULT: '#A3402F',
          light: '#C7513C',
          dark: '#7D2E21',
        },
        'brass-compass': {
          DEFAULT: '#AD8A4E',
          light: '#C9A564',
          dark: '#8C6C35',
        },
        'notebook-paper': {
          DEFAULT: '#E9E1C8',
          dark: '#DFD6BA',
          light: '#F4EFE0',
        },
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'sans-serif'],
        math: ['KaTeX_Main', 'serif'],
      },
      backgroundImage: {
        'blackboard-texture': "radial-gradient(circle at 50% 50%, rgba(46, 66, 56, 0.5) 0%, rgba(24, 36, 30, 0.9) 100%)",
        'grid-pattern': "linear-gradient(to right, rgba(173, 138, 78, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(173, 138, 78, 0.08) 1px, transparent 1px)",
      },
      boxShadow: {
        'chalk': '0 4px 14px 0 rgba(231, 226, 211, 0.1)',
        'blackboard': '0 10px 30px -10px rgba(24, 36, 30, 0.8)',
      },
    },
  },
  plugins: [],
};

export default config;
