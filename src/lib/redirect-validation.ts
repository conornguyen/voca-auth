import { db } from '@/db';
import { allowedRedirectDomains } from '@/db/schema';

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'voca.com';

/**
 * Fetch the list of allowed redirect domains from the database.
 * Always includes the ROOT_DOMAIN (e.g., voca.com) as a hardcoded baseline.
 */
async function getAllowedDomains(): Promise<string[]> {
  const rows = await db.select().from(allowedRedirectDomains);
  const domains = rows.map((r) => r.domain);

  if (!domains.includes(ROOT_DOMAIN)) {
    domains.push(ROOT_DOMAIN);
  }

  return domains;
}

/**
 * Check if a hostname matches one of the allowed domains.
 * Supports exact matches and wildcard subdomain matches.
 * e.g., "acme.voca.com" matches the allowed domain "voca.com"
 */
function isAllowedDomain(hostname: string, allowedDomains: string[]): boolean {
  const lower = hostname.toLowerCase();

  for (const domain of allowedDomains) {
    const d = domain.toLowerCase();
    if (lower === d) return true;
    if (lower.endsWith(`.${d}`)) return true;
  }

  return false;
}

/**
 * Validates a redirect URL against the DB-backed domain whitelist.
 * Returns { valid, url } to prevent Open Redirect attacks.
 */
export async function validateRedirectUrl(
  rawUrl: string
): Promise<{ valid: boolean; url: string }> {
  if (!rawUrl) {
    return { valid: false, url: '' };
  }

  try {
    const parsed = new URL(rawUrl);

    // Only allow http/https protocols
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, url: '' };
    }

    const allowedDomains = await getAllowedDomains();

    if (!isAllowedDomain(parsed.hostname, allowedDomains)) {
      return { valid: false, url: '' };
    }

    return { valid: true, url: parsed.toString() };
  } catch {
    return { valid: false, url: '' };
  }
}
