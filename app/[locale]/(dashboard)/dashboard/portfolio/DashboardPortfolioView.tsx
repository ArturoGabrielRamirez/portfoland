'use client';

/**
 * DashboardPortfolioView Component - Cyberpunk V2
 *
 * Client component for the dashboard portfolio edit page with cyberpunk design.
 */

import { useCallback, useTransition, useState } from 'react';
import { ExternalLink, User, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { DashboardNav } from '@/features/gaming';
import { PortfolioModeToggle } from '@/features/portfolio/components/PortfolioModeToggle';
import { ProfileImageUpload } from '@/features/portfolio/components/ProfileImageUpload';
import { updateProfile } from '@/features/portfolio/actions/updateProfile';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

// =============================================================================
// Types
// =============================================================================

interface DashboardPortfolioViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    image: string | null;
    bio: string | null;
    portfolioMode: PortfolioMode;
  };
  oauthImage?: string | null;
}

// =============================================================================
// Main Component
// =============================================================================

export function DashboardPortfolioView({ user, oauthImage }: DashboardPortfolioViewProps) {
  const params = useParams();
  const locale = params.locale as string;
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [image, setImage] = useState<string | null>(user.image || null);

  // Debug: Log oauthImage to verify it's being passed
  console.log('OAuth Image:', oauthImage);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      startTransition(async () => {
        try {
          const result = await updateProfile({
            name,
            bio: bio || null,
            image: image || null,
          });

          if (!result.hasError) {
            toast.success(result.message || 'Profile updated successfully');
          } else {
            toast.error(result.message || 'Failed to update profile');
          }
        } catch (error) {
          console.error('Error updating profile:', error);
          toast.error('An unexpected error occurred');
        }
      });
    },
    [name, bio, image]
  );

  return (
    <div className="min-h-screen bg-[#0A0E1A] font-mono">
      {/* Main Navigation */}
      <DashboardNav locale={locale} user={user} />

      {/* Page Header */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">Edit Portfolio</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Manage your public profile settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.username && (
            <a
              href={`/${locale}/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-[#0F1419] border border-[hsl(174,100%,50%,0.15)] rounded-lg p-6">
          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-mono text-foreground"
              >
                <User className="w-4 h-4 text-[#00D4FF]" />
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className={cn(
                  'w-full px-4 py-2 bg-[#0A0E1A] border border-[hsl(174,100%,50%,0.2)]',
                  'rounded font-mono text-sm text-foreground',
                  'focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]',
                  'transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                placeholder="Your name"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label
                htmlFor="bio"
                className="flex items-center gap-2 text-sm font-mono text-foreground"
              >
                <FileText className="w-4 h-4 text-[#00D4FF]" />
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isPending}
                rows={4}
                className={cn(
                  'w-full px-4 py-2 bg-[#0A0E1A] border border-[hsl(174,100%,50%,0.2)]',
                  'rounded font-mono text-sm text-foreground',
                  'focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]',
                  'transition-colors resize-none',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                placeholder="Tell visitors about yourself..."
                maxLength={500}
              />
              <p className="text-xs font-mono text-muted-foreground">
                {bio.length}/500 characters
              </p>
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-mono text-foreground">
                <User className="w-4 h-4 text-[#00D4FF]" />
                Profile Image
              </label>
              <ProfileImageUpload
                value={image}
                onChange={setImage}
                oauthImage={oauthImage}
              />
            </div>

            {/* Portfolio Mode Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-foreground">Portfolio Theme</label>
              <PortfolioModeToggle currentMode={user.portfolioMode} />
              <p className="text-xs font-mono text-muted-foreground">
                Choose how your public portfolio is displayed
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[hsl(174,100%,50%,0.1)]" />

            {/* Submit Button */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  'px-6 py-2 bg-[#00D4FF] text-[#0A0E1A] font-mono text-sm font-bold',
                  'rounded hover:bg-[#00B8E6] transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
                  'hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]'
                )}
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-[#0F1419] border border-[hsl(174,100%,50%,0.15)] rounded-lg">
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-[#00D4FF]">TIP:</span> Your portfolio is accessible at{' '}
            {user.username ? (
              <a
                href={`/${locale}/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline hover:text-[#00D4FF]"
              >
                /{locale}/{user.username}
              </a>
            ) : (
              <span className="text-foreground">/{locale}/[your-username]</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
