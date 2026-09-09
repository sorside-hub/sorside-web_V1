/**
 * Utility Validator & System Enforcement untuk Frequency
 * Mengimplementasikan 4 Aturan Sistem Utama:
 * 1. Rate Limiting / Cooldown Spam (15 detik per aksi post/reply)
 * 2. Filter Kata Kunci Spam, Judi Online, & Tautan Mencurigakan
 * 3. Validasi & Limit Karakter (1 - 2000 karakter, Tag max 20 karakter)
 * 4. Batas Maksimal Resonansi Balasan (200 balasan per sinyal)
 */

const COOLDOWN_SECONDS = 15;
const MAX_CONTENT_LENGTH = 2000;
const MAX_TAG_LENGTH = 20;
const MAX_REPLIES_PER_TRANSMISSION = 200;

// Daftar kata kunci spam/judi terlarang
const BANNED_SPAM_PATTERNS = [
  /\bslot\b/i,
  /\bgacor\b/i,
  /\bmaxwin\b/i,
  /\bzeus\d*\b/i,
  /\bpragmatic\b/i,
  /\bjudi\b/i,
  /\bdepo\d+k?\b/i,
  /\bwd\d+k?\b/i,
  /\brtp\b/i,
  /\btogel\b/i,
  /\bsitus judi\b/i,
  /\blink judi\b/i,
  /\bagen resmi\b/i,
  /\bslot777\b/i,
  /\bslot88\b/i,
];

/**
 * 1. Cek Cooldown / Rate Limiting (15 Detik)
 */
export const checkFrequencyCooldown = (userId: string): { allowed: boolean; remainingSeconds: number } => {
  try {
    const key = `sorside_freq_cd_${userId}`;
    const lastPostStr = localStorage.getItem(key);
    if (!lastPostStr) return { allowed: true, remainingSeconds: 0 };

    const lastPostMs = parseInt(lastPostStr, 10);
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastPostMs) / 1000);

    if (elapsedSeconds < COOLDOWN_SECONDS) {
      return { 
        allowed: false, 
        remainingSeconds: COOLDOWN_SECONDS - elapsedSeconds 
      };
    }
  } catch (err) {
    console.warn('[Frequency Validator] Cooldown storage check error:', err);
  }

  return { allowed: true, remainingSeconds: 0 };
};

/**
 * Catat waktu posting terakhir untuk user
 */
export const recordFrequencyPostTime = (userId: string) => {
  try {
    const key = `sorside_freq_cd_${userId}`;
    localStorage.setItem(key, Date.now().toString());
  } catch (err) {
    console.warn('[Frequency Validator] Record post time error:', err);
  }
};

/**
 * 2 & 3. Validasi Konten, Panjang Karakter, & Filter Spam
 */
export const validateFrequencyContent = (
  content: string, 
  tag?: string
): { isValid: boolean; error?: string; cleanContent: string; cleanTag?: string } => {
  const cleanContent = content.trim();

  // Validasi Kosong & Limit Panjang (Poin 3)
  if (!cleanContent) {
    return { isValid: false, error: 'Sinyal tidak boleh kosong.', cleanContent: '' };
  }

  if (cleanContent.length > MAX_CONTENT_LENGTH) {
    return { 
      isValid: false, 
      error: `Sinyal terlalu panjang. Maksimal ${MAX_CONTENT_LENGTH} karakter (saat ini ${cleanContent.length}).`, 
      cleanContent 
    };
  }

  // Filter Kata Kunci Spam & Judi (Poin 2)
  for (const pattern of BANNED_SPAM_PATTERNS) {
    if (pattern.test(cleanContent)) {
      return { 
        isValid: false, 
        error: 'Sinyal terdeteksi mengandung materi spam, kata kunci terlarang, atau tautan promosi.', 
        cleanContent 
      };
    }
  }

  // Filter Tautan Berbahaya / Phishing (.xyz, .top, .casino, dll)
  const suspiciousUrlPattern = /https?:\/\/[^\s]+(?:\.xyz|\.top|\.club|\.casino|\.link|\.vip|\.app)\b/i;
  if (suspiciousUrlPattern.test(cleanContent)) {
    return {
      isValid: false,
      error: 'Sinyal terdeteksi mengandung tautan domain tidak aman.',
      cleanContent
    };
  }

  // Validasi Tag (Poin 3)
  let cleanTag: string | undefined = undefined;
  if (tag && tag.trim()) {
    const rawTag = tag.trim().replace(/^#+/, '').toLowerCase();
    // Hanya huruf, angka, strip, dan underscore
    cleanTag = rawTag.replace(/[^a-z0-9_-]/g, '').slice(0, MAX_TAG_LENGTH);
  }

  return { isValid: true, cleanContent, cleanTag };
};

/**
 * 4. Batas Maksimal Resonansi Balasan (200 Balasan)
 */
export const validateMaxReplies = (currentRepliesCount: number): { allowed: boolean; error?: string } => {
  if (currentRepliesCount >= MAX_REPLIES_PER_TRANSMISSION) {
    return {
      allowed: false,
      error: `Batas maksimal ${MAX_REPLIES_PER_TRANSMISSION} resonansi pada sinyal ini telah tercapai.`
    };
  }
  return { allowed: true };
};
