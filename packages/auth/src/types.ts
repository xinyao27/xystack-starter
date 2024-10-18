import type { Session as LuciaSession, User as LuciaUser } from 'lucia'
import type { User as DbUser } from '@xystack/db'

export interface Auth {
  sessionId?: string

  session?: Session | null
  user?: User | null
}

export interface Session extends LuciaSession {}

export interface User extends LuciaUser, DbUser {}

export enum OAuthProvider {
  GITHUB = 'github',
}

export interface SignInWithOAuthParams {
  provider: OAuthProvider
  options: {
    queryParams?: Record<string, string>
    redirectTo?: string
    scopes?: string[]
  }
}

export interface SignInWithOAuthReturn {
  provider: OAuthProvider
  url: URL
}

export interface OAuthCallbackParams {
  provider: OAuthProvider
  code?: string
  state?: string
}

export interface OAuthCallbackReturn {
  provider: OAuthProvider
  ok: boolean
  userId?: string
}
