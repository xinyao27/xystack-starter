import { atom, computed, onMount, task } from 'nanostores'
import consola from 'consola'
import { hc } from 'hono/client'
import type { AuthContextValue } from './context'
import type { AppType } from '../../../api/src/root'

export const createAuthProvider = (baseUrl: string) => {
  const client = hc<AppType>(baseUrl)

  const defaultValue = {
    signInWithOtp: async (params) => {
      const res = await client.api.auth.login.otp.$get({ query: params })
      return res.json()
    },
    verifyOtp: async (params) => {
      const res = await client.api.auth.login.otp.verify.$post({ json: params })
      return res.json()
    },
    resendOtp: async (params) => {
      const res = await client.api.auth.login.otp.resend.$get({ query: params })
      return res.json()
    },
    signInWithOAuth: async (params) => {
      const res = await client.api.auth.login.oauth.$get({ query: params })
      return res.json()
    },
    signOut: async () => {
      await client.api.auth.logout.$get()
    },
  } as AuthContextValue

  async function* getAuth() {
    const sessionRes = await client.api.auth.session.$get()
    if (sessionRes.ok) {
      const session = await sessionRes.json()
      if (session.data) {
        yield {
          session: {
            id: session.data.id,
            expiresAt: new Date(session.data.expiresAt),
            fresh: session.data.fresh,
            userId: session.data.userId,
          },
        }
      }

      const userRes = await client.api.auth.user.$get()
      if (userRes.ok) {
        const user = await userRes.json()
        yield {
          user: user.data,
        }
      } else {
        yield {
          user: null,
        }
      }
    } else {
      yield {
        session: null,
      }
    }
  }

  return { defaultValue, getAuth }
}

const baseUrl = typeof window === 'undefined' ? 'http://localhost:4321' : window.location.origin
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
