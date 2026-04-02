---
description: Agent — Execute a scoped development task autonomously
---

## AI Agent Task Execution Workflow

Use this workflow whenever the AI agent (Antigravity) is assigned a task from the backlog. The agent operates under human review and may not merge without approval.

### 1. Load Context

1. Read `AGENT.md` to understand the role structure and operating rules.
2. Read `docs/architecture.md` for system boundaries and contracts.
3. Read `docs/rbac_roles_and_skills.md` for RBAC context if the task involves access control.
4. Read the assigned user story and its Acceptance Criteria.

### 2. Identify Task Type

Determine which workflow applies:
- Writing tests → follow `dev-tdd.md` (RED phase)
- Implementing logic → follow `dev-tdd.md` (GREEN phase)
- UI component → follow `fe-dev-implementation.md`
- Docs update → skip to step 4
- Architecture proposal → produce an ADR draft for Architect review

### 3. Execute the Task

- Follow the appropriate role workflow exactly
- Make only the changes scoped to the assigned story — no unsolicited refactors
- Every DB query must include `WHERE tenant_id = ?`
- Every secret must come from environment variables — never hardcoded
- Run `pnpm test` before marking work complete

### 4. Self-Review Checklist

- [ ] Does the implementation match the Acceptance Criteria?
- [ ] Are all tests passing: `pnpm test`?
- [ ] Is `tenant_id` isolation enforced?
- [ ] Are there any hardcoded secrets?
- [ ] Is documentation updated (README, docs/, AGENT.md) if the change warrants it?

### 5. Hand Off

- Commit with a clear conventional commit message: `feat|fix|test|docs|refactor(<scope>): <description>`
- Tag the story `[status: ready-for-qa]` or `[status: ready-for-review]`
- Leave a summary comment on the PR: what was done, what was skipped, and any open questions for the human reviewer

> **Rule:** The agent does not self-approve or self-merge. Every PR requires a human sign-off.
