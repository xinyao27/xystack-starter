import { verifyRequestOrigin } from 'lucia'
import { defineMiddleware } from 'astro:middleware'
import { createLucia } from '@xystack/auth'
import { createDBClient } from '@xystack/db'
import type { D1Database } from '@cloudflare/workers-types'

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.method !== 'GET') {
    const originHeader = context.request.headers.get('Origin')
    const hostHeader = context.request.headers.get('Host')
    if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
      return new Response(null, {
        status: 403,
      })
    }
  }

  const db = createDBClient(context.locals.runtime.env.DB as D1Database)
  const lucia = createLucia(db)

  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    context.locals.user = null
    context.locals.session = null
    return next()
  }

  const { session, user } = await lucia.validateSession(sessionId)
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie()
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  }
  context.locals.session = session
  context.locals.user = user
  return next()
})
