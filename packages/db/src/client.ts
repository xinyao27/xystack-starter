import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'
import type { D1Database } from '@cloudflare/workers-types'

export const createDBClient = (db: D1Database) => drizzle(db, { schema, casing: 'snake_case' })
