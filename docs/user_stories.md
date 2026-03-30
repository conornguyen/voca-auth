# User Stories & Requirements

## 1. Epic Summary
**Voca Auth** serves as the Centralized Identity Provider (IdP) and single sign-on security gatekeeper for the entire Voca SaaS ecosystem. It is responsible for multi-tenant onboarding, tenant resolution, role-based access control (RBAC), and issuing state-less cross-subdomain session cookies (`*.domain.com`) to pre-authorize users for downstream microservices.

---

## 2. User Stories & Acceptance Criteria

### Feature Area: Tenant Onboarding & Setup

**US 1.1: Workspace Creation & Subdomain Assignment**
*As a Tenant Owner (Platform Customer), I want to create a new workspace and choose a dedicated subdomain (e.g., `mybusiness.voca.com`), so that my business has a unique, fully isolated web presence.*
- **Acceptance Criteria**:
  - The system must validate the subdomain isn't already taken (checking the `Tenants` table).
  - A new entry is created in the PostgreSQL `Tenants` table.
  - The creator is assigned the `Owner` role, linking their `user_id` and the new `tenant_id` in the `Tenant_Users` M2M table.
- **Edge Cases**: Prevent reserved subdomains (e.g., `admin`, `api`, `auth`, `app`). Gracefully handle concurrent claiming of the same subdomain at the same millisecond.

### Feature Area: SSO Login via Firebase

**US 2.1: Unified Client-Side Authentication**
*As an End User (Staff or Customer), I want to authenticate via Firebase Auth in the generic gateway, so that I can access the platform securely.*
- **Acceptance Criteria**:
  - Login form supports Email/Password (and optionally Google OAuth) via Firebase client tools.
  - Upon successful Firebase login on the client, the client securely POSTs the Firebase Client JWT to the backend `/api/auth/session` endpoint.
- **Edge Cases**: Handle invalid credentials, disabled Firebase accounts, or network timeout on the Firebase provider end.

### Feature Area: Session Minting & Context Injection

**US 3.1: Wildcard Auth Cookie Generation**
*As a Downstream Microservice, I want the authentication gateway to mint a secure wildcard cookie post-login, so that subsequent requests to any `.voca.com` subdomain are pre-authorized statelessly without querying the central user database.*
- **Acceptance Criteria**:
  - The Next.js API uses the Firebase Admin SDK to strictly verify the incoming Firebase Client JWT.
  - The API queries the `Tenant_Users` table to retrieve all roles associated with the requested user.
  - The API algorithmically signs a Custom Session JWT embedding `(global_user_id, roles)` and issues a `Set-Cookie` header (`Domain=*.voca.com`, `HttpOnly=true`, `Secure=true`, `SameSite=Lax`).
- **Edge Cases**: Malformed incoming Firebase JWT. User exists in Firebase but has absolutely no database roles anywhere (trigger system to prompt onboarding journey).

**US 3.2: Edge Subdomain Interception**
*As a Tenant Workspace, I want Edge Middleware to intercept incoming traffic to my subdomain, so that unauthenticated users are seamlessly blocked.*
- **Acceptance Criteria**:
  - Read `Host` header (e.g., `tenant-slug.voca.com`).
  - Read wildcard session cookie.
  - Verify that the decoded user session contains a role explicitly for `tenant-slug`. If missing, redirect to the main centralized Auth portal.

### Feature Area: Event Brokering

**US 4.1: Cross-Service Provisioning Triggers**
*As a Downstream Microservice (like the Booking Engine), I want to receive Pub/Sub events from Voca Auth, so that I can automatically instantiate business data in my own silo when new tenants arrive.*
- **Acceptance Criteria**:
  - Emit a `TenantCreated` payload containing `{ tenant_id, slug, owner_uid }` upon successful workspace creation.
  - Emit a `UserProvisioned` payload when new roles are assigned.
- **Edge Cases**: Pub/Sub topic isn't perfectly reachable. Data schema versions change.
