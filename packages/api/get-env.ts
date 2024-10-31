import { createEnv } from '@t3-oss/env-nextjs'
import { env as authEnv } from '@xystack/auth/env'

export const env = createEnv({
  extends: [authEnv],
  server: {},
  client: {},
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV === 'production',
})
