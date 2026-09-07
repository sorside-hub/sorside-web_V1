const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { Disc } from 'lucide-react';

interface RevealImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  isHeroTop?: boolean;
}

export const RevealImage: React.FC<RevealImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  isHeroTop = false,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isHoverDevice, setIsHoverDevice] = useState(false); // Default to mobile/touch behavior until we know it's desktop
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set default mask to transparent (hitam putih) untuk mobile
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
    maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  });
  
  const userTappedRef = useRef(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // 1. Deteksi apakah perangkat menggunakan mouse (Desktop)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsHoverDevice(mediaQuery.matches);

    // 2. Jika isHeroTop = true, kita jadikan full color tanpa masking
    if (isHeroTop) {
      const awakenTimer = setTimeout(() => {
        if (!userTappedRef.current) {
          setIsRevealed(true);
          // Hapus mask agar full color
          setMaskStyle({
            WebkitMaskImage: 'none',
            maskImage: 'none',
          });
        }
      }, 400);
      return () => clearTimeout(awakenTimer);
    }

    // Jika desktop, kita biarkan CSS Hover yang bekerja, hentikan logic scroll
    if (mediaQuery.matches) return;

    // --- MOBILE SCROLL MASKING LOGIC ---
    let animationFrameId: number;
    let isIntersecting = false;

    const viewportObserver = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0].isIntersecting;
        // Panggil updateMask saat intersection berubah (masuk/keluar layar)
        if (entries[0].isIntersecting) {
          updateMask();
        } else {
          // Kalau diluar layar, paksa transparan (hitam putih)
          const emptyMask = 'linear-gradient(to bottom, transparent 0%, transparent 100%)';
          setMaskStyle({
            WebkitMaskImage: emptyMask,
            maskImage: emptyMask,
          });
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      viewportObserver.observe(containerRef.current);
    }

    const updateMask = () => {
      if (!isIntersecting || userTappedRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const wh = window.innerHeight;
      
      // Area tengah layar yang disorot warna (Scanner Zone: 30% s.d 70% dari tinggi layar)
      const zoneTop = wh * 0.35;
      const zoneBottom = wh * 0.65;

      // Hitung posisi
      const pxTop = zoneTop - rect.top;
      const pctTop = (pxTop / rect.height) * 100;

      const pxBottom = zoneBottom - rect.top;
      const pctBottom = (pxBottom / rect.height) * 100;

      // Buat mask: transparan -> hitam solid -> transparan
      const maskStr = \\\`linear-gradient(to bottom, 
        transparent \\\${pctTop - 25}%, 
        black \\\${pctTop + 5}%, 
        black \\\${pctBottom - 5}%, 
        transparent \\\${pctBottom + 25}%
      )\\\`;

      setMaskStyle({
        WebkitMaskImage: maskStr,
        maskImage: maskStr,
      });
    };

    const handleScroll = () => {
      if (userTappedRef.current) return;
      animationFrameId = requestAnimationFrame(updateMask);
    };

    updateMask();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      viewportObserver.disconnect();
    };
  }, [isHeroTop]);

  const handleToggle = (e: React.MouseEvent) => {
    if (isHoverDevice) return; 
    
    // Tap to Toggle
    userTappedRef.current = true;
    setIsRevealed((prev) => !prev);
    
    if (!isRevealed) {
      // Jika dihidupkan, hapus mask (full color)
      setMaskStyle({ WebkitMaskImage: 'none', maskImage: 'none' });
    } else {
      // Jika dimatikan manual, buat transparan (hitam putih)
      setMaskStyle({ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100%)' });
    }
  };

  if (!src || hasError) {
    return (
      <div 
        className={\\\`bg-surface flex flex-col items-center justify-center text-text-secondary border border-border p-4 text-center \\\${className}\\\`}
      >
        <Disc className="w-8 h-8 mb-2 opacity-50 stroke-1" />
        <span className="text-xs font-mono uppercase tracking-wider">
          {fallbackText || 'Artwork Unavailable'}
        </span>
      </div>
    );
  }

  // === RENDER DESKTOP ===
  if (isHoverDevice) {
    return (
      <div className={\\\`relative w-full h-full overflow-hidden \\\${className}\\\`}>
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={\\\`w-full h-full object-cover transition-all duration-700 ease-out hover:grayscale-0 hover:contrast-100 hover:scale-102 \\\${isRevealed ? 'grayscale-0 contrast-100 scale-102' : 'grayscale contrast-125'}\\\`}
          {...props}
        />
      </div>
    );
  }

  // === RENDER MOBILE (DUAL LAYER MASKING) ===
  return (
    <div
      ref={containerRef}
      onClick={handleToggle}
      className={\\\`relative w-full h-full overflow-hidden cursor-pointer select-none bg-surface \\\${className}\\\`}
    >
      {/* LAPISAN 1: Grayscale (Base Layer) */}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={\\\`w-full h-full object-cover transition-all duration-700 ease-out grayscale contrast-125 block \\\${isRevealed ? 'grayscale-0 contrast-100 scale-102' : ''}\\\`}
        {...props}
      />
      
      {/* LAPISAN 2: Berwarna (Scanner Layer) */}
      {/* Gambar warna ditumpuk di atas. Di-masking dengan gradasi. */}
      <img
        src={src}
        alt={alt}
        className={\\\`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out \\\${isRevealed ? 'scale-102' : ''}\\\`}
        style={maskStyle}
        {...props}
      />
    </div>
  );
};
`

fs.writeFileSync('src/components/common/RevealImage.tsx', code);
