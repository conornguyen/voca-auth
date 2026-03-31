/**
 * Task 19 [RED Phase] — Redirect URL Validation Tests
 *
 * Tests the validateRedirectUrl() utility against:
 *  - *.voca.com subdomains (always allowed)
 *  - Domains stored in the `allowed_redirect_domains` DB table
 *  - Open redirect attack attempts (must be rejected)
 */
import { validateRedirectUrl } from '../lib/redirect-validation';

// Mock the DB query that fetches allowed domains
// Implementation calls: db.select().from(allowedRedirectDomains)
jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockResolvedValue([
        { domain: 'partner-app.com' },
        { domain: 'booking.example.io' },
      ]),
    }),
  },
}));

jest.mock('@/db/schema', () => ({
  allowedRedirectDomains: 'allowed_redirect_domains',
}));

describe('validateRedirectUrl', () => {
  // ─── Happy paths ────────────────────────────────────────────

  it('should allow any *.voca.com subdomain', async () => {
    const result = await validateRedirectUrl('https://acme.voca.com/dashboard');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://acme.voca.com/dashboard');
  });

  it('should allow the root voca.com domain', async () => {
    const result = await validateRedirectUrl('https://voca.com/home');
    expect(result.valid).toBe(true);
  });

  it('should allow a domain from the DB whitelist', async () => {
    const result = await validateRedirectUrl('https://partner-app.com/callback');
    expect(result.valid).toBe(true);
  });

  it('should allow a subdomain of a whitelisted domain', async () => {
    const result = await validateRedirectUrl('https://app.booking.example.io/login');
    expect(result.valid).toBe(true);
  });

  // ─── Rejection cases (Open Redirect attacks) ───────────────

  it('should reject domains not in whitelist or *.voca.com', async () => {
    const result = await validateRedirectUrl('https://evil-phishing.com/steal');
    expect(result.valid).toBe(false);
  });

  it('should reject javascript: protocol URLs', async () => {
    const result = await validateRedirectUrl('javascript:alert(1)');
    expect(result.valid).toBe(false);
  });

  it('should reject data: protocol URLs', async () => {
    const result = await validateRedirectUrl('data:text/html,<script>alert(1)</script>');
    expect(result.valid).toBe(false);
  });

  it('should reject empty or malformed URLs', async () => {
    const result = await validateRedirectUrl('');
    expect(result.valid).toBe(false);
  });

  it('should reject domains that look like voca.com but are not (e.g., notvoca.com)', async () => {
    const result = await validateRedirectUrl('https://notvoca.com/trick');
    expect(result.valid).toBe(false);
  });
});
