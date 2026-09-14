// Standard HS256 JWT using Web Crypto API (supported in Next.js Edge Runtime & Node.js 18+)

export interface JWTPayload {
  userId: string;
  role: 'student' | 'teacher';
  name: string;
  email?: string;
  exp: number; // Unix timestamp in seconds
  iat?: number;
}

const JWT_SECRET = process.env.SESSION_SECRET || 'learngraph_jwt_secret_key_2026_super_secure_auth_token_98765';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sign a payload and return an RFC 7519 compliant HS256 JWT string.
 */
export async function signJWT(payload: Omit<JWTPayload, 'iat'>): Promise<string> {
  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload: JWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  const headerB64 = toBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = toBase64Url(enc.encode(JSON.stringify(fullPayload)));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(dataToSign)
  );

  const signatureB64 = toBase64Url(new Uint8Array(signature));
  return `${dataToSign}.${signatureB64}`;
}

/**
 * Verify an HS256 JWT string. Returns JWTPayload if valid, or null if invalid/expired.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const dataToSign = `${parts[0]}.${parts[1]}`;
    const signatureBytes = fromBase64Url(parts[2]);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(dataToSign)
    );

    if (!isValid) return null;

    const payloadBytes = fromBase64Url(parts[1]);
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const payload: JWTPayload = JSON.parse(payloadStr);

    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
