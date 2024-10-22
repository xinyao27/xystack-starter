'use client'

import { useState } from 'react'
import { useAuth } from '@xystack/auth/astro'
import { toast } from '@xystack/ui/sonner'
import { cn } from '@xystack/ui'
import { Button } from '@xystack/ui/button'
import { Input } from '@xystack/ui/input'
import { Label } from '@xystack/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xystack/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@xystack/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { navigate } from 'astro:transitions/client'
import { env } from '~/get-env'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isLogin: boolean
}

const FormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
})

export function EmailForm({ isLogin, className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const auth = useAuth()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: env.NODE_ENV === 'development' ? 'hi@xinyao.me' : '',
      pin: '',
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (showCodeInput) return handleCode(data)
    setIsLoading(true)
    try {
      const res = await auth.signInWithOtp({ email: data.email })
      if (res.error) throw new Error(res.error)

      setShowCodeInput(true)
    } catch (error: any) {
      toast.error(error.message || error || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCode(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    try {
      const res = await auth.verifyOtp({ email: data.email, otpCode: data.pin })
      if (res.error) throw new Error(res.error)
      if (res.data?.session) {
        navigate('/')
      }
    } catch (error: any) {
      toast.error(error.message || error || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  async function resendCode() {
    setIsLoading(true)
    try {
      const res = await auth.resendOtp({ email: form.getValues('email') })
      if (res.error) throw new Error(res.error)
    } catch (error: any) {
      toast.error(error.message || error || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(className)} {...props}>
      <Form {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            {!showCodeInput ? (
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          disabled={isLoading}
                          id="email"
                          placeholder="Your email address"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Label className="" htmlFor="email">
                  Check your email
                </Label>
                <p className="text-xs text-muted-foreground">
                  We sent a code to&nbsp;
                  <span className="text-foreground">{form.watch('email')}</span>. It may take a few minutes to arrive.
                </p>

                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputOTP
                          autoComplete="one-time-code"
                          className="w-full"
                          disabled={isLoading}
                          id="code"
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                          {...field}
                        >
                          <InputOTPGroup className="w-full">
                            {Array.from({ length: 6 }).map((_, index: number) => (
                              <InputOTPSlot key={index} className="aspect-square w-full text-xl" index={index} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
            {showCodeInput ? (
              <>
                <Button loading={isLoading} type="submit">
                  Continue
                </Button>
                <Button variant="link" onClick={resendCode}>
                  Didn't receive an email? Resend
                </Button>
              </>
            ) : (
              <Button loading={isLoading} onClick={() => onSubmit(form.getValues())}>
                Sign in with Email
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
