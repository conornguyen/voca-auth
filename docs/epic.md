# Epic: Centralized Authentication & SSO Gateway (Voca Auth)

## 1. Executive Summary
The **Voca Auth** repository serves as the Identity Provider (IdP) and root security gateway for the entire Voca SaaS ecosystem. Its primary function is to decouple authentication, tenant resolution, and Role-Based Access Control (RBAC) into an independent microservice. It manages user onboarding, workspace provisioning, and session minting, establishing the underlying trust and context (`tenant_id`) necessary for all downstream microservices (such as the Booking Engine).

## 2. User Personas & Stories
- **Tenant Owner (Platform Customer)**: As a business owner, I want to sign up for a Voca workspace, choose a dedicated subdomain (e.g., `mybusiness.voca.com`), and automatically be assigned the "Owner" role so I can securely manage my staff and schedules.
- **Tenant Staff / Manager**: As an employee, I want to log into my business's portal using a unified login gateway and have my specific permissions correctly identified, so I can access the tools relevant to my role.
- **End Customer**: As a client, I want to authenticate smoothly against a particular business's subdomain without creating conflicting accounts across the Voca network.
- **Downstream Microservice**: As an integrated service, I want to receive real-time Pub/Sub events regarding new tenants and users, and trust incoming wildcard cookies, so I can process requests securely.

## 3. Acceptance Criteria (Definition of Done)
- **Tenant Onboarding Hub**: Users must be able to create a new workspace, creating entries in the `Tenants` table and assigning the user an `Owner` role in `Tenant_Users`.
- **SSO Login & Registration**: Client-side authentication must be driven entirely by Firebase Authentication.
- **Cross-Domain Session Minting**: Post-Firebase validation, the server must verify the JWT via the Admin SDK, retrieve role details from the database, and issue a secure, HttpOnly wildcard cookie (`Domain=*.domain.com`) containing `[global_user_id, tenant_id, roles]`.
- **Edge Tenant Resolution**: Next.js Middleware must capture the requested hostname/subdomain, compare it against the session cookie, and securely inject tenant context or reject unauthorized access.
- **Event Brokering**: Core lifecycle actions must trigger Google Cloud Pub/Sub events (e.g., `TenantCreated`, `UserProvisioned`).

## 4. Non-Functional Requirements
- **Strict Data Isolation**: No bleeding of data between tenants. All queries must utilize a `tenant_id` or PostgreSQL Row-Level Security.
- **Scale-to-Zero**: Architecture optimized for Google Cloud Run (serverless).
- **Stateless Authorization**: JWT cookies remove the need for downstream database lookups on every request, reducing latency and DB bottlenecks.
