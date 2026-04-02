---
description: QA — Validate a story against its Acceptance Criteria before release
---

## QA Validation Workflow

Run this workflow on every story tagged `[status: ready-for-qa]` before it can be marked `[status: done]`.

### 1. Setup

1. Pull the feature branch and run the dev environment:
   ```bash
   git checkout <feature-branch>
   pnpm install
   pnpm dev
   ```

2. Confirm the test suite is green:
   ```bash
   pnpm test
   ```

### 2. Acceptance Criteria Verification

3. Walk through each AC item from the story definition.
4. For each AC item, record: ✅ Pass / ❌ Fail / ⚠️ Partial.

### 3. RBAC Role Testing

5. Test the feature against all relevant roles defined in `docs/rbac_roles_and_skills.md`:
   - `Admin` — can perform the action globally
   - `Owner` — can perform the action within their tenant
   - `Manager` — check if elevated access is correct
   - `Staff` — confirm restricted access is enforced
   - `Customer` — confirm minimal access is enforced

6. Attempt cross-role access (e.g., Staff trying an Owner-only action) — must be rejected.

### 4. Multi-Tenant Isolation Testing

7. Create two test tenants: `tenant-a` and `tenant-b`.
8. Authenticate as a user of `tenant-a` and attempt to access `tenant-b` data — must return `403`.
9. Verify the wildcard cookie contains the correct `tenant_id` for the authenticated session.

### 5. SSO Flow Testing

10. Test the full login → session mint → subdomain redirect flow end-to-end.
11. Verify the cookie is set with correct attributes (`HttpOnly`, `Secure`, correct `Domain`).
12. Verify that Edge Middleware rejects an expired or tampered cookie.

### 6. Event Verification (if applicable)

13. If the story emits a Pub/Sub event, verify via GCP Console or logs that:
    - The correct event type is published (e.g., `TenantCreated`)
    - The payload contains the required fields and no sensitive data

### 7. Sign-off

- All AC: ✅ → Tag `[status: done]`, notify PM
- Any AC: ❌ → Tag `[status: qa-failed]`, file a bug with reproduction steps, return to Dev
