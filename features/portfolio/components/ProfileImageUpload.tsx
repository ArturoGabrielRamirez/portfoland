'use client';

/**
 * ProfileImageUpload Component
 *
 * Multi-option image upload component for profile pictures:
 * 1. Upload from PC (drag & drop)
 * 2. URL input (manual link)
 * 3. Use OAuth image (from social login)
 */

import { memo, useState, useCallback, useRef, useTransition } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon, Link as LinkIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadProfileImage } from '../actions/uploadProfileImage';
import { deleteProfileImage } from '../actions/deleteProfileImage';
import { toast } from 'sonner';

interface ProfileImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  oauthImage?: string | null;
  className?: string;
}

type TabMode = 'upload' | 'url' | 'oauth';

function ProfileImageUploadComponent({
  value,
  onChange,
  oauthImage,
  className,
}: ProfileImageUploadProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      startUpload(async () => {
        const result = await uploadProfileImage(formData);
        if (result.hasError) {
          toast.error(result.message);
        } else {
          onChange(result.payload.url);
          toast.success(result.message);
        }
      });
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    if (!value) return;

    startRemove(async () => {
      const result = await deleteProfileImage(value);
      if (result.hasError) {
        toast.error(result.message);
      } else {
        onChange(null);
        toast.success(result.message);
      }
    });
  }, [value, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleUrlSubmit = useCallback(() => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    // Validate URL
    try {
      new URL(trimmedUrl);
      onChange(trimmedUrl);
      setUrlInput('');
      setImageError(false);
      toast.success('Image URL updated');
    } catch {
      toast.error('Invalid URL format. Please enter a valid image URL.');
    }
  }, [urlInput, onChange]);

  const handleUseOAuthImage = useCallback(() => {
    if (oauthImage) {
      onChange(oauthImage);
      toast.success('Using OAuth profile image');
    }
  }, [oauthImage, onChange]);

  const loading = isUploading || isRemoving;

  // Show current image preview at top
  const [imageError, setImageError] = useState(false);

  // Validate URL
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const currentImage = isValidImageUrl(value) ? value : isValidImageUrl(oauthImage) ? oauthImage : null;
  const hasValidOAuthImage = isValidImageUrl(oauthImage);
  const [manualOAuthUrl, setManualOAuthUrl] = useState('');

  // Debug log
  console.log('ProfileImageUpload - oauthImage:', oauthImage, 'hasValidOAuthImage:', hasValidOAuthImage);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Image Preview */}
      {currentImage && isValidImageUrl(currentImage) && !imageError && (
        <div className="space-y-2">
          <label className="text-xs font-mono text-muted-foreground uppercase">
            Current Image
          </label>
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[hsl(174,100%,50%,0.2)] bg-[#0A0E1A]">
            <Image
              src={currentImage}
              alt="Profile preview"
              fill
              className="object-cover"
              sizes="128px"
              onError={() => {
                setImageError(true);
                toast.error('Failed to load image. Please update your image.');
              }}
            />
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className={cn(
                  'absolute top-2 right-2 bg-[#0A0E1A]/80 hover:bg-red-500/80',
                  'text-white rounded h-6 w-6 flex items-center justify-center',
                  'transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isRemoving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Show error message if image is invalid */}
      {currentImage && (!isValidImageUrl(currentImage) || imageError) && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
          <p className="text-xs font-mono text-red-400">
            Invalid image URL. Please upload a new image or use a valid URL.
          </p>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="mt-2 text-xs font-mono text-red-400 hover:text-red-300 underline"
            >
              Remove invalid image
            </button>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[hsl(174,100%,50%,0.1)]">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={cn(
            'px-4 py-2 font-mono text-xs transition-colors',
            activeTab === 'upload'
              ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Upload className="w-3.5 h-3.5 inline mr-1.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={cn(
            'px-4 py-2 font-mono text-xs transition-colors',
            activeTab === 'url'
              ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <LinkIcon className="w-3.5 h-3.5 inline mr-1.5" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('oauth')}
          className={cn(
            'px-4 py-2 font-mono text-xs transition-colors',
            activeTab === 'oauth'
              ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="w-3.5 h-3.5 inline mr-1.5" />
          Social
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex flex-col items-center justify-center w-full h-40 rounded border-2 border-dashed transition-all cursor-pointer',
                isDragging
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                  : 'border-[hsl(174,100%,50%,0.2)] bg-[#0A0E1A] hover:border-[hsl(174,100%,50%,0.3)]',
                loading && 'pointer-events-none opacity-60'
              )}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin mb-2" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
              )}
              <p className="text-sm font-mono text-foreground">
                {isUploading ? 'Uploading...' : 'Drag and drop or click to upload'}
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                PNG, JPG, WEBP (max 5MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <p className="text-xs font-mono text-muted-foreground">
              Enter a direct link to an image
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={cn(
                  'flex-1 px-3 py-2 bg-[#0A0E1A] border border-[hsl(174,100%,50%,0.2)]',
                  'rounded font-mono text-sm text-foreground',
                  'focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]',
                  'transition-colors'
                )}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                className={cn(
                  'px-4 py-2 bg-[#00D4FF] text-[#0A0E1A] font-mono text-sm font-bold',
                  'rounded hover:bg-[#00B8E6] transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* OAuth Tab */}
        {activeTab === 'oauth' && (
          <div className="space-y-3">
            {hasValidOAuthImage && oauthImage ? (
              // Show saved OAuth image
              <>
                <p className="text-xs font-mono text-muted-foreground">
                  Use your profile image from social login (Google, GitHub, etc.)
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[hsl(174,100%,50%,0.2)] bg-[#0A0E1A]">
                    <Image
                      src={oauthImage}
                      alt="OAuth profile"
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseOAuthImage}
                    disabled={value === oauthImage}
                    className={cn(
                      'px-4 py-2 bg-[#00D4FF] text-[#0A0E1A] font-mono text-sm font-bold',
                      'rounded hover:bg-[#00B8E6] transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {value === oauthImage ? 'Currently Using' : 'Use This Image'}
                  </button>
                </div>
              </>
            ) : (
              // Show input to paste OAuth image URL
              <>
                <p className="text-xs font-mono text-muted-foreground">
                  Paste your profile image URL from Google/GitHub
                </p>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={manualOAuthUrl}
                    onChange={(e) => setManualOAuthUrl(e.target.value)}
                    placeholder="https://lh3.googleusercontent.com/..."
                    className={cn(
                      'w-full px-3 py-2 bg-[#0A0E1A] border border-[hsl(174,100%,50%,0.2)]',
                      'rounded font-mono text-sm text-foreground',
                      'focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]',
                      'transition-colors'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (manualOAuthUrl.trim()) {
                        onChange(manualOAuthUrl.trim());
                        setManualOAuthUrl('');
                        setImageError(false);
                        toast.success('OAuth image applied');
                      }
                    }}
                    disabled={!manualOAuthUrl.trim()}
                    className={cn(
                      'px-4 py-2 bg-[#00D4FF] text-[#0A0E1A] font-mono text-sm font-bold',
                      'rounded hover:bg-[#00B8E6] transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    Apply
                  </button>
                  <p className="text-xs font-mono text-[#64748B] mt-2">
                    💡 Tip: Go to your Google account, right-click your profile picture, and copy the image URL
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const ProfileImageUpload = memo(ProfileImageUploadComponent);
