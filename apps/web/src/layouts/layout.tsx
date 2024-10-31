import { SidebarInset, SidebarProvider } from '@xystack/ui/sidebar'
import { Toaster } from '@xystack/ui/sonner'
import { AppSidebar } from '~/components/app-sidebar'
import Header from '~/components/header'

import '@xystack/ui/base.css'

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
          <Toaster />
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
