import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    LOCAL_DB_PATH: z.string().min(1),
    CLOUDFLARE_DB_ID: z.string().min(1),
    CLOUDFLARE_D1_TOKEN: z.string().min(1),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).optional(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
