import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 60px rgba(130, 75, 40, 0.22)'
      },
      backgroundImage: {
        'warm-gradient':
          'radial-gradient(circle at top, rgba(255, 247, 237, 0.95) 0%, rgba(247, 235, 223, 0.88) 40%, rgba(233, 211, 190, 0.8) 100%)'
      },
      colors: {
        ink: '#2b1d18',
        cocoa: '#5f352a',
        clay: '#8c4b38',
        amber: '#c98a2a',
        cream: '#f8f1e8',
        blush: '#f6dfd3',
        olive: '#6a7a4a'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Segoe UI', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}

export default config
