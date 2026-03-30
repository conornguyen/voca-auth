# Voca Auth - Centralized SSO

This repository serves as the **Identity Provider (IdP) and Authentication Gateway** for the Voca SaaS platform. 

It handles:
1. **Firebase Authentication**: Client-side login flows and backend verification via Firebase Admin.
2. **Tenant Resolution**: Resolving the current workspace (`tenant_id`) from domains or login requests.
3. **Session Management**: Generating secure, cross-subdomain Wildcard Cookies (`domain=*.domain.com`) containing custom JWTs with embedded RBAC roles.
4. **Database Identity**: Managing the core `Tenants`, `Users`, and `Tenant_Users` Drizzle ORM schemas in PostgreSQL.

## Core Tech Stack
- Next.js 14+ (App Router)
- Firebase Auth
- PostgreSQL + Drizzle ORM
- Google Cloud Run Ready
