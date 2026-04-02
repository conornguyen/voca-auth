# AGENT.md — Development Workflow Roles

This file is the single source of truth for every role in the **Voca Auth** development lifecycle. It maps each role to its:
- **Workflow** — project-local step-by-step process (`.agent/workflows/`)
- **Skills** — global Antigravity skills to invoke when executing tasks

---

## Workflow Overview

```
Stakeholder → BA → Epic Breakdown → PM → Architect → Dev → QA → DevOps → SecOps → Support
                    ↑__________________feedback loop_______________________↓
```

---

## Roles

### 1. 🧑‍💼 Business Analyst (BA)

**Purpose:** Translate business needs into structured, dev-ready user stories.

**Workflow:** `.agent/workflows/ba-story.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `ask-questions-if-underspecified` | Before writing a story — clarify ambiguous requirements |
| `concise-planning` | Break an Epic into an atomic, actionable story checklist |
| `product-manager-toolkit` | Apply discovery frameworks (jobs-to-be-done, user personas) |
| `business-analyst` | Structure requirements using professional BA frameworks |
| `writing-plans` | Convert a business need into a phased story plan |
| `ddd-context-mapping` | Map story boundaries across bounded contexts (auth ↔ tenant ↔ events) |

**Key Deliverables:** Epic briefs (`docs/epic.md`), user stories with Acceptance Criteria, persona definitions (`docs/rbac_roles_and_skills.md`)

---

### 2.5. 📋 Epic Breakdown Lead (Architect or PM)

**Purpose:** Decompose a fully-designed Epic + architecture into atomic, ordered, dev-ready tasks.

**Workflow:** `.agent/workflows/epic-breakdown.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `concise-planning` | Generate the initial atomic task checklist from the Epic |
| `architecture-decision-records` | Verify each task maps to an ADR or architecture decision |
| `ddd-context-mapping` | Identify cross-context tasks that require coordination |
| `mermaid-expert` | Draw the task dependency graph in `docs/tasks/<epic-id>-tasks.md` |
| `writing-plans` | Structure the output task breakdown document |
| `progressive-estimation` | Size each task (S/M/L/XL) based on layers and complexity |
| `subagent-driven-development` | Identify which tasks can be parallelized and assigned to agents |

**Key Deliverables:** `docs/tasks/<epic-id>-tasks.md` with dependency graph, security tags, and size estimates

---

### 3. 🗂 Product Manager (PM)

**Purpose:** Own the roadmap, prioritize the backlog, and run sprints.

**Workflow:** `.agent/workflows/pm-sprint.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `product-manager-toolkit` | Sprint planning, prioritization frameworks, metrics |
| `concise-planning` | Produce a clear sprint checklist |
| `writing-plans` | Convert a spec or Epic into a phased plan |
| `product-manager` | Apply advanced PM frameworks (OKRs, impact mapping) |
| `startup-metrics-framework` | Define and track key health metrics per sprint |
| `kpi-dashboard-design` | Design measurable KPIs for each Epic's success criteria |

**Key Deliverables:** Prioritized backlog, sprint goals, release notes, NFR sign-off

---

### 4. 🏗 Solution Architect

**Purpose:** Own the technical design, data model, and cross-service contracts.

**Workflow:** `.agent/workflows/architect-design.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `architect-review` | Review any proposed architecture for soundness |
| `backend-architect` | Design scalable API and microservice boundaries |
| `api-patterns` | REST vs GraphQL vs internal action design |
| `database-design` | Schema design, indexing, ORM selection |
| `c4-container` | Produce C4 container-level architecture diagrams |
| `mermaid-expert` | Create or update sequence/flow diagrams in `docs/architecture.md` |
| `ddd-context-mapping` | Map bounded contexts between voca-auth and downstream microservices |
| `ddd-strategic-design` | Define aggregate roots, domain events, and service contracts |
| `ddd-tactical-patterns` | Apply repositories, value objects, and domain services |
| `secrets-management` | Design secret lifecycle and GCP Secret Manager strategy |
| `event-sourcing-architect` | Design Pub/Sub event schema and consumer contracts |
| `architecture-decision-records` | Document and store ADRs in `docs/adr/` |
| `microservices-patterns` | Apply proven patterns for service decomposition |
| `saas-multi-tenant` | Enforce tenant isolation patterns across all layers |

**Key Deliverables:** `docs/architecture.md`, event schema contracts, DB migration strategy, ADRs

---

### 5. 👨‍💻 Backend Developer (Dev)

**Purpose:** Implement server-side logic following SDLC 2.0 TDD (RED → GREEN → REFACTOR).

