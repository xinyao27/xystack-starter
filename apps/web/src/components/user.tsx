import { Button, buttonVariants } from '@xystack/ui/button'
import { cn } from '@xystack/ui'
import { useUser } from '@xystack/auth/astro'
import { Avatar, AvatarFallback, AvatarImage } from '@xystack/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@xystack/ui/dropdown-menu'
import type { User } from '@xystack/auth'

interface UserProps {
  userAstro?: User | null
}

function UserComponent({ userAstro }: UserProps) {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (isSignedIn || userAstro) {
    const _user = userAstro ?? user
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full" size="icon" variant="ghost">
            <Avatar className="size-full">
              <AvatarImage src={_user?.imageUrl ?? ''} />
              <AvatarFallback>{_user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent forceMount align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{_user?.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{_user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/api/auth/logout" title="Log out">
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <a className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))} href="/api/auth/login/oauth?provider=github">
      Sign in
    </a>
  )
}

export default UserComponent
