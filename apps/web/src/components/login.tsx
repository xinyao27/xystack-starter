import { buttonVariants } from '@xystack/ui/button'
import { cn } from '@xystack/ui'

function Login() {
  return (
    <a className={cn(buttonVariants({ variant: 'outline' }))} href="/api/auth/github">
      Sign in with Github
    </a>
  )
}

export default Login
