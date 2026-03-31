import { NextRequest, NextResponse } from 'next/server';
import { validateRedirectUrl } from '@/lib/redirect-validation';

/**
 * GET /api/auth/validate-redirect?url=<encoded_url>
 *
 * Validates a redirect URL against the DB-backed domain whitelist.
 * Returns { valid: boolean, url: string }
 */
export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ valid: false, url: '' }, { status: 400 });
  }

  const result = await validateRedirectUrl(rawUrl);
  return NextResponse.json(result);
}
