import { buttonVariants } from '@xystack/ui/button'
import { cn } from '@xystack/ui'
import { GithubIcon } from 'lucide-react'

function Login() {
  return (
    <a className={cn(buttonVariants({ variant: 'outline' }))} href="/api/auth/github">
      Sign in with Github <GithubIcon className="ml-2" size={14} />
    </a>
  )
}

export default Login
