import { buttonVariants } from '@xystack/ui/button'
import { cn } from '@xystack/ui'
import { useUser } from '@xystack/auth/astro'
import { Avatar, AvatarFallback, AvatarImage } from '@xystack/ui/avatar'
import type { User } from '@xystack/auth'

interface LoginProps {
  userAstro?: User | null
}

function Login({ userAstro }: LoginProps) {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (isSignedIn || userAstro) {
    const _user = userAstro ?? user
    return (
      <a className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))} href="/api/auth/logout">
        <Avatar className="size-4">
          <AvatarImage src={_user?.imageUrl ?? ''} />
          <AvatarFallback>{_user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        / Sign out
      </a>
    )
  }

  return (
    <a className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))} href="/api/auth/login/oauth?provider=github">
      Sign in
    </a>
  )
}

export default Login
