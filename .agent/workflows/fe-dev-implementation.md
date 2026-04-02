---
description: FE Dev — Implement a client-side UI feature for voca-auth
---

## Frontend Dev Implementation Workflow

Use this workflow to build or update any client-facing component in the Next.js App Router.

1. **Read the story and AC** — Identify which auth flow is being built: Login, Signup, Password Reset, or Workspace Setup.

2. **Check the component library** — Before creating new components, check `components.json` (shadcn/ui registry) for existing primitives.

3. **Build the component** in the correct directory:
   ```
   src/app/(auth)/<flow>/page.tsx       ← Route page
   src/components/auth/<component>.tsx  ← Reusable component
   ```

4. **Firebase Auth integration** — Use the Firebase client SDK for client-side token generation:
   ```ts
   import { signInWithEmailAndPassword } from 'firebase/auth'
   ```
   Never use the Firebase Admin SDK on the client.

5. **POST to the session API** — After Firebase returns a client JWT, forward it to the backend:
   ```ts
   await fetch('/api/auth/session', {
     method: 'POST',
     body: JSON.stringify({ firebaseJwt }),
   })
   ```

6. **Handle the redirect** — After session minting, redirect the user to their tenant subdomain:
   ```ts
   window.location.href = `https://${tenantSlug}.domain.com/dashboard`
   ```

7. **Error states** — Every Firebase error code must map to a user-facing message. Never expose raw Firebase error strings.

8. **Accessibility** — All forms must have proper `aria-label`, `htmlFor`, and keyboard navigation.

9. **Run the dev server and verify visually:**
   ```bash
   pnpm dev
   ```

10. Commit with message: `feat(ui): <story-id> — <component-name>` and open PR tagged `[status: ready-for-qa]`.
