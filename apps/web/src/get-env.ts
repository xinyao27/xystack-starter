import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'
import { env as authEnv } from '@xystack/auth/env'

export const env = createEnv({
  extends: [authEnv],
  clientPrefix: 'PUBLIC_',
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {},
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `PUBLIC_`.
   */
  client: {
    // PUBLIC_CLIENTVAR: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})