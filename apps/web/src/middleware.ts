import { authMiddleware } from '@xystack/auth/astro/middleware'

export const onRequest = authMiddleware()
