# Architecture: Voca Auth & SSO Gateway

## 1. System Overview
Voca Auth is a Next.js 14+ (App Router) application structured as a decoupled identity microservice. It acts as the gateway connecting external Firebase authentication to internal PostgreSQL business logic and global event streaming.

## 2. Component Data Flow

```mermaid
sequenceDiagram
    participant User
    participant NextJS_Client as Client UI
    participant Firebase as Firebase Auth
    participant NextJS_Server as Auth Server (Cloud Run)
    participant DB as PostgreSQL
    participant PubSub as GCP Pub/Sub

    User->>NextJS_Client: Login / Setup Workspace
    NextJS_Client->>Firebase: Authenticate User
    Firebase-->>NextJS_Client: Return Firebase Client JWT
    NextJS_Client->>NextJS_Server: POST /api/auth/session (Firebase JWT)
    
    rect rgb(200, 220, 240)
        Note over NextJS_Server, DB: Server-Side Identity Verification
        NextJS_Server->>Firebase: Admin SDK Verify Token
        NextJS_Server->>DB: Lookup `tenant_id` & `roles`
        DB-->>NextJS_Server: Return User/Tenant Data
        NextJS_Server->>NextJS_Server: Mint Custom JWT Payload
    end

    opt First Time Setup
        NextJS_Server->>DB: Provision `Tenants` / `Tenant_Users`
        NextJS_Server->>PubSub: Emit `TenantCreated` & `UserProvisioned`
    end

    NextJS_Server-->>NextJS_Client: `Set-Cookie: session=...; Domain=*.domain.com; HttpOnly`
    NextJS_Client-->>User: Redirect to Subdomain Dashboard
```

## 3. Data Model Updates
The core schema managed within this module resides in PostgreSQL (via Drizzle ORM):

- **`Tenants`**: `id` (PK), `slug` (Unique domain prefix), `name`, `billing_plan`, `created_at`.
- **`Users`**: `id` (PK), `firebase_uid` (Unique), `email`, `full_name`.
- **`Tenant_Users`**: `user_id` (FK), `tenant_id` (FK), `role` (Enum: Admin, Owner, Manager, Staff, Customer). *This table essentially maps RBAC for the multi-tenant architecture.*
- **`Api_Keys`** (Optional extensibility): `id`, `tenant_id`, `key_hash`, `scopes`.

## 4. Middleware Boundary Contract
The Next.js Edge Middleware serves as the immediate security perimeter:
1. **Intercept** the incoming request and parse the `Host` header.
2. **Deconstruct** the `session` wildcard cookie.
3. **Assert** that the `tenant_id` or `global_user_id` mapped inside the JWT has the right to access the specified subdomain/tenant slug.
4. **Propagate** the user context down to Server Components via headers, or redirect to the login page if the session is invalid.

## 5. Security & Multi-Tenancy Checklist
> [!IMPORTANT]
> **Data Isolation Enforcement**
> - **The Golden Rule**: ALL `SELECT`, `UPDATE`, and `DELETE` queries modifying business resources MUST include a `WHERE tenant_id = ?` clause.
> - **Trust Propagation**: Because downstream microservices (like the Booking Engine) do not manage the central `Users` table, they solely rely on the cryptographic signature of the wildcard cookie minted by this system to execute logic securely safely.
> - **Secret Management**: Firebase Admin keys and JWT Minting keys must remain strictly contained within the Google Cloud Secret Manager, exposed only at runtime to the Next.js Server.
