import { useAuth } from './use-auth'
import type { Session } from '../../types'
import type { AuthContextValue } from '../context'

export type UseSessionReturn =
  | { isLoaded: false; isSignedIn: undefined; session: undefined }
  | { isLoaded: true; isSignedIn: false; session: null }
  | { isLoaded: true; isSignedIn: true; session: Session }

export function createUseSession(auth: AuthContextValue): UseSessionReturn {
  if (!auth) {
    return { isLoaded: false, isSignedIn: undefined, session: undefined }
  }

  if (!auth.session) {
    return { isLoaded: true, isSignedIn: false, session: null }
  }

  return { isLoaded: true, isSignedIn: true, session: auth.session! }
}
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
  const auth = useAuth()

  return createUseSession(auth)
}
