import { app } from '@xystack/api'
import { handle } from 'hono/vercel'

export const runtime = 'nodejs'

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
