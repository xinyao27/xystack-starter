// api/auth

import { Hono } from 'hono'
import { getSignedCookie, setCookie, setSignedCookie } from 'hono/cookie'
import { OAuth2RequestError, generateState } from 'arctic'
import { github } from '@xystack/auth'
import { generateIdFromEntropySize } from 'lucia'
import { eq, users } from '@xystack/db'
import { env } from '../../get-env'
import type { Env } from '../root'

const auth = new Hono<Env>()

auth.get('/github', async (c) => {
  const state = generateState()
  const url = await github.createAuthorizationURL(state)

  setSignedCookie(c, 'github_oauth_state', state, env.AUTH_SECRET || '', {
    path: '/',
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  return c.redirect(url.toString())
})

interface GitHubUser {
  id: string
  login: string
  email: string
}
auth.get('/github/callback', async (c) => {
  const db = c.get('db')
  const lucia = c.get('lucia')
  const code = c.req.query('code')
  const state = c.req.query('state')
  const cookieState = await getSignedCookie(c, 'github_oauth_state')

  if (!code || !state || state !== cookieState.value) {
    return c.json({ error: 'Invalid state' }, 400)
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
      where: eq(users.githubId, Number(githubUser.id)),
    })

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      return c.redirect('/')
    }

    const userId = generateIdFromEntropySize(10) // 16 characters long

    await db.insert(users).values({
      id: userId,
      githubId: Number(githubUser.id),
      username: githubUser.login,
      email: githubUser.email,
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    return c.redirect('/')
  } catch (error) {
    // the specific error message depends on the provider
    if (error instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      })
    }
    return new Response(null, {
      status: 500,
    })
  }
})

export default auth
