'use client'

import * as React from 'react'
import { LucideGithub } from 'lucide-react'
import { cn } from '@xystack/ui'
import { Button } from '@xystack/ui/button'
import { EmailForm } from './email-form'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <EmailForm isLogin />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button type="button" variant="outline">
        <a className="flex" href="/api/auth/login/oauth?provider=github">
          <LucideGithub className="mr-2 size-4" /> GitHub
        </a>
      </Button>
    </div>
  )
}
