'use client';

/**
 * ImageUpload Component
 *
 * Drag-and-drop image upload zone with preview and removal.
 * Uses uploadProjectImage and deleteProjectImage server actions.
 */

import { memo, useState, useCallback, useRef, useTransition } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import { uploadProjectImage } from '../actions/uploadProjectImage';
import { deleteProjectImage } from '../actions/deleteProjectImage';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  className?: string;
}

function ImageUploadComponent({ value, onChange, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      startUpload(async () => {
        const result = await uploadProjectImage(formData);
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
      const result = await deleteProjectImage(value);
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

  const loading = isUploading || isRemoving;

  // Show preview when image is uploaded
  if (value) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="relative w-full h-48 rounded-sm overflow-hidden border border-[#1E293B] bg-[#0D1421]">
          <Image
            src={value}
            alt="Project cover image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={loading}
            className="absolute top-2 right-2 bg-[#0D1421]/80 hover:bg-red-500/80 text-white rounded-sm h-8 w-8 p-0"
            data-testid="remove-image-button"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Show upload zone when no image
  return (
    <div className={cn('space-y-2', className)}>
      <div
        data-testid="image-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center w-full h-48 rounded-sm border-2 border-dashed transition-all cursor-pointer',
          isDragging
            ? 'border-[#00D4FF] bg-[#00D4FF]/10'
            : 'border-[#1E293B] bg-[#0D1421]/50 hover:border-[#334155]',
          loading && 'pointer-events-none opacity-60'
        )}
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
        ) : (
          <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
        )}
        <p className="text-sm text-slate-400">
          {isUploading ? 'Uploading...' : 'Drag and drop or click to upload'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          PNG, JPG, WEBP (max 5MB)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        data-testid="image-file-input"
      />
    </div>
  );
}

export const ImageUpload = memo(ImageUploadComponent);
