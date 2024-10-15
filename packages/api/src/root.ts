import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import authRouter from './router/auth'
import postRouter from './router/post'
import { db, lucia } from './middlewares'
import type { Lucia } from 'lucia'
import type { createDBClient } from '@xystack/db'
import type { DatabaseUserAttributes } from '@xystack/auth'
import type { D1Database } from '@cloudflare/workers-types'

export const app = new Hono<Env>()

app.use('*', prettyJSON())
app.use('*', requestId())
app.use('*', logger())
app.use('*', cors())
app.use('*', db())
app.use('*', lucia())

app.route('/auth', authRouter)
app.route('/post', postRouter)

// export type definition of API
export type AppType = typeof app

export interface Env {
  Bindings: {
    DB: D1Database
  }
  Variables: {
    db: ReturnType<typeof createDBClient>
    lucia: Lucia<Record<never, never>, DatabaseUserAttributes>
  }
}
