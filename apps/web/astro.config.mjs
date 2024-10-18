import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

// Validate the environment variables
await import('./src/get-env')

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: { path: '../../.wrangler/state/v3' },
      configPath: '../../wrangler.toml',
    },
    imageService: 'passthrough',
  }),

  security: {
    checkOrigin: true,
  },

  integrations: [react(), tailwind()],

  vite: {
    define: {
      'process.env': process.env,
    },
  },
})
