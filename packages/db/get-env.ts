import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    LOCAL_DB_PATH: z.string().min(1).optional(),
    CLOUDFLARE_DB_ID: z.string().min(1),
    CLOUDFLARE_D1_TOKEN: z.string().min(1),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).optional().default('development'),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV === 'production',
})
