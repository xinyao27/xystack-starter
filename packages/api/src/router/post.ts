// api/post

import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createPostSchema, eq, posts } from '@xystack/db'
import type { Env } from '../root'

const post = new Hono<Env>()
  .get('/', async (c) => {
    const db = c.get('db')
    const posts = await db.query.posts.findMany()
    return c.json(posts)
  })

  .get('/:id', zValidator('param', z.object({ id: z.number() })), async (c) => {
    const id = c.req.valid('param').id
    const db = c.get('db')
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    })
    return c.json(post)
  })

  .post('/', zValidator('json', createPostSchema), async (c) => {
    const { title, content } = await c.req.valid('json')
    const db = c.get('db')
    const post = await db.insert(posts).values({ title, content }).returning()
    return c.json(post)
  })

  .delete('/:id', zValidator('param', z.object({ id: z.number() })), async (c) => {
    const id = c.req.valid('param').id
    const db = c.get('db')
    const deletedPost = await db.delete(posts).where(eq(posts.id, id)).returning()
    return c.json(deletedPost)
  })

export default post
