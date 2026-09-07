import React, { useState, useEffect, useRef } from 'react';
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
  const [isHoverDevice, setIsHoverDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set default mask to transparent (hitam putih) untuk mobile
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
    maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  });
  
  // Gunakan state untuk userTapped agar komponen re-render saat direset
  const [userTapped, setUserTapped] = useState(false);
  // Simpan nilai userTapped di ref juga agar updateMask bisa akses state terbaru tanpa re-bind event listener
  const userTappedRef = useRef(false);
  
  const [isRevealed, setIsRevealed] = useState(false);

  // Sync state -> ref
  useEffect(() => {
    userTappedRef.current = userTapped;
  }, [userTapped]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsHoverDevice(mediaQuery.matches);

    if (isHeroTop) {
      const awakenTimer = setTimeout(() => {
        if (!userTappedRef.current) {
          setIsRevealed(true);
          setMaskStyle({
            WebkitMaskImage: 'none',
            maskImage: 'none',
          });
        }
      }, 400);
      return () => clearTimeout(awakenTimer);
    }

    if (mediaQuery.matches) return;

    // --- MOBILE SCROLL MASKING LOGIC ---
    let animationFrameId: number;
    let isIntersecting = false;

    const viewportObserver = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0].isIntersecting;
        
        if (entries[0].isIntersecting) {
          updateMask();
        } else {
          // --- AUTO RESET KETIKA KELUAR LAYAR ---
          // Jika gambar keluar dari layar, reset state manual (tap)
          if (userTappedRef.current) {
            setUserTapped(false);
            // Kembalikan isRevealed ke false agar base layernya kembali hitam-putih
            setIsRevealed(false); 
          }
          
          // Selalu paksa transparan (hitam putih) saat keluar layar
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
      // Jika user sedang interaksi manual, jangan jalankan efek scanner
      if (!isIntersecting || userTappedRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const wh = window.innerHeight;
      
      const zoneTop = wh * 0.35;
      const zoneBottom = wh * 0.65;

      const pxTop = zoneTop - rect.top;
      const pctTop = (pxTop / rect.height) * 100;

      const pxBottom = zoneBottom - rect.top;
      const pctBottom = (pxBottom / rect.height) * 100;

      const maskStr = `linear-gradient(to bottom, 
        transparent ${pctTop - 25}%, 
        black ${pctTop + 5}%, 
        black ${pctBottom - 5}%, 
        transparent ${pctBottom + 25}%
      )`;

      setMaskStyle({
        WebkitMaskImage: maskStr,
        maskImage: maskStr,
      });
    };

    const handleScroll = () => {
      // Jangan update mask scanner saat gambar sedang dalam mode tap override
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
    const nextTapState = !userTapped;
    setUserTapped(nextTapState);
    
    if (nextTapState) {
      // OVERRIDE ON (Ditap pertama kali) -> Paksa full color
      setIsRevealed(true);
      setMaskStyle({ WebkitMaskImage: 'none', maskImage: 'none' });
    } else {
      // OVERRIDE OFF (Ditap kedua kali) -> Kembali transparan & reset scale
      setIsRevealed(false);
      const emptyMask = 'linear-gradient(to bottom, transparent 0%, transparent 100%)';
      setMaskStyle({ WebkitMaskImage: emptyMask, maskImage: emptyMask });
      
      // Catatan: Setelah ini, handleScroll akan mulai berjalan kembali
      // dan secara natural akan mengkalkulasi ulang updateMask() 
      // begitu layar di scroll sedikit.
    }
  };

  if (!src || hasError) {
    return (
      <div 
        className={`bg-surface flex flex-col items-center justify-center text-text-secondary border border-border p-4 text-center ${className}`}
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
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out hover:grayscale-0 hover:contrast-100 hover:scale-102 ${isRevealed ? 'grayscale-0 contrast-100 scale-102' : 'grayscale contrast-125'}`}
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
      className={`relative w-full h-full overflow-hidden cursor-pointer select-none bg-surface ${className}`}
    >
      {/* LAPISAN 1: Grayscale (Base Layer) */}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out grayscale contrast-125 block ${(userTapped && isRevealed) ? 'grayscale-0 contrast-100 scale-102' : ''}`}
        {...props}
      />
      
      {/* LAPISAN 2: Berwarna (Scanner Layer) */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${(userTapped || isRevealed) ? 'scale-102' : ''}`}
        style={maskStyle}
        {...props}
      />
    </div>
  );
};
