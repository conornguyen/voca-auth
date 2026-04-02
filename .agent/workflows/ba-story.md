---
description: BA — Write a user story from business need to dev-ready
---

## BA Story Workflow

Use this workflow whenever a new feature request, bug, or product idea needs to be translated into a dev-ready user story for `voca-auth`.

**Prerequisite Skills:**
- Use `ask-questions-if-underspecified` before writing a story to clarify any ambiguous requirements.
- Use `concise-planning` to break down an Epic into an atomic, actionable story checklist before writing individual stories.
- Use `product-manager-toolkit` to apply discovery frameworks (jobs-to-be-done, user personas) if needed.

1. **Identify the persona** — Determine which RBAC role is affected: `Admin`, `Owner`, `Manager`, `Staff`, or `Customer`. Reference and update `docs/rbac_roles_and_skills.md` if new definitions are necessary.

2. **Draft the user story** in the standard format:
   ```
   As a [persona], I want to [action], so that [outcome].
   ```

3. **Write Acceptance Criteria (Definition of Done)** — Each story must have at least 3 measurable AC items. Reference `docs/epic.md §3` for style.

4. **Identify impacted system boundaries** — Specify which layer is touched:
   - Edge Middleware (tenant resolution)
   - Firebase Auth (client-side)
   - Server Action / API Route (backend)
   - Drizzle ORM / DB schema
   - GCP Pub/Sub (event emission)

5. **Check for data isolation implications** — If the story touches any data query, flag: "All queries MUST include `WHERE tenant_id = ?`."

6. **Attach NFRs** — If the story has latency, scale, or security constraints, attach them explicitly (reference `docs/epic.md §4`).

7. **Hand off to PM & Update Deliverables** — Update Epic briefs (`docs/epic.md`) if the feature scope expands. Finally, add the dev-ready story to the backlog with label: `[status: ready-for-grooming]`.
