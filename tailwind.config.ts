import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        verdict: {
          pass: {
            bg: '#ecfdf5',
            border: '#6ee7b7',
            text: '#064e3b',
          },
          borderline: {
            bg: '#fffbeb',
            border: '#fcd34d',
            text: '#78350f',
          },
          weak: {
            bg: '#fef2f2',
            border: '#fca5a5',
            text: '#7f1d1d',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
