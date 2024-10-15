import baseConfig from '@xystack/tailwind-config/web'

/** @type {import('tailwindcss').Config} */
export default {
  content: [...baseConfig.content, '../../packages/ui/src/*.{ts,tsx}'],
  presets: [baseConfig],
  theme: {
    extend: {},
  },
  plugins: [],
}
