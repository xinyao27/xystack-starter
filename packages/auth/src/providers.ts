import { GitHub } from 'arctic'
import { env } from '../get-env'

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET)
