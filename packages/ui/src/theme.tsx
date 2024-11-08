'use client'

import * as React from 'react'
import { Laptop, Moon, Sun } from 'lucide-react'
import { ThemeProvider, useTheme } from 'next-themes'
import { useMountedState } from 'react-use'

import { Button } from './button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import type { ButtonProps } from './button'

const ThemeTrigger = React.forwardRef<React.ElementRef<typeof Button>, ButtonProps>((props, ref) => {
  const { theme } = useTheme()
  const isMounted = useMountedState()

  const triggerIcon = React.useMemo(() => {
    if (theme === 'light')
      return <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    if (theme === 'dark')
      return <Moon className="size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    return <Laptop className="size-5" />
  }, [theme])

  if (!isMounted())
    return (
      <Button ref={ref} variant="ghost" {...props}>
        <span className="sr-only">theme</span>
        Theme
      </Button>
    )

  return (
    <Button ref={ref} variant="ghost" {...props}>
      {triggerIcon}
      <span className="sr-only">theme</span>
      Theme
    </Button>
  )
})
ThemeTrigger.displayName = 'ThemeTrigger'

function ThemeToggle(props: ButtonProps) {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ThemeTrigger {...props} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="size-5" /> Light
          <span className="sr-only">light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="size-5" /> Dark
          <span className="sr-only">dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Laptop className="size-5" /> System
          <span className="sr-only">system</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeProvider, ThemeToggle }
