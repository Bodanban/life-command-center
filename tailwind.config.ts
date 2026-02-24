import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg-deep': '#0a0a0f',
        'cyber-bg': '#1a1a2e',
        'cyber-bg-panel': '#16213e',
        'cyber-bg-elevated': '#1e2a4a',
        'cyber-blue': '#00d4ff',
        'cyber-purple': '#b400ff',
        'cyber-green': '#00ff88',
        'cyber-red': '#ff0040',
        'cyber-yellow': '#ffd700',
        'cyber-pink': '#ff6ec7',
        'cyber-text': '#e0e0ff',
        'cyber-text-dim': '#7a7a9e',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00d4ff, 0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.1)',
        'neon-purple': '0 0 5px #b400ff, 0 0 20px rgba(180,0,255,0.4), 0 0 40px rgba(180,0,255,0.1)',
        'neon-green': '0 0 5px #00ff88, 0 0 20px rgba(0,255,136,0.4), 0 0 40px rgba(0,255,136,0.1)',
        'neon-red': '0 0 5px #ff0040, 0 0 20px rgba(255,0,64,0.4), 0 0 40px rgba(255,0,64,0.1)',
        'neon-yellow': '0 0 5px #ffd700, 0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.1)',
        'glass': '0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(0,212,255,0.1)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'glow-purple': 'glow-purple 3s ease-in-out infinite alternate',
        'scan': 'scan 8s linear infinite',
        'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'progress-fill': 'progress-fill 1s ease-out',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        'glow': {
          from: { textShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          to: { textShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff' },
        },
        'glow-purple': {
          from: { textShadow: '0 0 5px #b400ff, 0 0 10px #b400ff' },
          to: { textShadow: '0 0 10px #b400ff, 0 0 20px #b400ff, 0 0 40px #b400ff' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'typing': {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#00d4ff' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to: { width: 'var(--progress-width)' },
        },
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};

export default config;
