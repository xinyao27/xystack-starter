// api/auth

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { OAuthProvider } from '@xystack/auth'
import type { Env } from '../root'

const auth = new Hono<Env>()
  .get('/session', async (c) => {
    const authInstance = c.get('auth')

    const res = await authInstance.getSession()
    if (res.error || !res.data) {
      return c.json({ error: res.error || 'No session' }, 401)
    }

    return c.json(res)
  })

  .get('/user', async (c) => {
    const authInstance = c.get('auth')

    const res = await authInstance.getUser()
    if (res.error || !res.data) {
      return c.json({ error: res.error || 'No user' }, 401)
    }

    return c.json(res)
  })

  .get('/signout', async (c) => {
    const authInstance = c.get('auth')

    const res = await authInstance.signOut()
    if (res.error || !res.data) {
      return c.json({ error: res.error || 'Failed to sign out' }, 400)
    }

    return c.redirect('/')
  })

  .post('/signup', zValidator('json', z.object({ email: z.string().email() })), async (c) => {
    const authInstance = c.get('auth')
    const { email } = c.req.valid('json')

    const res = await authInstance.signUp({ email })
    if (res.error || !res.data) {
      return c.json({ error: res.error || 'Failed to sign up' }, 400)
    }

    return c.json(res)
  })

  .get('/signin/otp', zValidator('query', z.object({ email: z.string().email() })), async (c) => {
    const authInstance = c.get('auth')
    const { email } = c.req.valid('query')

    const res = await authInstance.signInWithOtp({ email })
    if (res.error || !res.data) {
      return c.json({ error: res.error || 'Failed to sign in' }, 400)
    }

    return c.json(res)
  })

  .post(
    '/signin/otp/verify',
    zValidator('json', z.object({ email: z.string().email(), otpCode: z.string() })),
    async (c) => {
      const authInstance = c.get('auth')
      const { email, otpCode } = c.req.valid('json')

      const res = await authInstance.verifyOtp({ email, otpCode })
      if (res.error || !res.data) {
        return c.json({ error: res.error || 'Failed to verify OTP' }, 400)
      }

      return c.json(res)
    },
  )

  .get('/signin/otp/resend', zValidator('query', z.object({ email: z.string().email() })), async (c) => {
    const authInstance = c.get('auth')
    const { email } = c.req.valid('query')

    const res = await authInstance.resendOtp({ email })
    if (res.error || !res.data) {
      return c.json({ error: res.error || 'Failed to resend OTP' }, 400)
    }

    return c.json(res)
  })

  .get(
    '/signin/oauth',
    zValidator(
      'query',
      z.object({
        provider: z.nativeEnum(OAuthProvider),
        redirectTo: z.string().url().optional(),
        scopes: z.string().optional(),
      }),
    ),
    async (c) => {
      const authInstance = c.get('auth')
      const { provider, redirectTo, scopes } = c.req.valid('query')

      const options = { redirectTo, scopes: scopes?.split(',') }
      const res = await authInstance.signInWithOAuth({ provider, options })
      if (res.error || !res.data) {
        return c.json({ error: res.error || 'Failed to sign in' }, 400)
      }
      if (res.data.url && res.data.provider === provider) {
        return c.redirect(res.data.url.toString(), 302)
      }

      return c.json({ error: 'Failed to sign in' }, 400)
    },
  )

  .get('/callback', zValidator('query', z.object({ code: z.string(), state: z.string() })), async (c) => {
    const authInstance = c.get('auth')
    const { code, state: providerState } = c.req.valid('query')

    const [provider] = providerState?.split('$$') ?? []
    if (!provider) {
      return c.json({ error: 'Invalid state' }, 400)
    }

    const res = await authInstance.oauthCallback({
      provider: provider as OAuthProvider,
      code,
      state: providerState,
    })

    if (res.error || !res.data) {
      return c.json({ error: res.error || 'Failed to callback' }, 400)
    }
    if (res.data.ok) {
      return c.redirect('/')
    }
    return c.json({ error: 'Failed to callback' }, 400)
  })

export default auth
