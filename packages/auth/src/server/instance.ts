import { generateState } from 'arctic'
import { generateIdFromEntropySize } from 'lucia'
import { and, createIdentitySchema, createUserSchema, eq, identities, users } from '@xystack/db'
import { env } from '../../get-env'
import { OAuthProvider } from '../types'
import { createLucia } from './lucia'
import { github } from './providers'
import type { GitHubUser } from './providers'
import type {
  OAuthCallbackParams,
  OAuthCallbackReturn,
  Session,
  SignInWithOAuthParams,
  SignInWithOAuthReturn,
  User,
} from '../types'
import type { CookieAttributes, Lucia } from 'lucia'
import type { createDBClient } from '@xystack/db'

export interface CookieHandler {
  getCookie: (key: string) => string | undefined
  setCookie: (key: string, value: string, attributes: CookieAttributes) => void
}

interface Options {
  db: ReturnType<typeof createDBClient>
  cookieHandler: CookieHandler
}

interface Return<T> {
  data: T | null
  error: string | null
}

export class AuthInstance {
  public lucia: Lucia
  #db: ReturnType<typeof createDBClient>
  #cookieHandler: CookieHandler

  constructor(options: Options) {
    this.lucia = createLucia(options.db)
    this.#db = options.db
    this.#cookieHandler = options.cookieHandler
  }

  #createReturn<T>(data: T | null, error: Error | string | null): Return<T> {
    if (typeof error === 'string') {
      error = new Error(error)
    }
    return {
      data,
      error: error?.message || error?.toString() || null,
    }
  }

  public getSession = async (): Promise<Return<Session>> => {
    try {
      const lucia = this.lucia

      const sessionId = this.#cookieHandler.getCookie(lucia.sessionCookieName)
      if (!sessionId) {
        throw new Error('No session ID')
      }

      const { session } = await lucia.validateSession(sessionId)
      if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id)
        this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie()
        this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
      return this.#createReturn<Session>(session, null)
    } catch (error) {
      return this.#createReturn<Session>(null, error as Error)
    }
  }

  public getUser = async (): Promise<Return<User>> => {
    try {
      const lucia = this.lucia

      const sessionId = this.#cookieHandler.getCookie(lucia.sessionCookieName)
      if (!sessionId) {
        throw new Error('No session ID')
      }

      const { session, user: luciaUser } = await lucia.validateSession(sessionId)
      if (!session) {
        throw new Error('No session')
      }
      if (!luciaUser) {
        throw new Error('No user in session')
      }
      if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id)
        this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie()
        this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }

      const user = await this.#db.query.users.findFirst({
        where: eq(users.id, luciaUser.id),
      })
      if (!user) {
        throw new Error('No user in database')
      }

      return this.#createReturn<User>(user, null)
    } catch (error) {
      return this.#createReturn<User>(null, error as Error)
    }
  }

  public signOut = async (): Promise<Return<boolean>> => {
    try {
      const lucia = this.lucia

      const sessionId = this.#cookieHandler.getCookie(lucia.sessionCookieName)
      if (!sessionId) {
        throw new Error('No session ID')
      }

      await lucia.invalidateSession(sessionId)

      const sessionCookie = lucia.createBlankSessionCookie()
      this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return this.#createReturn<boolean>(true, null)
    } catch (error) {
      return this.#createReturn<boolean>(false, error as Error)
    }
  }

  public signInWithOAuth = async ({
    provider,
    options,
  }: SignInWithOAuthParams): Promise<Return<SignInWithOAuthReturn>> => {
    try {
      const state = `${provider}$$${generateState()}`

      let url: URL | null = null
      if (provider === OAuthProvider.GITHUB) {
        // eslint-disable-next-line no-restricted-properties, no-console
        console.log('Creating GitHub OAuth URL', { env: env.GITHUB_CLIENT_ID, process: process.env.GITHUB_CLIENT_ID })
        url = await github.createAuthorizationURL(state, {
          scopes: options.scopes,
        })
      }

      if (!url) {
        throw new Error('Failed to create OAuth URL')
      }

      this.#cookieHandler.setCookie('oauth_state', state, {
        path: '/',
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax',
      })

      return this.#createReturn<{
        provider: OAuthProvider
        url: URL
      }>(
        {
          provider,
          url,
        },
        null,
      )
    } catch (error) {
      return this.#createReturn<{
        provider: OAuthProvider
        url: URL
      }>(null, error as Error)
    }
  }

  public oauthCallback = async ({
    provider,
    code,
    state,
  }: OAuthCallbackParams): Promise<Return<OAuthCallbackReturn>> => {
    try {
      const db = this.#db
      const lucia = this.lucia
      const cookieState = this.#cookieHandler.getCookie('oauth_state')
      if (!code || !state || state !== cookieState) {
        throw new Error('Invalid OAuth state')
      }

      const tokens = await github.validateAuthorizationCode(code)
      if (!tokens) {
        throw new Error('Failed to validate OAuth code')
      }

      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      const githubUser: GitHubUser = await githubUserResponse.json()

      const existingIdentity = await db.query.identities.findFirst({
        where: and(eq(identities.provider, OAuthProvider.GITHUB), eq(identities.userId, githubUser.id.toString())),
      })

      if (existingIdentity) {
        const session = await lucia.createSession(existingIdentity.userId, {})
        const sessionCookie = lucia.createSessionCookie(session.id)
        this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        return this.#createReturn<OAuthCallbackReturn>(
          {
            provider,
            ok: true,
            userId: existingIdentity.userId,
          },
          null,
        )
      }

      const userId = generateIdFromEntropySize(10) // 16 characters long

      const user = createUserSchema.parse({
        id: userId,
        username: githubUser.login,
        email: githubUser.email,
        imageUrl: githubUser.avatar_url,
      })
      await db.insert(users).values(user)

      const identity = createIdentitySchema.parse({
        provider: OAuthProvider.GITHUB,
        identityId: githubUser.id.toString(),
        userId,
        email: githubUser.email,
        username: githubUser.login,
        imageUrl: githubUser.avatar_url,
        metadata: githubUser,
      })
      await db.insert(identities).values(identity)

      const session = await lucia.createSession(userId, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return this.#createReturn<OAuthCallbackReturn>(
        {
          provider,
          ok: true,
          userId,
        },
        null,
      )
    } catch (error) {
      return this.#createReturn<OAuthCallbackReturn>(null, error as Error)
    }
  }
}
