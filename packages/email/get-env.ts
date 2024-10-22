import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  server: {
    RESEND_API_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).optional().default('development'),
  },
  client: {},
  runtimeEnvStrict: {
    ...process.env,
    ...(import.meta as any).env,
  },
  skipValidation: typeof process === 'undefined' ? (import.meta as any).env.PROD : process.env.NODE_ENV === 'production'
})
