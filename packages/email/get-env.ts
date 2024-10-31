import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    RESEND_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).optional().default('development'),
  },
  client: {},
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV === 'production'
})
