'use client'

import { atom, computed, onMount, task } from 'nanostores'
import consola from 'consola'
import { hc } from 'hono/client'
import type { Session, User } from '../types'
import type { AuthContextValue } from './context'
import type { AppType } from '../../../api/src/root'

export const createAuthProvider = (baseUrl: string) => {
  const client = hc<AppType>(baseUrl)

  const defaultValue = {
    signUp: async (params) => {
      consola.info('AuthProvider signUp', params)
      const res = await client.api.auth.signup.$post({ json: params })
      return res.json()
    },
    signInWithOtp: async (params) => {
      consola.info('AuthProvider signInWithOtp', params)
      const res = await client.api.auth.signin.otp.$get({ query: params })
      return res.json()
    },
    verifyOtp: async (params) => {
      consola.info('AuthProvider verifyOtp', params)
      const res = await client.api.auth.signin.otp.verify.$post({ json: params })
      const result = await res.json()
      await defaultValue.refreshSession()
      return result
    },
    resendOtp: async (params) => {
      consola.info('AuthProvider resendOtp', params)
      const res = await client.api.auth.signin.otp.resend.$get({ query: params })
      return res.json()
    },
    signInWithOAuth: async (params) => {
      consola.info('AuthProvider signInWithOAuth', params)
      const res = await client.api.auth.signin.oauth.$get({ query: params })
      return res.json()
    },
    signOut: async () => {
      consola.info('AuthProvider signOut')
      await client.api.auth.signout.$get()
      await defaultValue.refreshSession()
    },
    refreshSession: async () => {
      consola.info('AuthProvider refreshSession')
      for await (const value of getAuth()) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        $authStore.set({
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          ...$authStore.get(),
          ...value,
        })
      }
    },
  } as AuthContextValue

  async function* getAuth() {
    let sessionObject: Session | null = null
    let userObject: User | null = null

    const sessionRes = await client.api.auth.session.$get()
    if (sessionRes.ok) {
      const session = await sessionRes.json()
      if (session.data) {
        sessionObject = {
          id: session.data.id,
          expiresAt: new Date(session.data.expiresAt),
          fresh: session.data.fresh,
          userId: session.data.userId,
        }
        yield {
          session: sessionObject,
          user: userObject,
        }
      }

      const userRes = await client.api.auth.user.$get()
      if (userRes.ok) {
        const user = await userRes.json()
        userObject = user.data
        yield {
          session: sessionObject,
          user: userObject,
        }
      } else {
        yield {
          session: sessionObject,
          user: userObject,
        }
      }
    } else {
      yield {
        session: sessionObject,
        user: userObject,
      }
    }
  }

  return { defaultValue, getAuth }
}

const baseUrl = typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin
const { defaultValue, getAuth } = createAuthProvider(baseUrl)
export const $authStore = atom<AuthContextValue>(defaultValue)
export const $sessionStore = computed($authStore, (auth) => auth?.session)
export const $userStore = computed($authStore, (auth) => auth?.user)

onMount($authStore, () => {
  task(async () => {
    consola.info('AuthProvider Load')

    for await (const value of getAuth()) {
      $authStore.set({ ...defaultValue, ...value })
    }
  })
})
