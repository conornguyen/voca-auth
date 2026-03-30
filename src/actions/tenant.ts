'use server';

import { db } from '../db';
import { tenants, tenantUsers, outboxEvents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// ─── Zod Input Validation ────────────────────────────────────────────
const RESERVED_SLUGS = ['admin', 'api', 'auth', 'app', 'www', 'mail', 'ftp', 'dashboard', 'billing', 'support'];

export const createWorkspaceSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID'),
  slug: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be at most 63 characters')
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Subdomain must be lowercase alphanumeric with optional hyphens, cannot start or end with a hyphen')
    .refine((val) => !RESERVED_SLUGS.includes(val), { message: 'This subdomain is reserved' }),
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(255, 'Workspace name must be at most 255 characters'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

// ─── Server Action ───────────────────────────────────────────────────

/**
 * Provisions a new Workspace (Tenant) with strict Zod validation.
 * Assigns the calling user as the 'Owner' role atomically.
 */
export async function createWorkspace(userId: string, slug: string, name: string) {
  // 0. Validate and sanitize all inputs via Zod before touching the DB
  const parsed = createWorkspaceSchema.parse({ userId, slug, name });

  // Use a transaction to guarantee atomicity across collision check + inserts
  const result = await db.transaction(async (tx) => {

    // 1. Collision Check — query globally across all tenants
    const existing = await tx.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, parsed.slug));

    if (existing.length > 0) {
      throw new Error('409: Conflict - Subdomain taken');
    }

    // 2. Insert the Workspace
    const [newTenant] = await tx.insert(tenants).values({
      slug: parsed.slug,
      name: parsed.name,
    }).returning();

    // 3. Bind the creator as 'Owner' — prevents orphaned tenants
    const [newRole] = await tx.insert(tenantUsers).values({
      userId: parsed.userId,
      tenantId: newTenant.id,
      role: 'Owner',
    }).returning();

    // 4. Implement Transactional Outbox pattern
    await tx.insert(outboxEvents).values({
      eventName: 'TenantCreated',
      payload: {
        tenant: newTenant,
        userId: parsed.userId,
      },
      status: 'pending',
    });

    return {
      tenant: newTenant,
      role: newRole.role,
    };
  });

  return result;
}
