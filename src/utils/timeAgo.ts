/**
 * Format timestamp dinamis ringkas ala microblogging minimalis modern (contoh: 1m, 15m, 2j, 1h, 8 Sep).
 * Menerima Firestore Timestamp ({ seconds: number }), Date object, ISO string, atau fallback string.
 */
export function formatRelativeTime(rawTimestamp: any, fallback: string = 'Baru saja'): string {
  if (!rawTimestamp) return fallback;

  let date: Date | null = null;

  // 1. Jika Firestore Timestamp ({ seconds, nanoseconds })
  if (typeof rawTimestamp === 'object' && typeof rawTimestamp.seconds === 'number') {
    date = new Date(rawTimestamp.seconds * 1000);
  } else if (rawTimestamp instanceof Date) {
    date = rawTimestamp;
  } else if (typeof rawTimestamp === 'number') {
    date = new Date(rawTimestamp);
  } else if (typeof rawTimestamp === 'string') {
    const parsed = Date.parse(rawTimestamp);
    if (!isNaN(parsed)) {
      date = new Date(parsed);
    } else {
      // Jika string lama mengandung kata "lalu", kita bersihkan
      return rawTimestamp.replace(/\s*lalu/gi, '').trim();
    }
  }

  if (!date || isNaN(date.getTime())) {
    return fallback;
  }

  const now = Date.now();
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  // Jika waktu kurang dari 45 detik
  if (diffInSeconds < 45) {
    return 'Baru saja';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}j`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}h`;
  }

  // Tampilkan format tanggal singkat (contoh: 8 Sep atau 08 Sep)
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = monthNames[date.getMonth()];
  return `${day} ${month}`;
}
