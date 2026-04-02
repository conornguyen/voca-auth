---
description: PM — Plan and close a sprint for voca-auth
---

## PM Sprint Planning Workflow

Use this workflow at the start and end of every sprint cycle to keep development aligned with product goals.

### Sprint Start

1. **Review the backlog** — Pull stories with label `[status: ready-for-grooming]` from the BA.

2. **Prioritize by impact** — Rank stories against the three core domains in `README.md`:
   - Workspace (Tenant) Provisioning
   - SSO & Session Minting
   - Event Brokering (Pub/Sub)

3. **Size each story** — Estimate complexity (S / M / L / XL) based on layers touched (see BA Story Workflow step 4).

4. **Assign roles** — Tag each story with the primary owner: `[dev]`, `[fe-dev]`, `[qa]`, `[devops]`, or `[agent]`.

5. **Set sprint goal** — Write one sentence that defines what "done" looks like for this sprint.

6. **Confirm NFRs are included** — Verify latency, isolation, and scale-to-zero constraints are captured for any infrastructure story.

### Sprint Close

7. **Validate Definition of Done** — Walk through each story's Acceptance Criteria with QA sign-off before marking `[status: done]`.

8. **Collect blockers** — Document any stories that were blocked and why. Feed them back to Architect or SecOps if needed.

9. **Write release notes** — Summarize shipped features for stakeholders. Reference `docs/epic.md` language for consistency.
