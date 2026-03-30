# Voca Auth - Centralized SSO & Identity Gateway

This repository serves as the **Identity Provider (IdP) and Authentication Gateway** for the Voca SaaS platform. It is a dedicated microservice responsible for tenant provisioning, centralized authentication, and cross-subdomain session management.

## What This Repo Can Do (Core Capabilities)

Based on our implementation, this repository handles the following core domains:

### 1. Workspace (Tenant) Provisioning
- **Subdomain Registration & Validation:** Creates new workspaces (tenants) with unique slugs (e.g., `acme.voca.com`) and prevents collisions.
- **Database Schema & Isolation:** Stores foundational data using Drizzle ORM (`Tenants`, `Users`, `Tenant_Users`). Every user-related record is strictly isolated by `tenant_id`.
- **RBAC Initialization:** Automatically assigns the `Owner` role to the user who creates a new workspace, managed within the Postgres database.

### 2. Single Sign-On (SSO) & Session Minting
- **Firebase Authentication:** Acts as the primary gateway for client-side login flows (Login, Signup, Password Reset) and validates users via the backend using the Firebase Admin SDK.
- **Cross-Subdomain Sessions:** Mints secure, HTTP-only Wildcard Cookies (`domain=*.domain.com`) that contain custom JWTs. These custom tokens embed the user's `global_user_id`, `tenant_id`, and `roles`.
- **Edge Tenant Resolution:** Next.js Edge Middleware intercepts incoming requests, decodes the wildcard cookie, and verifies Role-Matching against the requested `Host` header to ensure unauthorized users cannot access another tenant's workspace.

### 3. Event Brokering (Pub/Sub)
- **Event-Driven Architecture:** Uses Google Cloud Pub/Sub to emit lifecycle events securely.
- **Downstream Synchronization:** When major actions occur (like `TenantCreated` during `createWorkspace`), it publishes messages to the event bus so that other decoupled microservices (like the core Booking Engine) can create localized data asynchronously.

## Core Tech Stack
- **Framework:** Next.js 14+ (App Router, Server Actions)
- **Auth:** Firebase Auth + Firebase Admin SDK
- **Database:** PostgreSQL (Google Cloud SQL) + Drizzle ORM
- **Deployment:** Google Cloud Run (Serverless)
- **Validation & Events:** Zod (Runtime validation) + GCP Pub/Sub

## Development Workflow
This repository strictly adheres to an SDLC 2.0 TDD process:
1. **[RED] Phase:** Write failing Jest tests for Edge cases and Happy paths.
2. **[GREEN] Phase:** Implement minimal logic to satisfy the tests.
3. **[REFACTOR] Phase:** Optimize architecture, security constraints (like `tenant_id` validation), and clean code principles.
