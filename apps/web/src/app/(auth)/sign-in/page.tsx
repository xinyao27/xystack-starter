import { UserAuthForm } from '~/features/authentication/user-auth-form'

export default function SignIn() {
  return (
    <div className="container relative flex h-screen items-center justify-center">
      <div>
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="mb-8 text-2xl font-semibold tracking-tight">Sign in</h1>
        </div>
        <div className="min-w-76 rounded-xl border p-12">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-72">
            <UserAuthForm isSignIn />
          </div>
        </div>
      </div>
    </div>
  )
}
