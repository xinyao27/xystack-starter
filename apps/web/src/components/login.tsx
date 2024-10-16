import { buttonVariants } from '@xystack/ui/button'
import { cn } from '@xystack/ui'
import { useUser } from '@xystack/auth/astro'

function LoginButton() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (isSignedIn) {
    return <a href="/api/auth/logout">{user.id} / Sign out</a>
  }

  return (
    <a className={cn(buttonVariants({ variant: 'outline' }))} href="/api/auth/login/oauth?provider=github">
      Sign in with Github
    </a>
  )
}

export default LoginButton
