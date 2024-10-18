import { createEnv } from '@t3-oss/env-core'
import { env as authEnv } from '@xystack/auth/env'
import { env as dbEnv } from '@xystack/db/env'
import { z } from 'zod'

export const env = createEnv({
  extends: [authEnv, dbEnv],
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
  runtimeEnvStrict: {
    ...process.env,
    ...(import.meta as any).env,
  },
  skipValidation: import.meta.env.PROD
})
