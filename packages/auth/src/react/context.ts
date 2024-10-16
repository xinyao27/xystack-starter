import { createContext } from 'react'
import type { Session, User } from '../types'

export interface AuthContextValue {
  user?: User | null
  session?: Session | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
