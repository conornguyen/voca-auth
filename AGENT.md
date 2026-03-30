# GEMINI.md - AI CONTEXT & INSTRUCTION ALIGNMENT
**Project:** Voca Centralized Authentication & SSO Gateway
**Architecture:** Decoupled Multi-tenant, Micro-services Ready, SSO Integrated.

*Note for AI Assistant: Please read this entire file carefully before fulfilling any user request to write code, write tests, or design system architecture. Make sure to consult the "AI Skill Routing Matrix" below to load the appropriate specialized `.agents/skills/...` files before proposing solutions.*

---

## 1. TECH STACK & INFRASTRUCTURE
- **Package Manager:** pnpm (CRITICAL: Do not use npm or yarn).
- **Frontend / Main Backend:** Next.js 14+ (App Router).
- **Authentication:** Firebase Authentication (SSO Repo).
- **Database:** PostgreSQL (Google Cloud SQL) using a Shared Schema architecture.
- **ORM:** Drizzle ORM (Preferred over Prisma based on BRD).
- **Deployment:** Google Cloud Run (Serverless, Scale-to-zero).
- **Validation:** Zod (Runtime validation).
- **Testing:** Jest / Vitest (for Unit/Integration Tests).
- **Event Bus:** Google Cloud Pub/Sub (Event-Driven).

---

## 2. MULTI-TENANCY & SECURITY CONSTRAINTS (CRITICAL)
**This is the foundation of the system. Do NOT violate these rules:**
1. **Data Isolation:** All Database tables (except the `Tenants` table) **MUST** include a `tenant_id` column. Any generated `SELECT`, `UPDATE`, or `DELETE` query MUST include a `WHERE tenant_id = ?` condition (or rely on properly configured Row-Level Security (RLS) in PostgreSQL).
2. **Subdomain Resolution:** Use Next.js Middleware to capture the hostname (e.g., `tenant-slug.domain.com`), then query Tenant Metadata/`tenant_id` from Cache/DB.
3. **Stateless Auth:** Authentication is handled via JWTs returned from Firebase Auth. The JWT MUST contain `global_user_id`, `tenant_id`, and `roles`. Sessions are shared via Wildcard Cookies (`*.domain.com`).
4. **RBAC (Role-Based Access Control):** Permissions are assigned based on the tuple `(user_id, tenant_id, role)`. (Roles: Admin, Owner, Manager, Staff, Customer).

---

## 3. CORE BUSINESS LOGIC
1. **Centralized Identity Management:** This repository strictly handles the Firebase SSO Login, Signup, and Reset Password journeys. It acts as the gatekeeper for all other microservices.
2. **Tenant Resolution at the Edge:** The hostname (`tenant.domain.com`) or initial login request dictates the `tenant_id`.
3. **Session Minting:** Upon successful Firebase Client validation, the Server uses the Admin SDK to verify the token, looks up the DB for Roles/`tenant_id`, and sets a secure `*.domain.com` wildcard cookie containing the custom JWT.
4. **Tenant Onboarding Hub:** Contains the administrative logic required for setting up a brand new workspace (Tenant) and assigning the first user as 'Owner'.
5. **Event Emission:** Triggers Pub/Sub events (e.g., `TenantCreated`, `UserProvisioned`) so other downstream repositories (like the Booking Engine) can create localized data.

---

## 4. SDLC 2.0 (AI-DRIVEN TDD - FAIL FIRST)
The AI Assistant must strictly follow the 3-step workflow when asked to code a new Module. Never write logic code directly without writing tests first (unless explicitly instructed otherwise by the user).

- **Step 1: RED PHASE (Write failing tests first)**
  - AI acts as the **QA/Test Agent**. 
  - Read the requirements and write Unit/Integration Tests (using Jest) covering Happy Paths and Edge Cases (e.g., double-booking, missing `tenant_id`, booking outside operating hours).
  - Expected result: Tests run and FAIL (because the logic doesn't exist yet).
  
- **Step 2: GREEN PHASE (Write minimal code)**
  - AI acts as the **Coder Agent**.
  - Write *just enough* logic code to PASS the tests defined in Step 1. 
  - Do not over-engineer or optimize early.
  
- **Step 3: REFACTOR PHASE (Optimize)**
  - AI acts as the **Architect Agent**.
  - Optimize the newly written code: Apply Clean Code principles, Repository Pattern, Zod Validation, verify `tenant_id` security, and optimize SQL Transactions.
  - Ensure the tests still PASS.

---

## 5. CORE DATABASE STRUCTURE (DATA MODEL)
*Reference model for AI to build the Schema:*
- `Tenants`: `id`, `slug` (unique), `name`, `billing_plan`, `created_at`.
- `Users`: `id`, `firebase_uid` (unique), `email`, `full_name`.
- `Tenant_Users` (Roles M2M): `user_id`, `tenant_id`, `role` (Admin, Owner, Manager, Staff, Customer).
- `Api_Keys` (Optional): `id`, `tenant_id`, `key_hash`, `scopes`.

*(All other business entities like Bookings, Services reside in separate domains/databases. This repo focuses fully on Identity).*

---

## 6. AI SKILL ROUTING MATRIX
When tasked with a particular domain, you (the AI) MUST load and read the internal instructions from the relevant skill directory located at `@.agents/skills/` before making changes.

> **Skill Mapping Rule:** Whenever a newly specialized skill is created in the `.agents/skills/` directory, it MUST be mapped and added to this matrix. This ensures the AI knows to include and consult it when needed.

- **Planning (`plan`)**: Consult `.agents/skills/plan/SKILL.md` before implementing tasks, writing test cases for TDD, or drafting epics, architecture, SRS, and task breakdowns.
- **Business Analysis (`ba`)**: Use `.agents/skills/ba/SKILL.md` to break Epics or Ideas down into concrete User Stories and Acceptance Criteria.
- **Technical Architecture (`tl`)**: Use `.agents/skills/tl/SKILL.md` to design system diagrams, data models, APIs, and ensure architectural constraints.
- **Project Management (`pm`)**: Use `.agents/skills/pm/SKILL.md` to break User Stories down into granular, step-by-step developer tasks following the SDLC.
- **Next.js & React (`nextjs-dev`)**: Always follow `.agents/skills/dev/SKILL.md` for UI, App Router, and Server Action constraints.
- **Testing & TDD (`qa`)**: Always follow `.agents/skills/qa/SKILL.md` during the "RED PHASE" test generation.
- **Database & Drizzle (`db`)**: Consult `.agents/skills/db/SKILL.md` whenever writing database schemas, migrations, or Drizzle ORM queries.
- **Identity & Auth (`auth`)**: Consult `.agents/skills/auth/SKILL.md` when working with Firebase Authentication, JWTs, or session cookies.
- **Cloud & Infrastructure (`infra`)**: Consult `.agents/skills/infra/SKILL.md` when working with CI/CD, Docker, or Google Cloud services.

---

## 7. PROMPT INSTRUCTIONS FOR AI
When you (the AI) have read and understood this file, please reply to the user using the following format:
1. Confirm that you have loaded and understood the context of the **Voca Centralized Authentication & SSO Gateway**.
2. Confirm that you understand the critical security constraints regarding **Data Isolation (`tenant_id`)**, **JWT session minting**, and **Firebase Admin SDK usage**.
3. State that you are waiting for the user's command to start the TDD cycle (Red Phase) or Architecture design for the first feature.