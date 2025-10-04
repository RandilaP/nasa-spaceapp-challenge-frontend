module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nasa: {
          50: '#f1f7ff',
          100: '#d9e9ff',
          200: '#b6dbff',
          300: '#86c4ff',
          400: '#61aaff',
          500: '#0b3d91',
          600: '#08306f',
          700: '#071a2b',
          accent: '#ff6b35'
        },
        semantic: {
          success: '#16a34a',
          warn: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      container: {
        center: true,
        padding: '1rem'
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(180deg, #071a2b 0%, rgba(11,61,145,0.25) 60%, #020617 100%)'
      }
    },
  },
  plugins: [],
}
