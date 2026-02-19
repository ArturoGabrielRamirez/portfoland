// =============================================================================
// Registration Page - Gaming Style
// =============================================================================
// New user registration page with cyberpunk/gaming aesthetic. Uses gaming UI
// components with glow effects while maintaining Better Auth functionality.
// Supports email/password and Google OAuth registration.
// =============================================================================

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'

import { signUp, signIn } from '@/lib/auth-client'
import { registerSchema, type RegisterInput } from '@/features/auth/schemas'
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
// Registration Page Component
// =============================================================================

/**
 * Gaming-styled registration page component.
 *
 * Features:
 * - Two-panel layout with branding on left
 * - Cyberpunk/gaming aesthetic with glow effects
 * - Google OAuth and email/password registration
 * - Client-side validation with react-hook-form and Yup
 * - Internationalization support via next-intl
 */
export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Initialize react-hook-form with Yup schema resolver
  const form = useForm<RegisterInput>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  // Handle email/password form submission
  const onSubmit = (data: RegisterInput) => {
    startTransition(async () => {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        // Check for specific error types
        if (result.error.code === 'USER_ALREADY_EXISTS') {
          toast.error(t('errors.emailInUse'))
        } else {
          toast.error(tCommon('errors.unexpected'))
        }
        return
      }

      // Redirect to dashboard on successful registration
      router.push(`/${locale}/dashboard`)
    })
  }

  // Handle Google OAuth sign up
  const handleGoogleSignUp = () => {
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
    <div className="min-h-screen bg-[#0A0E1A] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D1421] border-r border-[#1E293B] flex-col justify-between p-12">
        <div>
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-sm bg-[#00D4FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)]">
              <span className="font-bold text-[#0A0E1A] text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-white">
              {tCommon('appName').toUpperCase()}
            </span>
          </Link>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            {t('gaming.heroTitle')}
          </h1>
          <p className="text-[#94A3B8] text-lg">{t('gaming.heroSubtitle')}</p>

          {/* Feature List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
              <span className="text-white">{t('gaming.feature1')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#D946EF] shadow-[0_0_8px_rgba(217,70,239,0.6)]" />
              <span className="text-white">{t('gaming.feature2')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-white">{t('gaming.feature3')}</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-[#64748B]">
          &copy; {new Date().getFullYear()} {tCommon('appName')}
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-sm bg-[#00D4FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)]">
                <span className="font-bold text-[#0A0E1A] text-lg">P</span>
              </div>
              <span className="font-bold text-xl text-white">
                {tCommon('appName').toUpperCase()}
              </span>
            </Link>
          </div>

          {/* Auth Tabs */}
          <div className="flex rounded-sm border border-[#1E293B] bg-[#0D1421] p-1 mb-8">
            <Link
              href={`/${locale}/login`}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-sm text-sm font-medium text-[#94A3B8] hover:text-white transition-colors text-center',
                isSubmitting && 'pointer-events-none opacity-50'
              )}
            >
              {t('gaming.tabLogin')}
            </Link>
            <div className="flex-1 py-2.5 px-4 rounded-sm text-sm font-medium bg-[#00D4FF] text-[#0A0E1A] shadow-[0_0_15px_rgba(0,212,255,0.3)] text-center">
              {t('gaming.tabRegister')}
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white uppercase tracking-wider">
                {t('nameLabel')}
              </label>
              <TechInput
                type="text"
                placeholder={t('namePlaceholder')}
                autoComplete="name"
                disabled={isSubmitting}
                error={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-[#EF4444]">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white uppercase tracking-wider">
                {t('emailLabel')}
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
                <p className="text-sm text-[#EF4444]">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white uppercase tracking-wider">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <TechInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="new-password"
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
                <p className="text-sm text-[#EF4444]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white uppercase tracking-wider">
                {t('confirmPasswordLabel')}
              </label>
              <div className="relative">
                <TechInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  error={!!errors.confirmPassword}
                  className="pr-12"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-[#EF4444]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <TechButton
              type="submit"
              variant="primary"
              className="w-full"
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
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1E293B]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0A0E1A] text-[#64748B] uppercase tracking-wider">
                  {t('gaming.orContinueWith')}
                </span>
              </div>
            </div>

            {/* Social Login */}
            <TechButton
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
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

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-[#94A3B8]">
            {t('hasAccount')}{' '}
            <Link
              href={`/${locale}/login`}
              className={cn(
                'font-medium text-[#00D4FF] hover:underline',
                isSubmitting && 'pointer-events-none opacity-50'
              )}
            >
              {t('signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
