import crypto from 'node:crypto'
import { generateState } from 'arctic'
import { generateIdFromEntropySize } from 'lucia'
import { and, createIdentitySchema, createUserSchema, eq, identities, users } from '@xystack/db'
import { send } from '@xystack/email'
import { addMinutes, formatISO9075, isAfter } from 'date-fns'
import consola from 'consola'
import { env } from '../../get-env'
import { OAuthProvider } from '../types'
import { createLucia } from './lucia'
import { github } from './providers'
import type { Return } from '../../../api/src/root'
import type { GitHubUser } from './providers'
import type {
  CreateUserParams,
  OAuthCallbackParams,
  OAuthCallbackReturn,
  ResendOtpParams,
  ResendOtpReturn,
  Session,
  SignInWithOAuthParams,
  SignInWithOAuthReturn,
  SignInWithOtpParams,
  SignInWithOtpReturn,
  SignUpParams,
  SignUpReturn,
  User,
  VerifyOtpParams,
  VerifyOtpReturn,
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

  public createUser = async ({ email, identity }: CreateUserParams): Promise<Return<User>> => {
    try {
      const db = this.#db

      const userId = generateIdFromEntropySize(10) // 16 characters long

      const user = createUserSchema.parse({
        id: userId,
        email,
        username: identity?.username ?? email.split('@')[0],
        imageUrl: identity?.imageUrl,
      })
      const [returnUser] = await db.insert(users).values(user).returning()

      if (identity) {
        await db.insert(identities).values(
          createIdentitySchema.parse({
            ...identity,
            userId,
          }),
        )
      }

      return this.#createReturn<User>(returnUser, null)
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

  #createOtpAndSendEmail = async (email: string, user: User) => {
    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    const text = `Please enter the following code to sign in: ${otp}`
    // Send OTP via email
    const { data, error } = await send.emails.send({
      from: 'hi@brainstorm.cool',
      to: email,
      subject: 'Sign in to XYStack',
      text,
    })
    if (error || !data) {
      throw new Error(error?.message)
    }

    if (data.id) {
      consola.success('success send email: ', data.id)
      // Store OTP in database with expiration time
      const expiresAt = addMinutes(new Date(), 10) // 10 minutes from now
      await this.#db
        .update(users)
        .set({
          otpCode: otp,
          otpExpiresAt: formatISO9075(expiresAt),
        })
        .where(eq(users.id, user.id))
    }
  }

  public signUp = async ({ email }: SignUpParams): Promise<Return<SignUpReturn>> => {
    try {
      const user = await this.#db.query.users.findFirst({
        where: eq(users.email, email),
      })
      if (user) {
        throw new Error('User already exists.')
      }

      const newUser = await this.createUser({ email })
      if (newUser.error || !newUser.data) {
        throw new Error(newUser.error || 'Failed to create user')
      }
      await this.#createOtpAndSendEmail(email, newUser.data)

      return this.#createReturn<SignUpReturn>(newUser.data, null)
    } catch (error) {
      return this.#createReturn<SignUpReturn>(null, error as Error)
    }
  }

  public verifyOtp = async ({ email, otpCode }: VerifyOtpParams): Promise<Return<VerifyOtpReturn>> => {
    try {
      const user = await this.#db.query.users.findFirst({
        where: eq(users.email, email),
      })
      if (!user || !user.otpCode || !user.otpExpiresAt) {
        throw new Error('Invalid OTP or user not found')
      }

      if (isAfter(Date.now(), user.otpExpiresAt)) {
        throw new Error('OTP has expired')
      }

      if (user.otpCode !== otpCode) {
        throw new Error('Invalid OTP')
      }

      // Clear OTP after successful verification
      await this.#db.update(users).set({ otpCode: null, otpExpiresAt: null }).where(eq(users.id, user.id))

      // Create a new session
      const session = await this.lucia.createSession(user.id, {})
      const sessionCookie = this.lucia.createSessionCookie(session.id)
      this.#cookieHandler.setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return this.#createReturn<VerifyOtpReturn>({ user, session }, null)
    } catch (error) {
      return this.#createReturn<VerifyOtpReturn>(null, error as Error)
    }
  }

  public resendOtp = async ({ email }: ResendOtpParams): Promise<Return<ResendOtpReturn>> => {
    try {
      const user = await this.#db.query.users.findFirst({
        where: eq(users.email, email),
      })
      if (!user) {
        throw new Error('No user, please sign up first.')
      }

      await this.#createOtpAndSendEmail(email, user)

      return this.#createReturn<ResendOtpReturn>({ email }, null)
    } catch (error) {
      return this.#createReturn<ResendOtpReturn>(null, error as Error)
    }
  }

  public signInWithOtp = async ({ email }: SignInWithOtpParams): Promise<Return<SignInWithOtpReturn>> => {
    try {
      const user = await this.#db.query.users.findFirst({
        where: eq(users.email, email),
      })
      if (!user) {
        throw new Error('No user, please sign up first.')
      }

      if (!user.otpExpiresAt || isAfter(new Date(), user.otpExpiresAt)) {
        await this.#createOtpAndSendEmail(email, user)
      }

      return this.#createReturn<SignInWithOtpReturn>({ email }, null)
    } catch (error) {
      return this.#createReturn<SignInWithOtpReturn>(null, error as Error)
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
        url = await github.createAuthorizationURL(state, options.scopes ?? [])
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
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })
      const githubUser: GitHubUser = await githubUserResponse.json()

      const existingIdentity = await db.query.identities.findFirst({
        where: and(eq(identities.provider, OAuthProvider.GITHUB), eq(identities.identityId, githubUser.id.toString())),
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

      let user = await this.#db.query.users.findFirst({
        where: eq(users.email, githubUser.email),
      })
      if (!user) {
        // If there is no user, create one (include identity)
        const newUser = await this.createUser({
          email: githubUser.email,
          identity: {
            id: githubUser.id,
            provider: OAuthProvider.GITHUB,
            identityId: githubUser.id.toString(),
            email: githubUser.email,
            username: githubUser.login,
            imageUrl: githubUser.avatar_url,
            metadata: githubUser,
          },
        })
        if (newUser.error || !newUser.data) {
          throw new Error(newUser.error || 'Failed to create user')
        }
        user = newUser.data
      } else {
        // If there is already a user but no identity, create one
        await db.insert(identities).values(
          createIdentitySchema.parse({
            userId: user.id,
            id: githubUser.id,
            provider: OAuthProvider.GITHUB,
            identityId: githubUser.id.toString(),
            email: githubUser.email,
            username: githubUser.login,
            imageUrl: githubUser.avatar_url,
            metadata: githubUser,
          }),
        )
      }

      const userId = user.id
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
