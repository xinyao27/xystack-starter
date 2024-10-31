import { SidebarTrigger } from '@xystack/ui/sidebar'
import { User } from '~/components/user'

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>

      <div className="flex items-center space-x-2">
        <User />
      </div>
    </header>
  )
}
