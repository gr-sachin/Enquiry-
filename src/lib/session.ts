import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Lazily resolve at request-time so the build doesn't fail when JWT_SECRET
// is not available as a Docker build-arg (it is injected at runtime via k8s Secret).
function getKey(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
      'Define it in .env.local (dev) or as a Kubernetes Secret (production).'
    );
  }
  return new TextEncoder().encode(secretKey);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getKey());
}

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ userId, expires });

  // Store the session synchronously within request/response lifecycle
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
