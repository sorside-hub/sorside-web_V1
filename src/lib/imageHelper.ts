/**
 * SORSIDE Image & Cloudinary Resolver Helper
 * Supports standard URLs (https/http/data/assets) and Cloudinary Public IDs
 */

// Default SORSIDE Cover Placeholder
export const DEFAULT_COVER_PLACEHOLDER =
  'https://res.cloudinary.com/sorside/image/upload/v1784875625/cover-all.webp';

/**
 * Gets the configured Cloudinary cloud name from environment or fallback
 */
export const getCloudinaryCloudName = (): string => {
  const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (envCloudName && typeof envCloudName === 'string' && envCloudName.trim().length > 0) {
    return envCloudName.trim();
  }
  return 'sorside';
};

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

/**
 * Resolves an image URL or Cloudinary Public ID into a full, valid image URL.
 * 
 * @param input - Direct URL (https://...), local path (/...), or Cloudinary Public ID (e.g. 'cover-all', 'releases/album-1')
 * @param options - Optional image transformation options for Cloudinary
 */
export const resolveImageUrl = (
  input?: string | null,
  options?: ImageTransformOptions
): string => {
  if (!input || typeof input !== 'string') {
    return DEFAULT_COVER_PLACEHOLDER;
  }

  const trimmed = input.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return DEFAULT_COVER_PLACEHOLDER;
  }

  // 1. Direct Web URLs or local assets
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  // 2. Cloudinary Public ID (e.g. 'cover-all', 'v17192837/my-cover', 'releases/album-1')
  const cloudName = getCloudinaryCloudName();
  const cleanPublicId = trimmed.replace(/^\/+/, ''); // remove any leading slashes

  // Build Cloudinary transformations
  const transforms: string[] = ['f_auto', 'q_auto'];

  if (options?.width && options?.height) {
    transforms.push(`w_${options.width}`, `h_${options.height}`, `c_${options.crop || 'fill'}`);
  } else if (options?.width) {
    transforms.push(`w_${options.width}`);
  } else if (options?.height) {
    transforms.push(`h_${options.height}`);
  }

  const transformString = transforms.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${cleanPublicId}`;
};
