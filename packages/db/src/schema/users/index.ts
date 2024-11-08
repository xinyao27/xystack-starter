/* eslint-disable @typescript-eslint/no-use-before-define */
import { relations, sql } from 'drizzle-orm'
import { sqliteTable, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

/**
 * users
 * MARK: - Users
 */
export const users = sqliteTable(
  'users',
  (t) => ({
    /**
     * A unique identifier for the user.
     */
    id: t.text('id').primaryKey(),
    /**
     * The email of the user.
     */
    email: t.text('email').unique(),
    /**
     * The username of the user.
     */
    username: t.text('username').notNull(),
    /**
     * The URL to the user's image.
     */
    imageUrl: t.text('image_url'),
    /**
     * The OTP code for the user.
     */
    otpCode: t.text('otp_code'),
    /**
     * The expiration time of the OTP code.
     */
    otpExpiresAt: t.text('otp_expires_at'),
    /**
     * The date and time when the user was last signed in.
     */
    lastSignInAt: t
      .text('last_sign_in_at')
      .default(sql`(current_timestamp)`)
      .notNull(),
    /**
     * The date and time when the user was created.
     */
    createdAt: t
      .text('created_at')
      .default(sql`(current_timestamp)`)
      .notNull(),
    /**
     * The date and time when the user was last updated.
     */
    updatedAt: t.text('updated_at').$onUpdateFn(() => sql`(current_timestamp)`),
  }),
  (table) => ({
    emailUniqueIndex: uniqueIndex('emailUniqueIndex').on(sql`lower(${table.email})`),
  }),
)

export type User = typeof users.$inferSelect

export const usersRelations = relations(users, ({ many }) => ({
  identities: many(identities),
}))

export const createUserSchema = createInsertSchema(users, {
  username: z.string().max(256),
  email: z.string().email(),
  imageUrl: z.string().optional(),
}).omit({
  lastSignInAt: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * sessions
 * MARK: - Sessions
 */
export const sessions = sqliteTable('sessions', (t) => ({
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: t.integer('expires_at').notNull(),
}))

export type Session = typeof sessions.$inferSelect

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

/**
 * identities
 * MARK: - Identities
 */
export const identities = sqliteTable('identities', (t) => ({
  /**
   * A unique identifier for this external account.
   */
  id: t.integer('id').primaryKey({ autoIncrement: true }),
  /**
   * The provider name e.g. `google`
   */
  provider: t.text('provider').notNull(),
  /**
   * The identification with which this external account is associated.
   */
  identityId: t.text('identity_id').notNull(),
  /**
   * The unique ID of the user in the provider.
   */
  userId: t
    .text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /**
   * The email of the user in the provider.
   */
  email: t.text('email'),
  /**
   * The username of the user in the provider.
   */
  username: t.text('username'),
  /**
   * The URL to the user's image in the provider.
   */
  imageUrl: t.text('image_url'),
  /**
   * The metadata for the identity.
   */
  metadata: t.text('metadata', { mode: 'json' }).$type<Record<string, any>>().notNull(),
  /**
   * The date and time when the user was last signed in (oauth only).
   */
  lastSignInAt: t
    .text('last_sign_in_at')
    .default(sql`(current_timestamp)`)
    .notNull(),
  /**
   * The date and time when the identity was created.
   */
  createdAt: t
    .text('created_at')
    .default(sql`(current_timestamp)`)
    .notNull(),
  /**
   * The date and time when the identity was last updated.
   */
  updatedAt: t.text('updated_at').$onUpdateFn(() => sql`(current_timestamp)`),
}))

export type Identity = typeof identities.$inferSelect

export const identitiesRelations = relations(identities, ({ one }) => ({
  user: one(users, { fields: [identities.userId], references: [users.id] }),
}))

export const createIdentitySchema = createInsertSchema(identities, {
  provider: z.string(),
  identityId: z.string(),
  userId: z.string(),
  email: z.string().email().optional(),
  username: z.string().max(256).optional(),
  imageUrl: z.string().optional(),
  metadata: z.record(z.unknown()),
}).omit({
  id: true,
  lastSignInAt: true,
  createdAt: true,
  updatedAt: true,
})
