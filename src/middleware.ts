import { NextResponse } from 'next/server';
import { verifySessionJwt } from './lib/session';

const AUTH_PORTAL = process.env.AUTH_PORTAL_URL || 'https://auth.voca.com/login';
const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'voca.com';

// Paths that should bypass tenant resolution entirely
const PUBLIC_PATHS = ['/api/auth/', '/login', '/signup', '/favicon.ico'];

/**
 * Edge Middleware – Tenant Resolution & Session Guard.
 *
 * 1. Parses the Host header to extract the tenant slug.
 * 2. Reads the wildcard session cookie.
 * 3. Verifies the JWT and asserts the user has access to the requested tenant.
 */
export async function middleware(request: any) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl?.pathname || '';

  // Skip middleware for public paths (login, signup, API auth routes)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Extract tenant slug from subdomain (e.g., "mybiz" from "mybiz.voca.com")
  const tenantSlug = host.replace(`.${ROOT_DOMAIN}`, '').split(':')[0];

  // If the request is to the root domain itself (no subdomain), pass through
  if (!tenantSlug || tenantSlug === ROOT_DOMAIN || tenantSlug === 'www') {
    return NextResponse.next();
  }

  // 1. Check for session cookie
  const sessionCookie = request.cookies.get('session');
  if (!sessionCookie?.value) {
    return NextResponse.redirect(AUTH_PORTAL, { status: 307 });
  }

  // 2. Verify the JWT
  let session;
  try {
    session = await verifySessionJwt(sessionCookie.value);
  } catch {
    return NextResponse.redirect(AUTH_PORTAL, { status: 307 });
  }

  // 3. Assert tenant access — the session's tenantSlug must match the requested subdomain
  if (session.tenantSlug !== tenantSlug) {
    return new NextResponse('Forbidden: No access to this tenant', { status: 403 });
  }

  // 4. Pass through — user is authenticated and authorized for this tenant
  const response = NextResponse.next();
  // Inject user context into headers for downstream Server Components
  response.headers.set('x-user-id', session.globalUserId);
  response.headers.set('x-tenant-id', session.tenantId);
  response.headers.set('x-user-roles', session.roles.join(','));

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
