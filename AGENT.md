# AGENT.md — Development Workflow Roles

This file is the single source of truth for every role in the **Voca Auth** development lifecycle. It maps each role to its:
- **Workflow** — project-local step-by-step process (`.agent/workflows/`)
- **Skills** — global Antigravity skills to invoke when executing tasks

---

## Workflow Overview

```
Stakeholder → BA → PM → Architect → Dev → QA → DevOps → SecOps → Support
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
| `concise-planning` | Break down an Epic into atomic, actionable story checklist |
| `product-manager-toolkit` | Apply discovery frameworks (jobs-to-be-done, user personas) |

**Key Deliverables:** Epic briefs (`docs/epic.md`), user stories with Acceptance Criteria, persona definitions (`docs/rbac_roles_and_skills.md`)

---

### 2. 🗂 Product Manager (PM)

**Purpose:** Own the roadmap, prioritize the backlog, and run sprints.

**Workflow:** `.agent/workflows/pm-sprint.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `product-manager-toolkit` | Sprint planning, prioritization frameworks, metrics |
| `concise-planning` | Produce a clear sprint checklist |
| `writing-plans` | Convert a spec or Epic into a phased plan |

**Key Deliverables:** Prioritized backlog, sprint goals, release notes, NFR sign-off

---

### 3. 🏗 Solution Architect

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
| `secrets-management` | Design secret lifecycle and GCP Secret Manager strategy |

**Key Deliverables:** `docs/architecture.md`, event schema contracts, DB migration strategy, ADRs

---

### 4. 👨‍💻 Backend Developer (Dev)

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
| `database` | Drizzle ORM query patterns, migrations, data access layer |
| `fp-async` | Async/await and error-handling pipelines |

**Key Files:** `src/`, `drizzle.config.ts`, `jest.config.js`

---

### 5. 🎨 Frontend Developer (FE Dev)

**Purpose:** Build client-side UI components that interact with the auth gateway.

**Workflow:** `.agent/workflows/fe-dev-implementation.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `nextjs-best-practices` | App Router pages, Client Components, data fetching |
| `react-patterns` | Component composition, hooks, state management |
| `shadcn` | shadcn/ui component usage, customization, and registry |
| `tailwind-patterns` | Tailwind CSS v4 utility patterns and design tokens |
| `frontend-design` | UI/UX decisions, layout hierarchy, visual consistency |
| `react-component-performance` | Diagnose and fix slow components |

**Key Tools:** Next.js 14+, Firebase Auth SDK (client), shadcn/ui, Tailwind CSS

---

### 6. 🔒 Security Engineer (SecOps)

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

**Key Constraints:**
- All queries MUST include `WHERE tenant_id = ?`
- Firebase Admin keys must never leave GCP Secret Manager
- Wildcard cookies: `HttpOnly; Secure; SameSite=Lax; Domain=*.domain.com`

---

### 7. 🧪 QA Engineer (QA)

**Purpose:** Validate that every feature meets Acceptance Criteria before release.

**Workflow:** `.agent/workflows/qa-validation.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `e2e-testing` | Playwright E2E tests for SSO flows, subdomain redirects |
| `webapp-testing` | Native Python Playwright scripts for local verification |
| `tdd-workflow` | Verify test coverage discipline was followed by Dev |
| `requesting-code-review` | Structure a handoff review before marking story Done |

**Key Test Scenarios:** RBAC enforcement per role, cross-tenant isolation (`tenant-a` vs `tenant-b`), wildcard cookie attributes, Edge Middleware rejection

---

### 8. ⚙️ DevOps / Platform Engineer

**Purpose:** Manage CI/CD, infrastructure, and cloud deployment.

**Workflow:** `.agent/workflows/devops-deploy.md`

**Global Skills to use:**
| Skill | When to use |
|-------|------------|
| `github-actions-templates` | Build CI/CD pipeline (test → build → deploy to Cloud Run) |
| `deployment-pipeline-design` | Multi-stage pipeline with approval gates |
| `secrets-management` | GCP Secret Manager integration in CI/CD pipeline |
| `gcp-cloud-run` | Cloud Run deployment flags, scaling, traffic splitting |

**Key Infrastructure:** Google Cloud Run · Google Cloud SQL · GCP Pub/Sub · GCP Secret Manager · Google Artifact Registry

---

### 9. 🤖 AI Agent (Antigravity)

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

**Operating Rules:**
- Never merge without a human reviewer sign-off
- Always scope work to the assigned story — no unsolicited refactors
- All DB queries must include `WHERE tenant_id = ?`
- All secrets via environment variables — never hardcoded
- Reference `docs/architecture.md` before proposing schema changes
- Use `pnpm` for all package management

---

## RACI Matrix

| Activity                        | BA | PM | Architect | Dev | FE Dev | SecOps | QA | DevOps | Agent |
|---------------------------------|----|----|-----------|-----|--------|--------|----|--------|-------|
| Define Epic & User Stories      | R  | A  |           |     |        |        | C  |        | C     |
| Architecture Design             | C  | C  | R/A       | C   |        | C      |    |        | C     |
| TDD Cycle (RED/GREEN/REFACTOR)  |    |    | C         | R/A | C      |        | C  |        | R     |
| Frontend Implementation         |    |    | C         |     | R/A    |        | C  |        | R     |
| Security Review                 |    |    | C         | C   | C      | R/A    | C  |        | C     |
| QA & Acceptance Testing         |    | A  |           |     |        |        | R  |        | C     |
| CI/CD & Deployment              |    | I  | C         |     |        | C      |    | R/A    |       |
| Documentation                   | C  | I  | C         | C   | C      |        |    |        | R/A   |

> **R** = Responsible · **A** = Accountable · **C** = Consulted · **I** = Informed

---

## Story Lifecycle

```
[BA: ba-story.md]       → [PM: pm-sprint.md]    → [Architect: architect-design.md]
[Dev/Agent: dev-tdd.md] → [QA: qa-validation.md] → [SecOps: secops-review.md]
[PM: approves]          → [DevOps: devops-deploy.md] → ✅ Done
```

---

## Quick Reference — Slash Commands

| Role | Invoke with |
|------|-------------|
| BA — Write a story | `/ba-story` |
| PM — Plan a sprint | `/pm-sprint` |
| Architect — Design a feature | `/architect-design` |
| Dev — TDD cycle | `/dev-tdd` |
| FE Dev — Implement UI | `/fe-dev-implementation` |
| SecOps — Security review | `/secops-review` |
| QA — Validate story | `/qa-validation` |
| DevOps — Deploy | `/devops-deploy` |
| Agent — Execute task | `/agent-task` |

---

*Last updated: 2026-04-02 · Voca Auth — Centralized SSO & Identity Gateway*
