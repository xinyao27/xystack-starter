'use client'

import * as React from 'react'
import { cn } from '@xystack/ui'
import { Button, buttonVariants } from '@xystack/ui/button'
import Link from 'next/link'
import { EmailForm } from './email-form'
import { IconGithub } from '~/components/icons'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isSignIn: boolean
}

export function UserAuthForm({ isSignIn, className, ...props }: UserAuthFormProps) {
  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <EmailForm isSignIn={isSignIn} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button type="button" variant="outline">
        <a className="flex" href="/api/auth/signin/oauth?provider=github">
          <IconGithub className="mr-2 size-4" /> GitHub
        </a>
      </Button>

      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">
          {isSignIn ? 'Don’t have an account?' : 'Already have an account?'}
        </span>
        <Link className={cn(buttonVariants({ variant: 'link', size: 'sm' }))} href={isSignIn ? '/sign-up' : '/sign-in'}>
          {isSignIn ? 'Sign up' : 'Sign in'}
        </Link>
      </div>
    </div>
  )
}
