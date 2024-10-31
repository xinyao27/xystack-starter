import type { Return } from '../../../api/src/root'
import type {
  ResendOtpParams,
  ResendOtpReturn,
  Session,
  SignInWithOAuthParams,
  SignInWithOAuthReturn,
  SignInWithOtpParams,
  SignInWithOtpReturn,
  User,
  VerifyOtpParams,
  VerifyOtpReturn,
} from '../types'

export interface AuthContextValue {
  user?: User | null
  session?: Session | null
  signInWithOtp: (params: SignInWithOtpParams) => Promise<Return<SignInWithOtpReturn>>
  verifyOtp: (params: VerifyOtpParams) => Promise<Return<VerifyOtpReturn>>
  resendOtp: (params: ResendOtpParams) => Promise<Return<ResendOtpReturn>>
  signInWithOAuth: (params: SignInWithOAuthParams) => Promise<Return<SignInWithOAuthReturn>>
  signOut: () => Promise<void>
}
