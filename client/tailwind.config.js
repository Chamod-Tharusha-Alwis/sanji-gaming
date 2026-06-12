/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gaming: {
          dark: '#0a0e17',
          deeper: '#0f1724',
          card: '#1a2332',
          border: 'rgba(0,240,255,0.1)',
        },
        accent: {
          cyan: '#00f0ff',
          orange: '#ff6b35',
        },
        status: {
          sold: '#ef4444',
          available: '#22c55e',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        gaming: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(0,240,255,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0,240,255,0.6), 0 0 40px rgba(0,240,255,0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
