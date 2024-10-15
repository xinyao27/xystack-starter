import { env } from './get-env'
import type { Config } from 'drizzle-kit'

export default env.LOCAL_DB_PATH
  ? ({
      schema: './src/schema/index.ts',
      dialect: 'sqlite',
      dbCredentials: {
        url: env.LOCAL_DB_PATH,
      },
      casing: 'snake_case',
    } satisfies Config)
  : ({
      schema: './src/schema/index.ts',
      out: './migrations',
      dialect: 'sqlite',
      driver: 'd1-http',
      dbCredentials: {
        databaseId: env.CLOUDFLARE_DB_ID,
        token: env.CLOUDFLARE_D1_TOKEN,
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
      },
      casing: 'snake_case',
    } satisfies Config)
