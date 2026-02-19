// =============================================================================
// Login Page - Gaming Style
// =============================================================================
// Authentication page for existing users with cyberpunk/gaming aesthetic.
// Uses gaming UI components with glow effects while maintaining Better Auth
// functionality. Supports email/password and Google OAuth sign-in.
// =============================================================================

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'

import { signIn } from '@/lib/auth-client'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { cn } from '@/lib/utils'

import {
  TechButton,
  TechInput,
  GoogleIcon,
  EyeIcon,
  EyeOffIcon,
  Spinner,
} from '@/features/tech'

// =============================================================================
// Login Page Component
// =============================================================================

/**
 * Gaming-styled login page component.
 *
 * Features:
 * - Two-panel layout with branding on left
 * - Cyberpunk/gaming aesthetic with glow effects
 * - Google OAuth and email/password authentication
 * - Client-side validation with react-hook-form and Yup
 * - Internationalization support via next-intl
 */
export default function LoginPage() {
  const t = useTranslations('auth.login')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize react-hook-form with Yup schema resolver
  const form = useForm<LoginInput>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  // Handle email/password form submission
  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        toast.error(t('errors.invalidCredentials'))
        return
      }

      // Redirect to dashboard on successful login
      router.push(`/${locale}/dashboard`)
    })
  }

  // Handle Google OAuth sign in
  const handleGoogleSignIn = () => {
    setIsGooglePending(true)

    signIn
      .social({
        provider: 'google',
        callbackURL: `/${locale}/dashboard`,
      })
      .catch(() => {
        toast.error(tCommon('errors.unexpected'))
        setIsGooglePending(false)
      })
  }

  const isSubmitting = isPending || isGooglePending

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex font-mono relative overflow-hidden">
      {/* Hex grid background SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15 0 L30 7.5 L30 22.5 L15 30 L0 22.5 L0 7.5 Z" fill="none" stroke="#00D4FF" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D1421] border-r border-[#1E293B] flex-col justify-between p-12 relative z-10">
        <div>
          {/* Logo - Hexagon */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(174,100%,50%)" fillOpacity="0.3" stroke="hsl(174,100%,50%)" strokeWidth="2.5" />
              <text x="50" y="62" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="44" fontWeight="bold" fontFamily="monospace">P</text>
            </svg>
            <span className="font-mono font-bold text-lg tracking-[0.15em] text-foreground uppercase">
              {tCommon('appName')}
            </span>
          </Link>
        </div>

        <div className="space-y-8 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-mono font-black uppercase tracking-tight text-foreground leading-tight">
            {t('gaming.heroTitle').split(' ').slice(0, 2).join(' ')}
            <br />
            <span className="text-[#00D4FF]">
              {t('gaming.heroTitle').split(' ').slice(2).join(' ')}
            </span>
          </h1>
          <p className="text-sm font-mono text-[#94A3B8] leading-relaxed">
            {t('gaming.heroSubtitle')}
          </p>

          {/* Feature List */}
          <div className="flex flex-col gap-2">
            {[
              { text: t('gaming.feature1'), color: 'hsl(174,100%,50%)' },
              { text: t('gaming.feature2'), color: 'hsl(330,100%,65%)' },
              { text: t('gaming.feature3'), color: 'hsl(150,100%,45%)' },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color }} />
                <span className="text-sm font-mono" style={{ color: feature.color }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] font-mono text-[#64748B]">
          &copy; {new Date().getFullYear()} {tCommon('appName')}. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Hex border decoration */}
        <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[hsl(174,100%,50%,0.2)] to-transparent hidden lg:block" />

        {/* Decorative corner hexagons */}
        {[
          { top: '8%', right: '8%' },
          { bottom: '8%', left: '8%' },
        ].map((pos, i) => (
          <svg key={i} className="absolute w-3 h-3 text-[#00D4FF] opacity-30" style={pos} viewBox="0 0 100 100">
            <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        ))}

        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-3"
            >
              <svg width="40" height="40" viewBox="0 0 100 100">
                <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(174,100%,50%)" fillOpacity="0.3" stroke="hsl(174,100%,50%)" strokeWidth="2.5" />
                <text x="50" y="62" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="44" fontWeight="bold" fontFamily="monospace">P</text>
              </svg>
              <span className="font-mono font-bold text-lg tracking-[0.15em] text-foreground uppercase">
                {tCommon('appName')}
              </span>
            </Link>
          </div>

          {/* Auth Tabs */}
          <div className="flex border border-[hsl(174,100%,50%,0.2)] mb-8">
            <div className="flex-1 py-2.5 text-xs font-mono uppercase tracking-[0.2em] font-bold bg-[#00D4FF] text-[#0A0E1A] text-center">
              {t('gaming.tabLogin')}
            </div>
            <Link
              href={`/${locale}/register`}
              className={cn(
                'flex-1 py-2.5 text-xs font-mono uppercase tracking-[0.2em] font-bold text-[#64748B] hover:text-foreground transition-colors text-center',
                isSubmitting && 'pointer-events-none opacity-50'
              )}
            >
              {t('gaming.tabRegister')}
            </Link>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748B] mb-2">
                {t('emailLabel')} *
              </label>
              <TechInput
                type="email"
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                disabled={isSubmitting}
                error={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-mono text-[#EF4444] mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748B] mb-2">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <TechInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  error={!!errors.password}
                  className="pr-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-mono text-[#EF4444] mt-1">
                  {errors.password.message}
                </p>
              )}
              <Link
                href={`/${locale}/forgot-password`}
                className={cn(
                  'block text-[10px] font-mono text-[#00D4FF] mt-2 hover:underline',
                  isSubmitting && 'pointer-events-none opacity-50'
                )}
              >
                {t('forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <TechButton
              type="submit"
              variant="primary"
              className="w-full uppercase tracking-[0.2em]"
              disabled={isSubmitting}
            >
              {isPending ? (
                <>
                  <Spinner />
                  <span>{tCommon('loading')}</span>
                </>
              ) : (
                t('gaming.submitButton')
              )}
            </TechButton>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[hsl(174,100%,50%,0.15)]" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#64748B]">
                {t('gaming.orContinueWith')}
              </span>
              <div className="flex-1 h-[1px] bg-[hsl(174,100%,50%,0.15)]" />
            </div>

            {/* Social Login */}
            <TechButton
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              {isGooglePending ? (
                <Spinner />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span>{t('googleButton')}</span>
            </TechButton>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-xs font-mono text-[#94A3B8]">
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/register`}
              className={cn(
                'text-[#00D4FF] hover:underline',
                isSubmitting && 'pointer-events-none opacity-50'
              )}
            >
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
