# User Story: Workspace Provisioning (Tenant Onboarding)

**Label:** `[status: ready-for-grooming]`

## 1. Persona
**Tenant Owner (Owner)**
*Reference:* `docs/rbac_roles_and_skills.md`

## 2. User Story
**As a** Tenant Owner,
**I want to** sign up for a Voca workspace and choose a dedicated subdomain (e.g., `mybusiness.voca.com`),
**so that** I am automatically assigned the "Owner" role and can securely manage my staff and schedules.

## 3. Acceptance Criteria (Definition of Done)
1. **Workspace Creation:** When a legitimate user submits the signup form with a valid and available subdomain, a new tenant record is successfully inserted into the `Tenants` table.
2. **Role Assignment:** A corresponding user record must be created in the `Tenant_Users` table and assigned the `Owner` role automatically.
3. **Validation & Uniqueness:** The system must reject the workspace creation and return a user-friendly error if the requested subdomain is already registered or invalid.
4. **Immediate Redirection:** Upon successful creation, the system must authenticate the user, mint a wildcard session cookie, and redirect them to their dedicated subdomain.

*Reference:* `docs/epic.md §3`

## 4. Impacted System Boundaries
- **Edge Middleware:** Tenant resolution and routing for the newly created subdomain.
- **Firebase Auth:** Client-side registration of the initial user.
- **Server Action / API Route:** Backend orchestration of the workspace creation and validation.
- **Drizzle ORM / DB schema:** Database transactions to populate `Tenants` and `Tenant_Users`.
- **GCP Pub/Sub:** Emission of asynchronous events (`TenantCreated`, `UserProvisioned`).

## 5. Data Isolation Implications
- **CRITICAL:** All queries during post-creation setup and operation MUST include `WHERE tenant_id = ?`.
- The global subdomain availability check is the only exception and must run securely at the platform level.

## 6. Non-Functional Requirements (NFRs)
- **Strict Data Isolation:** Guarantee that this new workspace has perfectly bounded context limits.
- **Stateless Authorization:** The authenticated session must use a robust JWT wildcard cookie (`Domain=*.domain.com`) containing `[global_user_id, tenant_id, roles]` to ensure zero-latency RBAC authorization downstream.
- **Scale-to-Zero:** API endpoints must start quickly and remain functional within the Google Cloud Run serverless ecosystem limits.

*Reference:* `docs/epic.md §4`
