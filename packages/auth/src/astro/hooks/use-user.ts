import { useStore } from '@nanostores/react'
import { $authStore } from '../stores'
import { createUseUser } from '../../react'
import type { UseUserReturn } from '../../react'

/**
 * Returns the current auth state and if a user is signed in, the user object.
 *
 * Until loads and initializes, `isLoaded` will be set to `false`.
 * Once loads, `isLoaded` will be set to `true`, and you can
 * safely access `isSignedIn` state and `user`.
 *
 * @example
 * A simple example:
 *
 * import { useUser } from '@xystack/auth/astro'
 *
 * function Hello() {
 *   const { isSignedIn, user } = useUser();
 *   if(!isSignedIn) {
 *     return null;
 *   }
 *   return <div>Hello, {user.firstName}</div>
 * }
 */
export function useUser(): UseUserReturn {
  const auth = useStore($authStore)

  return createUseUser(auth)
}
