# RBAC Roles & Skills (Capabilities)

This document outlines the capabilities (or "skills") required for each Role defined in the Voca SaaS platform's Role-Based Access Control (RBAC) architecture. 

These roles are mapped in the `Tenant_Users` table and dictate the level of access users have across the Next.js Identity Provider gateway and downstream microservices (like the Booking Engine).

## 1. System Admin (Admin)
*The highest level of access. Typically reserved for Voca platform administrators who manage the infrastructure and global platform health rather than individual tenant operations.*

**Skills / Capabilities:**
- **Global Tenant Management:** View, suspend, or delete any tenant workspace across the platform.
- **Platform Analytics:** Access global metrics spanning all workspaces.
- **System Configuration:** Manage global settings, payment gateways at the platform level, and feature flags.
- **Support Impersonation:** Temporarily assume a tenant role to troubleshoot and fix customer issues across the platform.

## 2. Tenant Owner (Owner)
*The primary subscriber or business owner who creates the workspace. They have full autonomy over their specific tenant.*

**Skills / Capabilities:**
- **Workspace Provisioning:** Claim and register a unique tenant subdomain (e.g., `mybusiness.voca.com`).
- **Billing & Subscription Management:** Upgrade/downgrade SaaS tiers and manage payment methods.
- **Staff Management:** Invite, remove, and assign roles (Manager, Staff) to other employees within the tenant.
- **Tenant Settings:** Modify platform integrations, branding, and core business configurations.
- **Full Operational Access:** Inherits all capabilities of Managers and Staff.

## 3. Tenant Manager (Manager)
*An employee responsible for the day-to-day operations of the tenant business. They have elevated permissions over regular staff but cannot manage billing or the underlying tenant account.*

**Skills / Capabilities:**
- **Operational Oversight:** View all staff schedules, customer bookings, and performance reports.
- **Staff Coordination:** Adjust staff schedules, assign tasks or bookings, and handle dispute resolutions.
- **Customer Management:** Edit customer profiles, apply discounts, or flag problematic user accounts within the tenant.
- **Content Management:** Update tenant-specific public content, services offered, and pricing.

## 4. Tenant Staff (Staff)
*Standard employees or service providers within the tenant workspace performing regular business operations.*

**Skills / Capabilities:**
- **Schedule Management:** View their own upcoming bookings, shifts, and assigned tasks.
- **Booking Fulfillment:** Mark appointments as complete, add internal notes regarding specific customers, and update task statuses.
- **Profile Management:** Update their own professional bio or availability preferences (subject to Manager approval).
- **Limited Customer Interaction:** Communicate with customers related only to their assigned bookings or services.

## 5. End Customer (Customer)
*The end-user interacting with a specific business's (tenant's) subdomain to utilize their services.*

**Skills / Capabilities:**
- **Subdomain Authentication:** Securely log in to a specific business's portal without cross-tenant collisions.
- **Self-Service Bookings:** Schedule, reschedule, or cancel their own appointments/bookings with the tenant.
- **Profile & History Overview:** View personal booking history, upcoming services, and update payment methods or contact details.
- **Notifications:** Receive automated updates/alerts via Email or SMS from the tenant's Event Bus mechanisms.

---
> **Note on Implementation:** In our multi-tenant architecture, the Next.js Edge Middleware extracts the `role` enum from the custom JWT wildcard cookie (`Domain=*.domain.com`). Downstream services only grant these access capabilities if the `tenant_id` requested perfectly matches the session context minted by the Voca Auth Gateway.
