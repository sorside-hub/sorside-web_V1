import React, { useState, useEffect } from 'react';
import { resolveImageUrl, DEFAULT_COVER_PLACEHOLDER } from '../../lib/imageHelper';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallbackSrc?: string;
  options?: {
    width?: number;
    height?: number;
    quality?: string | number;
    crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  };
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = DEFAULT_COVER_PLACEHOLDER,
  options,
  alt = 'Cover Art',
  className = '',
  ...props
}) => {
  const resolved = resolveImageUrl(src, options);
  const [imgSrc, setImgSrc] = useState<string>(resolved);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const newResolved = resolveImageUrl(src, options);
    setImgSrc(newResolved);
    setHasError(false);
  }, [src, options?.width, options?.height]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    props.onError?.(e);
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};
