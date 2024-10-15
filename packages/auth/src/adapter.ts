import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
import { sessions, users } from '@xystack/db'
import type { createDBClient } from '@xystack/db'

export const createAdapter = (db: ReturnType<typeof createDBClient>) => new DrizzleSQLiteAdapter(db, sessions, users)
