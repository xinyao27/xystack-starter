import { hc } from 'hono/client'
import type { AppType } from '@xystack/api'

export const client = hc<AppType>(window.location.href)
