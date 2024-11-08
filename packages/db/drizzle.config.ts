import { env } from './get-env'
import type { Config } from 'drizzle-kit'

const baseConfig: Config = {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'sqlite',
  casing: 'snake_case',
}

export default env.LOCAL_DB_PATH
  ? {
      ...baseConfig,
      dbCredentials: {
        url: env.LOCAL_DB_PATH,
        wranglerConfigPath: '../../apps/web/wrangler.toml',
      },
    }
  : {
      ...baseConfig,
      driver: 'd1-http',
      dbCredentials: {
        databaseId: env.CLOUDFLARE_DB_ID,
        token: env.CLOUDFLARE_D1_TOKEN,
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
      },
    }
