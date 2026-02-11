/**
 * Project Image Upload Action Tests
 *
 * Tests for the uploadProjectImage and deleteProjectImage server actions.
 * Covers: file size rejection, file type rejection, blob deletion.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: 'cluser123456789' },
      }),
    },
  },
}));

// Mock @vercel/blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://blob.vercel-storage.com/test.png' }),
  del: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks
import { uploadProjectImage } from '../actions/uploadProjectImage';
import { deleteProjectImage } from '../actions/deleteProjectImage';
import { del } from '@vercel/blob';
import { PROJECT_MESSAGES } from '../constants/messages';

// =============================================================================
// Helper: Create a mock File inside FormData
// =============================================================================

function createMockFormData(
  name: string,
  type: string,
  sizeInBytes: number
): FormData {
  const content = new Uint8Array(sizeInBytes);
  const file = new File([content], name, { type });
  const formData = new FormData();
  formData.set('file', file);
  return formData;
}

// =============================================================================
// Tests
// =============================================================================

describe('Project Image Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadProjectImage', () => {
    it('rejects files over 5MB with size error message', async () => {
      const overSizeBytes = 5 * 1024 * 1024 + 1; // 5MB + 1 byte
      const formData = createMockFormData('large.png', 'image/png', overSizeBytes);

      const result = await uploadProjectImage(formData);

      expect(result.hasError).toBe(true);
      expect(result.message).toBe(PROJECT_MESSAGES.UPLOAD_SIZE_ERROR);
    });

    it('rejects invalid file types (e.g., .gif) with type error message', async () => {
      const formData = createMockFormData('animation.gif', 'image/gif', 1024);

      const result = await uploadProjectImage(formData);

      expect(result.hasError).toBe(true);
      expect(result.message).toBe(PROJECT_MESSAGES.UPLOAD_TYPE_ERROR);
    });
  });

  describe('deleteProjectImage', () => {
    it('calls blob delete with correct URL', async () => {
      const blobUrl = 'https://blob.vercel-storage.com/project-image-abc123.png';

      const result = await deleteProjectImage(blobUrl);

      expect(del).toHaveBeenCalledWith(blobUrl);
      expect(result.hasError).toBe(false);
      expect(result.message).toBe(PROJECT_MESSAGES.DELETE_IMAGE_SUCCESS);
    });
  });
});
