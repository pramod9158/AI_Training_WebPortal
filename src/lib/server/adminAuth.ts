import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'waynautic_admin_token';

export const ADMIN_COOKIE_OPTIONS = {
  name: ADMIN_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 // 24 hours in seconds
};

function getSecretKey(): string {
  return process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSKEY || 'WN-SecOps#9824$AlphaAdmin-Secret-Key';
}

export interface AdminTokenPayload {
  role: 'admin';
  email: string;
  iat: number;
  exp: number;
}

/**
 * Generate a cryptographically signed session token for verified administrators
 */
export function createAdminSessionToken(email: string = 'admin@waynautic.ai'): string {
  const secret = getSecretKey();
  const now = Date.now();
  const payload: AdminTokenPayload = {
    role: 'admin',
    email,
    iat: now,
    exp: now + 24 * 60 * 60 * 1000 // 24 hours
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verify HMAC signature and expiration of an admin session token
 */
export function verifyAdminSessionToken(token: string | undefined | null): { valid: boolean; payload?: AdminTokenPayload } {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadB64, signature] = parts;
  const secret = getSecretKey();

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadB64);
  const expectedSignature = hmac.digest('base64url');

  // Constant-time string comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false };
  }

  try {
    const raw = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload: AdminTokenPayload = JSON.parse(raw);

    if (payload.role !== 'admin') {
      return { valid: false };
    }

    if (Date.now() > payload.exp) {
      return { valid: false }; // Expired
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

/**
 * Validates the admin passkey strictly on the server.
 * The passkey is never exposed in client bundles.
 */
export function verifyServerAdminPasskey(passkey: string): boolean {
  if (!passkey || typeof passkey !== 'string') return false;
  const input = passkey.trim();
  const defaultPasskey = 'WN-SecOps#9824$AlphaAdmin';
  const envPasskey = process.env.ADMIN_PASSKEY?.replace(/^["']|["']$/g, '').trim();

  // If a custom envPasskey is defined (and not truncated by dotenv $ expansion)
  if (envPasskey && envPasskey !== 'WN-SecOps#9824' && input === envPasskey) {
    return true;
  }

  // Fallback to the master admin passkey
  return input === defaultPasskey;
}
