import { relations } from 'drizzle-orm'
import { sqliteTable } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('user', (t) => ({
  id: t.text('id').primaryKey(),
  githubId: t.integer('github_id').notNull().unique(),
  username: t.text('username').notNull(),
  email: t.text('email'),
}))

export const sessions = sqliteTable('session', (t) => ({
  id: t.text('id').primaryKey(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: t.integer('expires_at').notNull(),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))
