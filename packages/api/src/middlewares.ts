import { createDBClient } from '@xystack/db/client'
import { createMiddleware } from 'hono/factory'
import { createLucia } from '@xystack/auth'

export const db = () =>
  createMiddleware(async (c, next) => {
    const db = createDBClient(c.env.DB)
    c.set('db', db)
    await next()
  })

export const lucia = () =>
  createMiddleware(async (c, next) => {
    const db = c.get('db')
    const lucia = createLucia(db)
    c.set('lucia', lucia)
    await next()
  })

export const responseTime = () =>
  createMiddleware(async (c, next) => {
    const start = Date.now()
    await next()
    const end = Date.now()
    c.res.headers.set('X-Response-Time', `${end - start}`)
  })
