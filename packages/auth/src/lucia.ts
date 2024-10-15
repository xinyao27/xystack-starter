import { Lucia } from 'lucia'
import { env } from '../get-env'
import { createAdapter } from './adapter'
import type { createDBClient } from '@xystack/db/client'

export const createLucia = (db: ReturnType<typeof createDBClient>) => {
  const adapter = createAdapter(db)
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: env.NODE_ENV === 'production',
      },
    },
    getUserAttributes: (attributes: any): DatabaseUserAttributes => {
      return {
        // attributes has the type of DatabaseUserAttributes
        githubId: attributes.github_id,
        username: attributes.username,
        email: attributes.email,
      }
    },
  })
}

declare module 'lucia' {
  interface Register {
    Lucia: Lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

export interface DatabaseUserAttributes {
  githubId: number
  username: string
  email?: string
}
