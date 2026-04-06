# Next.js SSO Integration Guide

This guide explains how to onboard a new Next.js service to use `voca-auth` as the centralized Identity Provider (IdP) for Single Sign-On (SSO).

## 1. How Voca SSO Works

`voca-auth` handles all user authentication flows (login, signup, password reset). Upon successful authentication, it generates a JWT containing the user's localized workspace data and sets it as an HTTP-only Wildcard Cookie named `session` (e.g., `Domain=*.voca.com`).

Because the cookie is a wildcard, any downstream Next.js application residing on a subdomain (like `docs.voca.com` or `app.voca.com`) will automatically receive this `session` cookie on every request.

### The JWT Payload
The decoded session JWT contains the following structure:
```ts
interface SessionPayload {
  globalUserId: string; // The central Firebase User ID
  tenantId: string;     // The UUID of the specific tenant/workspace
  tenantSlug: string;   // The subdomain prefix (e.g., "acme" for acme.voca.com)
  roles: string[];      // RBAC roles the user holds in this tenant
}
```

---

## 2. Integration Steps for New Services

To protect routes in your downstream Next.js service, you need to intercept incoming requests, read the session cookie, verify the JWT, and enforce tenant boundaries. 

### Step A: Manage Environment Variables
Your downstream service will need the identical JWT secret used by `voca-auth` to verify the token signature.

1. Inject `JWT_SECRET` into your new application's environment.
2. In production, ensure both `voca-auth` and your new service fetch this secret from zero-trust infrastructure (e.g., Google Cloud Secret Manager).

### Step B: Next.js Edge Middleware
Create a Next.js Edge Middleware in your downstream repository (`src/middleware.ts`) to act as the gatekeeper.

*Note: Since standard `jsonwebtoken` does not run in the Next.js Edge Runtime, you should use a lightweight library like `jose`, or ensure your middleware environment is compatible.*

```ts
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Use 'jose' to decode JWTs safely in the Edge Runtime
import { jwtVerify } from 'jose';

const AUTH_PORTAL = process.env.AUTH_PORTAL_URL || 'https://auth.voca.com/login';
const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'voca.com';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production');

const PUBLIC_PATHS = ['/login', '/public', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // 1. Bypass auth for public routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Validate the session cookie
  const sessionCookie = request.cookies.get('session');
  if (!sessionCookie?.value) {
    // Redirect unauthenticated users back to the auth portal
    const redirectUrl = encodeURIComponent(`https://${host}${pathname}`);
    return NextResponse.redirect(`${AUTH_PORTAL}?redirectUrl=${redirectUrl}`, { status: 307 });
  }

  try {
    // 3. Verify JWT using jose
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
    const session = payload as any; 

    // 4. (Optional) Enforce Tenant Boudaries if your app is multi-tenant aware
    const tenantSlug = host.replace(`.${ROOT_DOMAIN}`, '').split(':')[0];
    if (session.tenantSlug !== tenantSlug) {
       return new NextResponse('Forbidden: Tenant Mismatch', { status: 403 });
    }

    // 5. Inject session variables into request headers for downstream Server Components
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.globalUserId);
    response.headers.set('x-tenant-id', session.tenantId);
    response.headers.set('x-user-roles', session.roles.join(','));

    return response;
  } catch (error) {
    // Token is invalid/expired
    return NextResponse.redirect(AUTH_PORTAL, { status: 307 });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|favicon.ico).*)'],
};
```

### Step C: Reading Headers in Server Components
Once the middleware intercepts the request and injects the downstream headers, you can read the user's identity securely within your React Server Components without decoding the JWT again.

```tsx
// src/app/page.tsx
import { headers } from 'next/headers';

export default async function ProtectedPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const tenantId = headersList.get('x-tenant-id');
  const roles = headersList.get('x-user-roles')?.split(',') || [];

  return (
    <main>
      <h1>Protected Dashboard</h1>
      <pre>User ID: {userId}</pre>
      <pre>Tenant ID: {tenantId}</pre>
      <pre>Roles: {roles.join(', ')}</pre>
    </main>
  );
}
```

## 3. Redirect Allowlisting
If your application needs users to automatically redirect *back* to the downstream service after `voca-auth` handles the login interface (using a `?redirectUrl=` parameter), ensure the downstream domain is explicitly approved by `voca-auth`. 

`voca-auth` protects against Open Redirect attacks via the `allowedRedirectDomains` table mapped in its database connection. Your new application's subdomain MUST be whitelisted (or fall under a whitelisted wildcard behavior) for the redirect to function smoothly.

## 4. Local Development
During local testing, cookies map differently because `localhost` does not support wildcards without a proxy setup. Next.js downstream applications should be tested alongside `voca-auth` using tools like `caddy`, `ngrok`, or manually spoofing hosts in your local machine's `/etc/hosts` file (e.g. `127.0.0.1 acme.localvoca.com`). Ensure both apps run on matching base domains to share the `session` cookie properly.
