---
description: Architect — Design a feature and produce technical contracts
---

## Architect Design Workflow

Use this workflow before any non-trivial feature begins development to establish a clear technical contract.

1. **Read the user story** — Understand the persona, action, and AC from the BA artifact.

2. **Assess impacted system boundaries** — Map the request against `docs/architecture.md §2` (component data flow):
   - Client UI → Firebase → Auth Server → DB → Pub/Sub

3. **Design or update the data model** — If schema changes are needed, define them in `docs/architecture.md §3`:
   - Table / column names
   - FK constraints
   - Enum additions (e.g., new RBAC role)
   - Required Drizzle migration

4. **Define the JWT / Cookie contract** — If session structure changes, update:
   - Wildcard cookie payload: `{ global_user_id, tenant_id, roles }`
   - `Domain=*.domain.com; HttpOnly; Secure; SameSite=Lax`

5. **Specify Pub/Sub event schema** — For lifecycle actions (`TenantCreated`, `UserProvisioned`), define:
   - Event name (snake_case)
   - Payload fields
   - Consumer expectations (downstream microservices)

6. **Write or update an ADR** — If a significant decision is made, document it in `docs/adr/` with:
   - Context, Decision, Consequences

7. **Security checklist** — Before handing off, verify with `docs/architecture.md §5`:
   - `WHERE tenant_id = ?` enforced on all queries
   - Secrets in GCP Secret Manager only
   - Edge Middleware assertion logic is sound

8. **Hand off to Dev** — Tag story `[status: ready-for-dev]` and link the updated architecture doc.
