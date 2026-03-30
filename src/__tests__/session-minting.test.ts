import { POST } from '../app/api/auth/session/route';
import { verifyFirebaseToken } from '../lib/firebase-admin';
import { mintSessionJwt } from '../lib/session';
import { db } from '../db';

// Mock all external dependencies
jest.mock('../lib/firebase-admin');
jest.mock('../lib/session');
jest.mock('../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

// Helper to build a fake NextRequest
function createMockRequest(body: object): any {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/auth/session – Session Minting', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Test 1: Reject invalid Firebase JWTs ───────────────────────
  it('should return 401 if the Firebase token is invalid', async () => {
    (verifyFirebaseToken as jest.Mock).mockRejectedValue(
      new Error('Firebase ID token has been revoked')
    );

    const req = createMockRequest({ idToken: 'INVALID_TOKEN_ABC' });
    const response = await POST(req);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/invalid|revoked|unauthorized/i);
  });

  // ─── Test 2: Reject if user has no DB records ──────────────────
  it('should return 403 if the Firebase user has no matching database roles', async () => {
    (verifyFirebaseToken as jest.Mock).mockResolvedValue({
      uid: 'FIREBASE_UID_123',
      email: 'ghost@nowhere.com',
    });

    // DB returns empty — user exists in Firebase but has zero roles
    (db.where as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest({ idToken: 'VALID_FIREBASE_TOKEN' });
    const response = await POST(req);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toMatch(/no roles|not provisioned|forbidden/i);
  });

  // ─── Test 3: Verify Set-Cookie with wildcard domain ────────────
  it('should return Set-Cookie with Domain= on success', async () => {
    (verifyFirebaseToken as jest.Mock).mockResolvedValue({
      uid: 'FIREBASE_UID_123',
      email: 'owner@mybiz.com',
    });

    // DB returns a valid role mapping (now includes tenants join)
    (db.where as jest.Mock).mockResolvedValue([
      {
        users: { id: 'user_uuid_1', firebaseUid: 'FIREBASE_UID_123', email: 'owner@mybiz.com' },
        tenant_users: { tenantId: 'tenant_uuid_1', role: 'Owner' },
        tenants: { id: 'tenant_uuid_1', slug: 'mybiz' },
      },
    ]);

    (mintSessionJwt as jest.Mock).mockResolvedValue('signed.jwt.token');

    const req = createMockRequest({ idToken: 'VALID_FIREBASE_TOKEN' });
    const response = await POST(req);

    expect(response.status).toBe(200);

    // Verify the Set-Cookie header exists and contains the wildcard domain
    const setCookie = response.headers.get('Set-Cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie).toMatch(/session=/);
    expect(setCookie).toMatch(/Domain=/);
    expect(setCookie).toMatch(/HttpOnly/);
  });

});
