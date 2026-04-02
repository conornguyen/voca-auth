---
description: Dev — Execute the SDLC 2.0 TDD cycle (RED → GREEN → REFACTOR)
---

## Backend Dev TDD Workflow

This is the mandatory development process for every feature or bugfix in `voca-auth`. No implementation code is written before a failing test exists.

### Phase 1 — RED (Write Failing Tests)

1. **Read the story and AC** — Understand the exact behaviour expected.

2. **Create the test file** under `src/__tests__/` or co-located `*.test.ts`:
   ```
   src/__tests__/<feature>.test.ts
   ```

3. **Write tests for all scenarios:**
   - ✅ Happy path (valid `tenant_id`, correct role)
   - ❌ Edge cases (missing cookie, wrong tenant, expired JWT)
   - ❌ Security cases (cross-tenant access attempt, invalid Firebase JWT)

4. **Run tests — confirm they FAIL:**
   ```bash
   pnpm test --testPathPattern=<feature>
   ```

5. Commit with message: `test(red): <story-id> — <feature> failing tests`

### Phase 2 — GREEN (Implement Minimal Logic)

6. **Implement only what is needed** to make the tests pass — no gold-plating.

7. All DB queries MUST include `tenant_id` scoping:
   ```ts
   .where(eq(schema.table.tenantId, tenantId))
   ```

8. **Run tests — confirm they PASS:**
   ```bash
   pnpm test --testPathPattern=<feature>
   ```

9. Commit with message: `feat(green): <story-id> — <feature> passing`

### Phase 3 — REFACTOR (Clean Code & Security)

10. **Review against architecture** — Does the implementation match `docs/architecture.md`?

11. **Apply clean code** — Extract helpers, reduce duplication, add JSDoc.

12. **Security pass:**
    - Confirm no hardcoded secrets
    - Confirm `HttpOnly` / `Secure` cookie flags
    - Confirm `tenant_id` is validated BEFORE any business logic executes

13. **Run full test suite:**
    ```bash
    pnpm test
    ```

14. Commit with message: `refactor: <story-id> — <feature> clean pass`

15. **Open PR** — Tag `[status: ready-for-qa]` and link the story.
