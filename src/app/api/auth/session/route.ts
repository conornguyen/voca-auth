import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { mintSessionJwt } from '@/lib/session';
import { db } from '@/db';
import { users, tenantUsers, tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.voca.com';

/**
 * POST /api/auth/session
 * 
 * Accepts a Firebase ID token, verifies it, looks up the user's roles,
 * mints a custom session JWT, and sets it as a wildcard HttpOnly cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    // 1. Verify Firebase token via Admin SDK
    let firebaseUser;
    try {
      firebaseUser = await verifyFirebaseToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or revoked Firebase token' },
        { status: 401 }
      );
    }

    // 2. Look up user roles in our DB by firebase_uid (join tenants for slug)
    const userRoles = await db
      .select()
      .from(users)
      .innerJoin(tenantUsers, eq(users.id, tenantUsers.userId))
      .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
      .where(eq(users.firebaseUid, firebaseUser.uid));

    if (userRoles.length === 0) {
      return NextResponse.json(
        { error: 'Forbidden: User has no roles provisioned in any tenant' },
        { status: 403 }
      );
    }

    // 3. Mint custom session JWT with first tenant context
    const firstMapping = userRoles[0];
    const sessionToken = await mintSessionJwt({
      globalUserId: firstMapping.users.id,
      tenantId: firstMapping.tenant_users.tenantId,
      tenantSlug: firstMapping.tenants.slug,
      roles: userRoles.map((r) => r.tenant_users.role),
    });

    // 4. Build response with wildcard Set-Cookie
    const response = NextResponse.json({ success: true });
    response.headers.set(
      'Set-Cookie',
      `session=${sessionToken}; Domain=${COOKIE_DOMAIN}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    console.error('Session minting error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