**Workflow:** `.agent/workflows/dev-tdd.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `tdd-workflow` | Core TDD principles and RED/GREEN/REFACTOR discipline |
| `tdd-workflows-tdd-red` | Writing failing tests (RED phase) |
| `tdd-workflows-tdd-green` | Writing minimal passing implementation (GREEN phase) |
| `tdd-workflows-tdd-refactor` | Cleaning up and hardening code (REFACTOR phase) |
| `nextjs-best-practices` | Next.js App Router, Server Actions, middleware patterns |
| `nextjs-app-router-patterns` | Advanced App Router file conventions and data flow |
| `database` | Drizzle ORM query patterns, migrations, data access layer |
| `drizzle-orm-expert` | Drizzle schema, relations, and migration authoring |
| `fp-async` | Async/await and error-handling pipelines |
| `fp-errors` | Handle errors as values — avoid uncaught promise rejections |
| `auth-implementation-patterns` | Implement JWT validation, cookie minting, session refresh |
| `nodejs-best-practices` | Node.js production patterns, error boundaries, logging |
| `clean-code` | Apply naming, extraction, and readability best practices |

**Key Files:** `src/`, `drizzle.config.ts`, `jest.config.js`

---

### 6. 🎨 Frontend Developer (FE Dev)

**Purpose:** Build client-side UI components that interact with the auth gateway.

**Workflow:** `.agent/workflows/fe-dev-implementation.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `nextjs-best-practices` | App Router pages, Client Components, data fetching |
| `nextjs-app-router-patterns` | File conventions, layouts, loading UI, error boundaries |
| `react-patterns` | Component composition, hooks, state management |
| `react-component-performance` | Diagnose and fix slow components |
| `shadcn` | shadcn/ui component usage, customization, and registry |
| `tailwind-patterns` | Tailwind CSS v4 utility patterns and design tokens |
| `frontend-design` | UI/UX decisions, layout hierarchy, visual consistency |
| `ui-skills` | Opinionated constraints for building production-quality interfaces |
| `fp-react` | Functional patterns for hooks, state, and data fetching in React |
| `fixing-accessibility` | Ensure auth UI meets WCAG accessibility standards |
| `design-spells` | Add micro-interactions and polish to the SSO login flow |

**Key Tools:** Next.js 14+, Firebase Auth SDK (client), shadcn/ui, Tailwind CSS

---

### 7. 🔒 Security Engineer (SecOps)

**Purpose:** Ensure the identity gateway meets the highest security standards.

**Workflow:** `.agent/workflows/secops-review.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `security-auditor` | Holistic security audit of any feature or PR |
| `differential-review` | Security-focused review of a specific diff or PR |
| `secrets-management` | Audit secret handling, GCP Secret Manager patterns |
| `gdpr-data-handling` | Validate consent, PII handling, and data retention |
| `constant-time-analysis` | Detect timing vulnerabilities in JWT/crypto code |
| `auth-implementation-patterns` | Review auth flows for token leakage and replay attacks |
| `broken-authentication` | Test for common authentication bypass vulnerabilities |
| `idor-testing` | Verify cross-tenant data isolation at every endpoint |
| `privacy-by-design` | Embed privacy controls into feature design, not retrofit |
| `gha-security-review` | Audit GitHub Actions CI/CD for secret exposure |
| `security-scanning-security-sast` | Run SAST on new code before merge |

**Key Constraints:**
- All queries MUST include `WHERE tenant_id = ?`
- Firebase Admin keys must never leave GCP Secret Manager
- Wildcard cookies: `HttpOnly; Secure; SameSite=Lax; Domain=*.domain.com`

---

### 8. 🧪 QA Engineer (QA)

**Purpose:** Validate that every feature meets Acceptance Criteria before release.

**Workflow:** `.agent/workflows/qa-validation.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `e2e-testing` | Playwright E2E tests for SSO flows, subdomain redirects |
| `webapp-testing` | Native Python Playwright scripts for local verification |
| `tdd-workflow` | Verify test coverage discipline was followed by Dev |
| `requesting-code-review` | Structure a handoff review before marking story Done |
| `javascript-testing-patterns` | Jest unit test patterns for Next.js Server Actions |
| `test-driven-development` | Confirm RED phase tests exist before reviewing GREEN implementation |
| `spec-to-code-compliance` | Verify the implementation matches the BA's Acceptance Criteria |
| `systematic-debugging` | Debug unexpected failures before escalating to Dev |

