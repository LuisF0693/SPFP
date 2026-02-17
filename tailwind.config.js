/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        pixel: ['Courier New', 'monospace'],
      },
      colors: {
        // Esquema SPFP: Preto e Azul Neon
        primary: '#000000',
        secondary: '#0f172a',
        accent: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        'card-dark': '#0f172a',
        'bg-dark': '#020617',
        // STITCH Design System Colors
        stitch: {
          primary: '#135bec',
          'primary-hover': '#1048c7',
          'primary-light': 'rgba(19, 91, 236, 0.1)',
          'bg-light': '#f6f6f8',
          'bg-dark': '#101622',
          'surface-light': '#FFFFFF',
          'surface-dark': '#1A2233',
          'surface-darker': '#111722',
          'border-light': '#e6e8eb',
          'border-dark': '#2e374a',
          'border-hover': '#3e4a63',
          'text-primary-light': '#111418',
          'text-primary-dark': '#FFFFFF',
          'text-secondary-light': '#637588',
          'text-secondary-dark': '#92a4c9',
          'text-muted': '#6e85a3',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        // Virtual Office animations
        'breathing': 'breathing 3s ease-in-out infinite',
        'typing': 'typing 0.5s ease-in-out infinite',
        'thinking': 'thinking 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
        },
        // Virtual Office keyframes
        breathing: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        typing: {
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-2px)' },
          '75%': { transform: 'translateY(2px)' },
        },
        thinking: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    }
  },
  plugins: [],
}
