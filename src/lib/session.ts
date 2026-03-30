import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

export interface SessionPayload {
  globalUserId: string;
  tenantId: string;
  tenantSlug: string;
  roles: string[];
}

/**
 * Signs a custom session JWT containing the user's identity and RBAC context.
 */
export async function mintSessionJwt(payload: SessionPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verifies and decodes a session JWT.
 */
export async function verifySessionJwt(token: string): Promise<SessionPayload> {
  return jwt.verify(token, JWT_SECRET) as SessionPayload;
}
