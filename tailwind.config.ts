import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'background-light': 'var(--color-background-light)',
        'background-dark': 'var(--color-background-dark)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        timer: ['var(--font-timer)'],
      },
    },
  },
  plugins: [],
}
export default config
