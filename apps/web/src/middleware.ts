import { authMiddleware } from '@xystack/auth/astro'

export const onRequest = authMiddleware()
