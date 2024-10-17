import { sql } from 'drizzle-orm'
import { sqliteTable } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const posts = sqliteTable('posts', (t) => ({
  id: t.integer('id').primaryKey({ autoIncrement: true }),
  title: t.text('title', { length: 256 }).notNull(),
  content: t.text('content').notNull(),
  createdAt: t
    .text('created_at')
    .default(sql`(current_timestamp)`)
    .notNull(),
  updatedAt: t.text('updated_at').$onUpdateFn(() => sql`(current_timestamp)`),
}))

export const createPostSchema = createInsertSchema(posts, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
