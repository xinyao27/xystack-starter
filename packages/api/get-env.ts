import { createEnv } from '@t3-oss/env-core'
import { env as authEnv } from '@xystack/auth/env'

export const env = createEnv({
  extends: [authEnv],
  clientPrefix: 'PUBLIC_',
  server: {},
  client: {},
  runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV === 'production'
})
