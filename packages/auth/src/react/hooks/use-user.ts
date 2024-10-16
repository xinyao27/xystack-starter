import { useContext } from 'react'
import { AuthContext } from '../context'
import type { AuthContextValue } from '../context'
import type { User } from '../../types'

export type UseUserReturn =
  | { isLoaded: false; isSignedIn: undefined; user: undefined }
  | { isLoaded: true; isSignedIn: false; user: null }
  | { isLoaded: true; isSignedIn: true; user: User }

export function createUseUser(auth: AuthContextValue | null): UseUserReturn {
  if (!auth) {
    return { isLoaded: false, isSignedIn: undefined, user: undefined }
  }

  if (!auth.user) {
    return { isLoaded: true, isSignedIn: false, user: null }
  }

  return { isLoaded: true, isSignedIn: true, user: auth.user! }
}

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
 * import { useUser } from '@xystack/auth/react'
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
  const auth = useContext(AuthContext)

  return createUseUser(auth)
}
