// api/auth

import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { OAuth2RequestError, generateState } from 'arctic'
import { github } from '@xystack/auth'
import { generateIdFromEntropySize } from 'lucia'
import { eq, users } from '@xystack/db'
import { env } from '../../get-env'
import type { Env } from '../root'

interface GitHubUser {
  id: number
  login: string
  email: string
}

const auth = new Hono<Env>()
  .get('/github', async (c) => {
    const state = generateState()
    const url = await github.createAuthorizationURL(state)

    setCookie(c, 'oauth_state', state, {
      path: '/',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: 'lax',
    })

    return c.redirect(url.toString())
  })

  .get('/callback', async (c) => {
    const db = c.get('db')
    const lucia = c.get('lucia')
    const code = c.req.query('code')
    const state = c.req.query('state')
    const cookieState = await getCookie(c, 'oauth_state')
    if (!code || !state || state !== cookieState) {
      throw new Error('Invalid state')
    }

    try {
      const tokens = await github.validateAuthorizationCode(code)
      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      const githubUser: GitHubUser = await githubUserResponse.json()

      const existingUser = await db.query.users.findFirst({
        where: eq(users.githubId, githubUser.id),
      })
      console.log('existingUser', existingUser)

      if (existingUser) {
        const session = await lucia.createSession(existingUser.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)
        setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        return c.redirect('/')
      }

      const userId = generateIdFromEntropySize(10) // 16 characters long
      console.log('userId', userId)

      await db.insert(users).values({
        id: userId,
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
      })

      const session = await lucia.createSession(userId, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      return c.redirect('/')
    } catch (error: any) {
      console.error(error)
      // the specific error message depends on the provider
      if (error instanceof OAuth2RequestError) {
        // invalid code
        return c.json({ error: error.message }, 400)
      }
      return c.json({ error: error.message || 'Internal server error' }, 500)
    }
  })

export default auth
