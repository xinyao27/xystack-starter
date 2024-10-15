import { app } from '@xystack/api'
import type { APIRoute } from 'astro'

export const ALL: APIRoute = (context) => {
  return app.fetch(context.request, context.locals.runtime.env)
}
