import baseConfig from '@xystack/tailwind-config/web'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    ...baseConfig.content,
    '../../packages/ui/src/*.{ts,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [baseConfig],
}
export default config
