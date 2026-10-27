/**
 * Firebase ID Token & Admin RBAC Verification for Cloudflare Worker
 * Uses native Web Crypto API and Google's official public JWKs.
 */

interface GoogleJwkKey {
  kid: string;
  n: string;
  e: string;
  kty: string;
  alg: string;
  use: string;
}

interface JwkSetResponse {
  keys: GoogleJwkKey[];
}

export interface AuthenticatedAdminUser {
  uid: string;
  email?: string;
  isAdmin: boolean;
  source: 'custom_claim' | 'bootstrapped_owner' | 'firestore_admin' | 'local_dev';
}

export interface TokenVerificationResult {
  valid: boolean;
  user?: AuthenticatedAdminUser;
  error?: string;
  status: number;
}

const GOOGLE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const BOOTSTRAPPED_OWNER_EMAIL = 'ayushprakash0021@gmail.com';

let cachedJwks: { keys: GoogleJwkKey[]; expiresAt: number } | null = null;

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function parseJwtJson<T>(str: string): T {
  const bytes = base64UrlDecode(str);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text) as T;
}

async function fetchGoogleJwks(): Promise<GoogleJwkKey[]> {
  const now = Date.now();
  if (cachedJwks && cachedJwks.expiresAt > now) {
    return cachedJwks.keys;
  }

  try {
    const res = await fetch(GOOGLE_JWKS_URL, {
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit);

    if (!res.ok) {
      throw new Error(`Failed to fetch Google JWKs: HTTP ${res.status}`);
    }

    const data = (await res.json()) as JwkSetResponse;
    const maxAgeHeader = res.headers.get('cache-control');
    let maxAgeSeconds = 3600;
    if (maxAgeHeader) {
      const match = maxAgeHeader.match(/max-age=(\d+)/i);
      if (match && match[1]) {
        maxAgeSeconds = parseInt(match[1], 10);
      }
    }

    cachedJwks = {
      keys: data.keys,
      expiresAt: now + maxAgeSeconds * 1000,
    };

    return data.keys;
  } catch (err) {
    if (cachedJwks) return cachedJwks.keys;
    throw err;
  }
}

/**
 * Verifies a Firebase Authentication ID Token and confirms admin authorization.
 */
export async function verifyFirebaseAdminToken(
  token: string,
  projectId: string = 'orion9-dev-db-2026',
  allowLocalDev: boolean = false
): Promise<TokenVerificationResult> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Authorization header is missing or empty.', status: 401 };
  }

  const cleanToken = token.trim().replace(/^Bearer\s+/i, '');

  // Local development / test synthetic token support
  if (cleanToken === 'mock-local-dev-admin-token' || cleanToken.startsWith('test-admin-token')) {
    if (allowLocalDev) {
      return {
        valid: true,
        user: {
          uid: 'local-dev-admin-uid-01',
          email: BOOTSTRAPPED_OWNER_EMAIL,
          isAdmin: true,
          source: 'local_dev',
        },
        status: 200,
      };
    } else {
      return {
        valid: false,
        error: 'Synthetic local development administrator credentials are only permitted from authorized development and testing origins.',
        status: 401,
      };
    }
  }

  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed JWT structure in authorization token.', status: 401 };
  }

  const [rawHeader, rawPayload, rawSignature] = parts;

  let header: { alg?: string; kid?: string; typ?: string };
  let payload: {
    iss?: string;
    aud?: string;
    sub?: string;
    user_id?: string;
    email?: string;
    email_verified?: boolean;
    admin?: boolean;
    role?: string;
    exp?: number;
    auth_time?: number;
  };

  try {
    header = parseJwtJson(rawHeader);
    payload = parseJwtJson(rawPayload);
  } catch {
    return { valid: false, error: 'Failed to parse JWT header or payload.', status: 401 };
  }

  if (header.alg !== 'RS256' || !header.kid) {
    return { valid: false, error: 'Unsupported JWT algorithm or missing kid.', status: 401 };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) {
    return { valid: false, error: 'Firebase authentication token has expired. Please sign in again.', status: 401 };
  }

  if (payload.aud !== projectId) {
    return {
      valid: false,
      error: `Token audience mismatch (expected "${projectId}", received "${payload.aud}").`,
      status: 403,
    };
  }

  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    return {
      valid: false,
      error: `Token issuer mismatch (expected "https://securetoken.google.com/${projectId}").`,
      status: 403,
    };
  }

  // Cryptographic signature verification via Web Crypto API
  try {
    const keys = await fetchGoogleJwks();
    const matchingKey = keys.find((k) => k.kid === header.kid);
    if (!matchingKey) {
      return { valid: false, error: 'No matching Google public key found for token signature.', status: 401 };
    }

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      matchingKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    const dataToVerify = new TextEncoder().encode(`${rawHeader}.${rawPayload}`);
    const signatureBytes = base64UrlDecode(rawSignature);

    const isSigValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signatureBytes as unknown as BufferSource,
      dataToVerify
    );

    if (!isSigValid) {
      return { valid: false, error: 'Invalid cryptographic signature on Firebase token.', status: 401 };
    }
  } catch (err: unknown) {
    return {
      valid: false,
      error: `Token cryptographic verification failed: ${(err as Error).message}`,
      status: 401,
    };
  }

  // -------------------------------------------------------------
  // Role & Admin Authorization Verification
  // -------------------------------------------------------------
  const uid = payload.sub || payload.user_id;
  if (!uid) {
    return { valid: false, error: 'Token missing user subject UID.', status: 401 };
  }

  // 1. Custom token claims
  if (payload.admin === true || payload.role === 'admin' || payload.role === 'superadmin') {
    return {
      valid: true,
      user: {
        uid,
        email: payload.email,
        isAdmin: true,
        source: 'custom_claim',
      },
      status: 200,
    };
  }

  // 2. Verified bootstrap owner
  if (
    payload.email &&
    payload.email.toLowerCase() === BOOTSTRAPPED_OWNER_EMAIL.toLowerCase() &&
    payload.email_verified === true
  ) {
    return {
      valid: true,
      user: {
        uid,
        email: payload.email,
        isAdmin: true,
        source: 'bootstrapped_owner',
      },
      status: 200,
    };
  }

  // Account authenticated, but lacks administrator privilege
  return {
    valid: false,
    error: 'Access denied: Your account is authenticated, but does not possess verified administrator privileges in Orion-9.',
    status: 403,
  };
}
