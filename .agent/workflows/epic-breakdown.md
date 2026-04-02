---
description: Architect/PM — Break an Epic and architecture design into atomic, dev-ready tasks
---

## Epic Breakdown Workflow

Use this workflow **after** `architect-design.md` and **before** `pm-sprint.md`. The goal is to decompose a fully-designed Epic into a flat, ordered list of atomic tasks that any Dev or Agent can pick up and execute independently.

**Prerequisite Skills:**
- Use `concise-planning` to produce a clean, atomic task checklist before writing anything.
- Use `architecture-decision-records` to verify that every task maps back to an ADR or architecture decision.
- Use `ddd-context-mapping` if the Epic spans more than one bounded context (e.g., auth + event bus).

### Inputs Required

Before starting, confirm you have:
- [ ] The Epic brief from `docs/epic.md` (or the BA's user story artifact)
- [ ] The updated `docs/architecture.md` with schema, event contracts, and security notes
- [ ] The Architect's completed checklist from `architect-design.md` (step 8 tagged `[status: ready-for-dev]`)

---

### Step 1 — Identify Vertical Slices

Map the Epic against the five system layers in `docs/architecture.md §2`:

| Layer | Example tasks |
|-------|--------------|
| Edge Middleware | Tenant resolution, JWT assertion, subdomain routing |
| Firebase Auth | Sign-in flow, custom claims, token refresh |
| Server Action / API Route | Business logic, RBAC enforcement, response shape |
| Drizzle ORM / DB | Schema migration, query helpers, seed data |
| GCP Pub/Sub | Event emission, consumer contract, dead-letter handling |

Group the Epic's scope into which layers are touched.

---

### Step 2 — Write Atomic Tasks

For each layer slice, write one task per logical unit of work. Each task must be:

- **Self-contained** — completable by one developer in ≤ 1 day
- **Test-first** — has a clear RED test scenario before implementation begins
- **Scoped** — references exactly one story or AC item

Use this task format:

```
[TASK-{n}] <imperative verb> <subject>
  Story: <story-id or AC item>
  Layer: <Edge | Firebase | API | DB | Pub/Sub | Docs>
  Size: <S | M | L>
  Depends on: <TASK-{x}, TASK-{y}> (or "none")
  AC: <one-line acceptance condition>
  Security: <tenant_id required? yes/no | secret handling note>
```

---

### Step 3 — Resolve Dependencies

Draw a simple dependency chain:

```
TASK-1 → TASK-3
TASK-2 → TASK-3
TASK-3 → TASK-4 → TASK-5
```

- Tasks with no upstream dependency can be parallelized by the agent.
- Tasks that touch the DB schema must appear before any API or UI tasks that depend on that schema.

---

### Step 4 — Apply Security Tags

For every task, confirm and tag:
- `[tenant-scoped]` — all queries include `WHERE tenant_id = ?`
- `[secret-safe]` — no hardcoded secrets; env vars or GCP Secret Manager only
- `[cookie-compliant]` — any cookie manipulation preserves `HttpOnly; Secure; SameSite=Lax`

Flag any task missing a security tag as `[security: needs-review]`.

---

### Step 5 — Produce the Task Breakdown Document

Save the output as `docs/tasks/<epic-id>-tasks.md` with:

1. **Epic summary** (one paragraph)
2. **Dependency graph** (Mermaid `graph LR` block)  
   → Use `mermaid-expert` skill to draw this
3. **Task table** (all tasks in dependency order)
4. **Parallelisable groups** — list which tasks can be executed simultaneously

---

### Step 6 — Hand Off to PM

- Tag each task with `[status: ready-for-sprint]`
- Update `docs/epic.md` with a link to the task breakdown document
- Notify PM via `pm-sprint.md` step 1 (backlog review)
- If any task needs Architect clarification, flag `[status: needs-arch-review]` before handoff

> **Rule:** No task enters a sprint without a security tag, a size estimate, and at least one AC item.
