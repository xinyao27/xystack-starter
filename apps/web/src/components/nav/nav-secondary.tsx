import * as React from 'react'
import { LifeBuoy, Palette, Send } from 'lucide-react'
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@xystack/ui/sidebar'
import { ThemeToggle } from '@xystack/ui/theme'

const items = [
  {
    title: 'Support',
    url: '#',
    icon: LifeBuoy,
  },
  {
    title: 'Feedback',
    url: '#',
    icon: Send,
  },
  {
    title: 'Theme',
    icon: Palette,
    component: ThemeToggle,
  },
]

export function NavSecondary(props: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="justify-start" size="sm">
                {item.component ? (
                  <item.component />
                ) : (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
