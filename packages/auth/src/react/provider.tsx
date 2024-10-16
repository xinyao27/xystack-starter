import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { hc } from 'hono/client'
import { consola } from 'consola'
import { AuthContext } from './context'
import type { AuthContextValue } from './context'
import type { AppType } from '../../../api/src/root'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<AuthContextValue | null>(null)

  useEffect(() => {
    consola.info('AuthProvider Load')
    async function fetchAuth() {
      const client = hc<AppType>(window.location.href)

      const sessionRes = await client.api.auth.session.$get()
      if (sessionRes.ok) {
        const session = await sessionRes.json()
        setValue((prev) => ({
          ...(prev || {}),
          session: {
            id: session.id,
            expiresAt: new Date(session.expiresAt),
            fresh: session.fresh,
            userId: session.userId,
          },
        }))

        const userRes = await client.api.auth.user.$get()
        if (userRes.ok) {
          const user = await userRes.json()
          setValue((prev) => ({
            ...(prev || {}),
            user,
          }))
        } else {
          setValue((prev) => ({
            ...(prev || {}),
            user: null,
          }))
        }
      } else {
        setValue({ session: null })
      }
    }
    fetchAuth()
  }, [])

  return <AuthContext.Provider value={useMemo(() => value, [value])}>{children}</AuthContext.Provider>
}
