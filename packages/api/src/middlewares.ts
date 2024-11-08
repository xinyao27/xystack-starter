import { createMiddleware } from 'hono/factory'
import { createDBClient } from '@xystack/db/client'
import { AuthInstance, createLucia } from '@xystack/auth/server'
import { getCookie, setCookie } from 'hono/cookie'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const db = () =>
  createMiddleware(async (c, next) => {
    const DB = (await getCloudflareContext()).env.DB
    if (!DB) throw new Error('DB is not defined')
    const db = createDBClient(DB)
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

export const auth = () =>
  createMiddleware(async (c, next) => {
    const authInstance = new AuthInstance({
      db: c.get('db'),
      cookieHandler: {
        getCookie: (key) => getCookie(c, key),
        setCookie: (key, value, attributes) => setCookie(c, key, value, attributes),
      },
    })
    c.set('auth', authInstance)
    await next()
  })

export const responseTime = () =>
  createMiddleware(async (c, next) => {
    const start = Date.now()
    await next()
    const end = Date.now()
    c.res.headers.set('X-Response-Time', `${end - start}`)
  })
