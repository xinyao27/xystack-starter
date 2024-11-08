import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import { env as emailEnv } from '@xystack/email/env'

export const env = createEnv({
  extends: [emailEnv],
  server: {
    REDIRECT_URL: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    AUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().min(1).optional(),
    NODE_ENV: z.enum(['development', 'production']).optional().default('development'),
  },
  client: {},
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV === 'production'
})
