import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { HTTPException } from 'hono/http-exception'
import authRouter from './router/auth'
import postRouter from './router/post'
import { db, lucia, responseTime } from './middlewares'
import type { Lucia } from 'lucia'
import type { createDBClient } from '@xystack/db'
import type { DatabaseUserAttributes } from '@xystack/auth'
import type { D1Database } from '@cloudflare/workers-types'

export const app = new Hono<Env>()
  .basePath('/api')

  .use(prettyJSON())
  .use(requestId())
  .use(logger())
  .use(cors())
  .use(responseTime())
  .use(db())
  .use(lucia())

  .route('/auth', authRouter)
  .route('/post', postRouter)

  .notFound((c) => c.json({ message: 'Not Found', success: false }, 404))
  .onError((error, c) => {
    console.error(error)
    if (error instanceof HTTPException) {
      const response = error.getResponse()
      return c.json(
        {
          success: false,
          message: error.message || error,
        },
        (response.status as any) || 400,
      )
    }
    return c.json({ success: false, message: error.message || error }, 400)
  })

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