**Key Test Scenarios:** RBAC enforcement per role, cross-tenant isolation (`tenant-a` vs `tenant-b`), wildcard cookie attributes, Edge Middleware rejection

---

### 9. ⚙️ DevOps / Platform Engineer

**Purpose:** Manage CI/CD, infrastructure, and cloud deployment.

**Workflow:** `.agent/workflows/devops-deploy.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `github-actions-templates` | Build CI/CD pipeline (test → build → deploy to Cloud Run) |
| `deployment-pipeline-design` | Multi-stage pipeline with approval gates |
| `secrets-management` | GCP Secret Manager integration in CI/CD pipeline |
| `gcp-cloud-run` | Cloud Run deployment flags, scaling, traffic splitting |
| `docker-expert` | Write optimized multi-stage Dockerfiles for Next.js |
| `deployment-validation-config-validate` | Validate environment config before promoting to production |
| `cicd-automation-workflow-automate` | Automate repetitive deployment and release steps |
| `observability-monitoring-slo-implement` | Define and track SLOs for the auth gateway |
| `distributed-tracing` | Wire request tracing across Edge → Firebase → API → DB |

**Key Infrastructure:** Google Cloud Run · Google Cloud SQL · GCP Pub/Sub · GCP Secret Manager · Google Artifact Registry

---

### 10. 🤖 AI Agent (Antigravity)

**Purpose:** Accelerate development by autonomously executing scoped tasks under human review.

**Workflow:** `.agent/workflows/agent-task.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `executing-plans` | Execute a written implementation plan step-by-step |
| `subagent-driven-development` | Spawn parallel sub-agents for independent tasks |
| `concise-planning` | Produce an atomic task checklist before touching code |
| `tdd-workflow` | Follow RED/GREEN/REFACTOR on every implementation task |
| `code-reviewer` | Self-review output before opening a PR |
| `simplify-code` | Check diff for clarity and safe simplifications |
| `moyu` | Guard against over-engineering or unsolicited scope expansion |
| `requesting-code-review` | Structure a PR description for human review |
| `lint-and-validate` | Run linting and type-checking after every code change |
| `systematic-debugging` | Diagnose test failures methodically before retrying |
| `context-driven-development` | Recover and restore task context when resuming work |

**Operating Rules:**
- Never merge without a human reviewer sign-off
- Always scope work to the assigned story — no unsolicited refactors
- All DB queries must include `WHERE tenant_id = ?`
- All secrets via environment variables — never hardcoded
- Reference `docs/architecture.md` before proposing schema changes
- Use `pnpm` for all package management

---

## RACI Matrix

| Activity | BA | EB | PM | Arch | Dev | FE | Sec | QA | Ops | Agent |
|----------|----|----|----|------|-----|----|-----|----|-----|-------|
| Define Epic | R | C | A | | | | | | | C |
| Epic Breakdown | C | R | A | C | | | | | | C |
| Sprint Planning | | | R/A | | | | | | | C |
| Architecture | C | C | C | R/A | C | | C | | | C |
| TDD Cycle | | | | C | R/A | C | | C | | R |
| Frontend | | | | C | | R/A | | C | | R |
| Security Review | | | | C | C | C | R/A | C | | C |
| QA Testing | | | A | | | | | R | | C |
| CI/CD | | | I | C | | | C | | R/A | |
| Documentation | C | C | I | C | C | C | | | | R/A |

> **R** = Responsible · **A** = Accountable · **C** = Consulted · **I** = Informed

---

## Story Lifecycle

```
[BA: ba-story.md]               → [PM: pm-sprint.md]
[Architect: architect-design.md] → [Breakdown: epic-breakdown.md]
[Dev/Agent: dev-tdd.md]         → [QA: qa-validation.md]
[SecOps: secops-review.md]      → [PM: approves]
[DevOps: devops-deploy.md]      → ✅ Done
```

---

## Quick Reference — Slash Commands

| Role | Invoke with |
|------|-------------|
| BA — Write a story | `/ba-story` |
| PM — Plan a sprint | `/pm-sprint` |
| Architect — Design a feature | `/architect-design` |
| **Breakdown — Epic → Tasks** | **`/epic-breakdown`** |
| Dev — TDD cycle | `/dev-tdd` |
| FE Dev — Implement UI | `/fe-dev-implementation` |
| SecOps — Security review | `/secops-review` |
| QA — Validate story | `/qa-validation` |
| DevOps — Deploy | `/devops-deploy` |
| Agent — Execute task | `/agent-task` |

---

*Last updated: 2026-04-02 · Voca Auth — Centralized SSO & Identity Gateway*
