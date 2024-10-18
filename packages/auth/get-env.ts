import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: {
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    AUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().min(1).optional(),
    NODE_ENV: z.enum(['development', 'production']).optional(),
  },
  client: {},
  runtimeEnv: typeof process === 'undefined' ? (import.meta as any).env : process.env,
  skipValidation: typeof process === 'undefined' ? (import.meta as any).env.PROD : process.env.NODE_ENV === 'production'
})
