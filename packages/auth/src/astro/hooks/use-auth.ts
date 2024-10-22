import { useStore } from '@nanostores/react'
import { $authStore } from '../stores'

/**
 * Returns the current auth state.
 *
 * @example
 * A simple example:
 *
 * import { useAuth } from '@xystack/auth/astro'
 *
 * function Hello() {
 *   const auth = useAuth();
 *
 *   auth.signOut()
 * }
 */
export function useAuth() {
  const auth = useStore($authStore)

  return auth
}
