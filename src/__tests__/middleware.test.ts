import { middleware } from '../middleware';
import { verifySessionJwt } from '../lib/session';

jest.mock('../lib/session');

// Helper to create a fake NextRequest with Host header and optional cookie
function createMockRequest(host: string, sessionCookie?: string): any {
  const headers = new Map([['host', host]]);
  const cookies = {
    get: jest.fn().mockReturnValue(
      sessionCookie ? { value: sessionCookie } : undefined
    ),
  };
  return {
    headers,
    cookies,
    url: `https://${host}/dashboard`,
    nextUrl: { pathname: '/dashboard' },
  };
}

describe('Edge Middleware – Tenant Resolution', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Test 1: No cookie → redirect to auth portal ─────────────
  it('should redirect to auth portal when no session cookie is present', async () => {
    const req = createMockRequest('mybiz.voca.com');
    const response = await middleware(req);

    expect(response.status).toBe(307); // Temporary redirect
    expect(response.headers.get('location')).toMatch(/auth\.voca\.com|\/login/);
  });

  // ─── Test 2: Cookie without matching tenant role → 403 ───────
  it('should return 403 when the user has no role for the requested tenant', async () => {
    (verifySessionJwt as jest.Mock).mockResolvedValue({
      globalUserId: 'user_1',
      tenantId: 'tenant_other',
      roles: ['Staff'],
    });

    const req = createMockRequest('mybiz.voca.com', 'valid.jwt.token');
    const response = await middleware(req);

    // The user's session is for tenant_other, not mybiz
    expect(response.status).toBe(403);
  });

  // ─── Test 3: Valid cookie with matching tenant → pass through ─
  it('should allow the request through when the session matches the tenant', async () => {
    (verifySessionJwt as jest.Mock).mockResolvedValue({
      globalUserId: 'user_1',
      tenantId: 'tenant_mybiz',
      tenantSlug: 'mybiz',
      roles: ['Owner'],
    });

    const req = createMockRequest('mybiz.voca.com', 'valid.jwt.token');
    const response = await middleware(req);

    // NextResponse.next() returns 200
    expect(response.status).toBe(200);
  });

});
