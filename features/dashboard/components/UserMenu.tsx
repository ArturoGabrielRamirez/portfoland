// =============================================================================
// User Menu Component
// =============================================================================
// Client-side dropdown menu for user actions including sign out.
// Displays user avatar with fallback to initials.
// =============================================================================

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { LogOut, User, Globe } from 'lucide-react'

import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import type { UserMenuProps } from '../types/dashboard'

import { Button } from '@/features/shadcn/ui/button'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/features/shadcn/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shadcn/ui/dropdown-menu'

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Extracts initials from a user's name for avatar fallback.
 * Returns first letter of first and last name, or first two letters if single name.
 */
function getInitials(name: string | null): string {
  if (!name) return '?'

  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// =============================================================================
// Component
// =============================================================================

/**
 * User menu dropdown with avatar and sign out functionality.
 *
 * Displays:
 * - User avatar (with image or initials fallback)
 * - User name and email
 * - Sign out action
 * - Placeholder for language switcher (to be implemented in 7.6)
 */
export function UserMenu({ user, locale }: UserMenuProps) {
  const t = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut()
        router.push(`/${locale}/login`)
        router.refresh()
      } catch {
        toast.error(tCommon('errors.unexpected'))
      }
    })
  }

  const initials = getInitials(user.name)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-[#334155] hover:ring-[#00D4FF]/50 transition-all"
          aria-label={t('profile')}
        >
          <Avatar className="h-10 w-10">
            {user.image && (
              <AvatarImage
                src={user.image}
                alt={user.name ?? 'User avatar'}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-[#00D4FF]/20 to-[#8B5CF6]/20 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 border-[#334155] bg-[#0D1421] text-white"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">
              {user.name ?? 'User'}
            </p>
            <p className="text-xs leading-none text-[#94A3B8]">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[#334155]" />

        {/* Profile link - placeholder for future implementation */}
        <DropdownMenuItem
          className="cursor-pointer text-[#94A3B8] focus:bg-[#1A2332] focus:text-white"
          disabled
        >
          <User className="mr-2 h-4 w-4" />
          <span>{t('profile')}</span>
          <span className="ml-auto text-xs text-[#64748B]">Soon</span>
        </DropdownMenuItem>

        {/* Language switcher placeholder - will be implemented in 7.6 */}
        <DropdownMenuItem
          className="cursor-pointer text-[#94A3B8] focus:bg-[#1A2332] focus:text-white"
          disabled
        >
          <Globe className="mr-2 h-4 w-4" />
          <span>{t('language')}</span>
          <span className="ml-auto text-xs text-[#64748B]">Soon</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#334155]" />

        {/* Sign out action */}
        <DropdownMenuItem
          className={cn(
            'cursor-pointer text-[#94A3B8] focus:bg-[#1A2332] focus:text-white',
            isPending && 'pointer-events-none opacity-50'
          )}
          onClick={handleSignOut}
          disabled={isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isPending ? tCommon('loading') : t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
