# Development Task List (SDLC Breakdown)

This document breaks down the User Stories into a strict SDLC 2.0 checklist.
Phase Markers: `[RED]` = Test writing, `[GREEN]` = Feature coding, `[REFACTOR]` = Architecture optimization.

---

## Epic 1: Centralized Identity Service

### US 1.1 Workspace Creation & Subdomain Assignment

- [x] **Task 1: Setup Drizzle Schema and DB Migrations** *(Phase: GREEN)* - [Skill: `db`]
  - Define `Tenants`, `Users`, and `Tenant_Users` schemas in Drizzle following the architecture doc. 
  - Ensure all tables except `Tenants` include `tenant_id` to obey the strict data isolation rule.
- [x] **Task 2: Write Failing Tests for Subdomain Registration** *(Phase: RED)* - [Skill: `qa`]
  - Write Jest tests ensuring subdomain collision fails (HTTP 409).
  - Write tests ensuring the `Owner` role is correctly mapped to the `Tenant_Users` relationship when a workspace is perfectly created.
- [x] **Task 3: Implement Tenant Provisioning API / Server Action** *(Phase: GREEN)* - [Skill: `nextjs-dev` & `db`]
  - Write `createWorkspace(slug, name)` Server Action to satisfy the RED phase tests. Use DB transactions to ensure atomic commits across `Tenants` and `Tenant_Users`.
- [x] **Task 4: Optimize Query / Add Zod Validation** *(Phase: REFACTOR)* - [Skill: `pm` / `plan`]
  - Apply robust Zod schema validation on incoming action inputs (regex validation for the `slug`).

### US 2.1 & 3.1: SSO Login & Wildcard Auth Cookie Generation

- [x] **Task 5: Write Failing Tests for Session Minting** *(Phase: RED)* - [Skill: `qa`]
  - Unit test: Reject invalid Firebase JWTs using a mocked Admin SDK.
  - Unit test: Reject perfectly valid Firebase JWT if the user has no matching `Users` DB records.
  - Integration test: Verify the returned HTTP response contains exactly `Set-Cookie` matching the `*.domain.com` attribute.
- [x] **Task 6: Implement `/api/auth/session` Route** *(Phase: GREEN)* - [Skill: `auth` & `nextjs-dev`]
  - Accept Firebase JWT. Verify cryptographically with Firebase Admin SDK.
  - Query DB for roles. 
  - Construct the new Custom Session JWT payload (`global_user_id`, `roles`). Issue the wildcard HTTP-only cookie.
- [x] **Task 7: Write Failing Tests for Edge Interception** *(Phase: RED)* - [Skill: `qa`]
  - Assert that attempting to route to `tenant-slug.voca.com` without a session cookie redirects to Auth portal.
  - Assert that a cookie without `tenant-slug` in its roles array gets rejected (403 Forbidden).
- [x] **Task 8: Write Edge Middleware for Tenant Resolution** *(Phase: GREEN)* - [Skill: `auth` & `nextjs-dev`]
  - Create `middleware.ts` to decode the wildcard cookie on edge requests, assert Role-matching against `Host` headers.
- [x] **Task 9: Clean Code & Secret Management Verification** *(Phase: REFACTOR)* - [Skill: `infra`]
  - Ensure Firebase Service Account arrays and custom JWT Minting secrets are loaded safely from Environment Variables.

### US 4.1: Event Brokering (Pub/Sub)

- [x] **Task 10: Write Failing Tests for Pub/Sub Emission** *(Phase: RED)* - [Skill: `qa`]
  - Mock the GCP Pub/Sub client. Spy on the Emitter to verify `TenantCreated` is called exactly once with the correct payload during `createWorkspace()`.
- [x] **Task 11: Implement Google Cloud Pub/Sub Client Abstraction** *(Phase: GREEN)* - [Skill: `infra`]
  - Implement abstraction wrapping `@google-cloud/pubsub`. 
  - Wire it inside the `createWorkspace` completion lifecycle.
- [x] **Task 12: Network Resilience / Retry Logic** *(Phase: REFACTOR)* - [Skill: `infra`]
  - Opt into an Outbox pattern or add robust try-catch blocks ensuring PubSub publisher network failures do not arbitrarily roll back the Database transaction if the tenant was already successfully inserted.
