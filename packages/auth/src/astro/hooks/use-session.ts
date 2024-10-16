import { useStore } from '@nanostores/react'
import { $authStore } from '../stores'
import { createUseSession } from '../../react'
import type { UseSessionReturn } from '../../react'

/**
 * Returns the current auth state and if a Session is signed in, the Session object.
 *
 * Until loads and initializes, `isLoaded` will be set to `false`.
 * Once loads, `isLoaded` will be set to `true`, and you can
 * safely access `isSignedIn` state and `Session`.
 *
 * @example
 * A simple example:
 *
 * import { useSession } from '@xystack/auth/astro'
 *
 * function Hello() {
 *   const { isSignedIn, session } = useSession();
 *   if(!isSignedIn) {
 *     return null;
 *   }
 *   return <div>Hello, {session.updatedAt}</div>
 * }
 */
export function useSession(): UseSessionReturn {
  const auth = useStore($authStore)

  return createUseSession(auth)
}
