import { Resend } from 'resend'
import { env } from '../get-env'

export const send = new Resend(env.RESEND_API_KEY)
