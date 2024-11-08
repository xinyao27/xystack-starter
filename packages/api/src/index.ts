import type { D1Database } from '@cloudflare/workers-types'

export * from './root'

declare global {
  interface CloudflareEnv {
    DB: D1Database
  }
}
