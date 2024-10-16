import { atom, computed, onMount, task } from 'nanostores'
import consola from 'consola'
import { hc } from 'hono/client'
import type { AuthContextValue } from '../react'
import type { AppType } from '../../../api/src/root'

export const $authStore = atom<AuthContextValue | null>(null)
export const $sessionStore = computed($authStore, (auth) => auth?.session)
export const $userStore = computed($authStore, (auth) => auth?.user)

onMount($authStore, () => {
  task(async () => {
    consola.info('AuthProvider Load')
    const client = hc<AppType>(window.location.href)

    const sessionRes = await client.api.auth.session.$get()
    if (sessionRes.ok) {
      const session = await sessionRes.json()
      $authStore.set({
        session: {
          id: session.id,
          expiresAt: new Date(session.expiresAt),
          fresh: session.fresh,
          userId: session.userId,
        },
      })

      const userRes = await client.api.auth.user.$get()
      if (userRes.ok) {
        const user = await userRes.json()
        $authStore.set({
          user,
        })
      } else {
        $authStore.set({ user: null })
      }
    } else {
      $authStore.set({ session: null })
    }
  })
})
