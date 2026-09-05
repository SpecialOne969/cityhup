// ─── Input sanitization ────────────────────────────────────────────────────

/** Strip HTML tags and dangerous characters from user-supplied text. */
export function sanitizeText(input: string, maxLength = 1000): string {
  return input
    .replace(/<[^>]*>/g, '')            // strip HTML tags
    .replace(/[<>"'`]/g, '')            // strip remaining angle brackets / quotes
    .replace(/javascript:/gi, '')       // block js: URIs
    .replace(/on\w+\s*=/gi, '')         // strip inline event handlers
    .trim()
    .slice(0, maxLength);
}

/** Validate email format (RFC 5322 simplified). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Validate phone — allows digits, spaces, +, -, (), min 7 digits. */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/** Validate password strength — min 8 chars, at least one letter + one digit. */
export function isStrongPassword(pw: string): { ok: boolean; reason: string } {
  if (pw.length < 8) return { ok: false, reason: 'Password must be at least 8 characters.' };
  if (!/[a-zA-Z]/.test(pw)) return { ok: false, reason: 'Password must contain at least one letter.' };
  if (!/[0-9]/.test(pw)) return { ok: false, reason: 'Password must contain at least one number.' };
  return { ok: true, reason: '' };
}

// ─── PBKDF2 password hashing (replaces plain SHA-256) ─────────────────────

async function legacySha256(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with PBKDF2-SHA256 + random salt (100k iterations).
 * Returns a string in the format: `pbkdf2:<saltHex>:<hashHex>`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const buf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key, 256
  );
  const hashHex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash.
 * Supports both new PBKDF2 hashes and legacy SHA-256 hashes (migration path).
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('pbkdf2:')) {
    // Legacy SHA-256 — compare and let next login upgrade the hash
    return (await legacySha256(password)) === stored;
  }
  const parts = stored.split(':');
  if (parts.length !== 3) return false;
  const [, saltHex, storedHash] = parts;
  const salt = new Uint8Array((saltHex.match(/.{2}/g) ?? []).map(b => parseInt(b, 16)));

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const buf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key, 256
  );
  const computed = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Constant-time comparison to prevent timing attacks
  if (computed.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  return diff === 0;
}

// ─── Rate limiter (client-side, in-memory) ─────────────────────────────────

interface Attempt { count: number; lockedUntil: number }
const _attempts = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Call before an auth attempt. Returns `{ allowed, waitSeconds }`.
 * `waitSeconds > 0` means the identifier is locked out.
 */
export function checkRateLimit(identifier: string): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  const rec = _attempts.get(identifier);

  if (rec && rec.lockedUntil > now) {
    return { allowed: false, waitSeconds: Math.ceil((rec.lockedUntil - now) / 1000) };
  }
  return { allowed: true, waitSeconds: 0 };
}

/** Call after a FAILED auth attempt. */
export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const rec = _attempts.get(identifier) ?? { count: 0, lockedUntil: 0 };
  const count = rec.lockedUntil < now ? 1 : rec.count + 1;  // reset after lockout expires
  const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCK_MS : rec.lockedUntil;
  _attempts.set(identifier, { count, lockedUntil });
}

/** Call after a SUCCESSFUL auth attempt to clear the counter. */
export function clearFailedAttempts(identifier: string): void {
  _attempts.delete(identifier);
}

// ─── Upload validation ──────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateUpload(blob: Blob): { ok: boolean; reason: string } {
  if (blob.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: `File is too large (max 5 MB, got ${(blob.size / 1024 / 1024).toFixed(1)} MB).` };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(blob.type)) {
    return { ok: false, reason: `File type "${blob.type}" is not allowed. Use JPEG, PNG, WebP, or GIF.` };
  }
  return { ok: true, reason: '' };
}
