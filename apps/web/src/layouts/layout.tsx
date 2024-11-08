import { SidebarInset, SidebarProvider } from '@xystack/ui/sidebar'
import { AppSidebar } from '~/components/app-sidebar'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col gap-4">
          {children}

          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
