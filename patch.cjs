const fs = require('fs');
const content = fs.readFileSync('src/components/common/RevealImage.tsx', 'utf8');

const newContent = content.replace(
  `    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Jika user sudah pernah tap manual, jangan ditimpa oleh scroll
        if (userTappedRef.current) return;

        if (entry.isIntersecting) {
          setIsRevealed(true);
        } else {
          setIsRevealed(false);
        }
      },
      {
        // Mendeteksi ketika gambar berada di area pandang tengah layar
        rootMargin: '-15% 0px -15% 0px',
        threshold: 0.15,
      }
    );
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };`,
  `    let isCurrentlyIntersecting = false;

    const handleScroll = () => {
      if (userTappedRef.current) return;
      // Jika gambar ada di area pandang dan user mulai scroll, baru nyalakan warnanya
      if (isCurrentlyIntersecting && window.scrollY > 5) {
        setIsRevealed(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Jika user sudah pernah tap manual, jangan ditimpa oleh scroll
        if (userTappedRef.current) return;

        isCurrentlyIntersecting = entry.isIntersecting;

        if (entry.isIntersecting) {
          // Hanya reveal otomatis jika posisi scroll sudah tidak di paling atas
          // (menunggu user scroll sedikit baru berwarna)
          if (window.scrollY > 5) {
            setIsRevealed(true);
          }
        } else {
          setIsRevealed(false);
        }
      },
      {
        // Mendeteksi ketika gambar berada di area pandang tengah layar
        rootMargin: '-15% 0px -15% 0px',
        threshold: 0.15,
      }
    );
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };`
);

fs.writeFileSync('src/components/common/RevealImage.tsx', newContent);
console.log("Patched!");
