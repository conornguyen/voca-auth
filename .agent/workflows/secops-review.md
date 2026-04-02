---
description: SecOps — Perform a security review before merge or deploy
---

## SecOps Security Review Workflow

Run this checklist on every PR that touches auth logic, session handling, DB queries, or infrastructure.

### 1. JWT & Cookie Audit

- [ ] Wildcard cookie is set with `HttpOnly; Secure; SameSite=Lax; Domain=*.domain.com`
- [ ] JWT payload contains only: `global_user_id`, `tenant_id`, `roles` — no PII
- [ ] JWT expiry is explicitly set and is reasonable (e.g., 7 days max)
- [ ] Firebase Admin SDK `verifyIdToken()` is called server-side — never trusted client-side

### 2. Data Isolation Audit

- [ ] Every `SELECT`, `UPDATE`, `DELETE` query includes `WHERE tenant_id = ?`
- [ ] No raw SQL string interpolation — all values are parameterized via Drizzle ORM
- [ ] Cross-tenant access attempt returns `403`, not `404` or `500`

### 3. Secrets Management Audit

- [ ] No secrets, API keys, or signing keys are hardcoded or committed to the repo
- [ ] All secrets are loaded at runtime from GCP Secret Manager via environment variables
- [ ] `.env.example` does not contain real values

### 4. Edge Middleware Audit

- [ ] Middleware correctly extracts and decodes the wildcard cookie
- [ ] `tenant_id` from cookie is compared against the `Host` header subdomain slug
- [ ] Unauthorized requests are rejected with a redirect to login — not silently passed through
- [ ] Middleware does NOT run on public routes (`/login`, `/signup`, `/api/auth/session`)

### 5. Pub/Sub Event Audit

- [ ] Published event payloads do not include sensitive fields (passwords, raw JWTs)
- [ ] Downstream consumers verify the event source (GCP IAM-authenticated push subscriptions)

### 6. Sign-off

- Approved: tag PR `[security: approved]`
- Rejected: tag PR `[security: changes-required]` and leave inline comments on exact lines
