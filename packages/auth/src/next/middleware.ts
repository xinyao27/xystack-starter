// import { verifyRequestOrigin } from 'lucia'
// import { createDBClient } from '@xystack/db'
// import { AuthInstance } from '../server/instance'
// import type { D1Database } from '@cloudflare/workers-types'
// import type { MiddlewareHandler } from 'astro'

// export const authMiddleware: () => MiddlewareHandler = () => {
//   return async (context, next) => {
//     if (context.request.method !== 'GET') {
//       const originHeader = context.request.headers.get('Origin')
//       const hostHeader = context.request.headers.get('Host')
//       if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
//         return new Response(null, {
//           status: 403,
//         })
//       }
//     }

//     const db = createDBClient(context.locals.runtime.env.DB as D1Database)
//     const authInstance = new AuthInstance({
//       db,
//       cookieHandler: {
//         getCookie: (key) => context.cookies.get(key)?.value ?? undefined,
//         setCookie: (key, value, attributes) => context.cookies.set(key, value, attributes),
//       },
//     })

//     const { data: session, error: getSessionError } = await authInstance.getSession()
//     if (getSessionError || !session) {
//       context.locals.user = null
//       context.locals.session = null
//       return next()
//     }
//     const { data: user, error: getUserError } = await authInstance.getUser()
//     if (getUserError || !user) {
//       context.locals.user = null
//       context.locals.session = null
//       return next()
//     }

//     if (session && session.fresh) {
//       const sessionCookie = authInstance.lucia.createSessionCookie(session.id)
//       context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
//     }
//     if (!session) {
//       const sessionCookie = authInstance.lucia.createBlankSessionCookie()
//       context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
//     }
//     context.locals.session = session
//     context.locals.user = user
//     return next()
//   }
// }
