// api/auth

import { Hono } from 'hono'
import type { OAuthProvider } from '@xystack/auth'
import type { Env } from '../root'

const auth = new Hono<Env>()
  .get('/session', async (c) => {
    const authInstance = c.get('auth')

    const { data: session, error } = await authInstance.getSession()
    if (error || !session) {
      return c.json({ error: error || 'No session' }, 401)
    }

    return c.json(session)
  })

  .get('/user', async (c) => {
    const authInstance = c.get('auth')

    const { data: user, error } = await authInstance.getUser()
    if (error || !user) {
      return c.json({ error: error || 'No user' }, 401)
    }

    return c.json(user)
  })

  .get('/logout', async (c) => {
    const authInstance = c.get('auth')

    const { data, error } = await authInstance.signOut()
    if (error || !data) {
      return c.json({ error: error || 'Failed to sign out' }, 400)
    }

    return c.redirect('/')
  })

  .get('/login/oauth', async (c) => {
    const authInstance = c.get('auth')
    const provider = c.req.query('provider') as OAuthProvider | undefined
    const redirectTo = c.req.query('redirectTo')
    const scopes = c.req.query('scopes')

    if (!provider) {
      return c.json({ error: 'Invalid provider' }, 400)
    }

    const options = { redirectTo, scopes: scopes?.split(',') }
    const { data, error } = await authInstance.signInWithOAuth({ provider, options })
    if (error || !data) {
      return c.json({ error: error || 'Failed to sign in' }, 400)
    }
    if (data.url && data.provider === provider) {
      return c.redirect(data.url.toString(), 302)
    }

    return c.json({ error: 'Failed to sign in' }, 400)
  })

  .get('/callback', async (c) => {
    const authInstance = c.get('auth')
    const code = c.req.query('code')
    const providerState = c.req.query('state')

    const [provider] = providerState?.split('$$') ?? []
    if (!provider) {
      return c.json({ error: 'Invalid state' }, 400)
    }

    const { data, error } = await authInstance.oauthCallback({
      provider: provider as OAuthProvider,
      code,
      state: providerState,
    })

    if (error || !data) {
      return c.json({ error: error || 'Failed to callback' }, 400)
    }
    if (data.ok) {
      return c.redirect('/')
    }
    return c.json({ error: 'Failed to callback' }, 400)
  })

export default auth
