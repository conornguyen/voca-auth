---
name: nextjs-dev
description: Expert instructions and guidelines for modern Next.js development (App Router, Server Components, Server Actions).
---

# Next.js Expert Developer Skill

You are an expert Next.js developer emphasizing modern practices using the App Router, React Server Components (RSC), and Server Actions.

## Core Principles

1. **App Router First**: Always use the `app/` directory. Do not use the `pages/` directory unless specifically migrating legacy code.
2. **React Server Components (RSC) by Default**: Components are Server Components by default. Keep them as Server Components to reduce client-side JavaScript. 
3. **Client Components When Necessary**: Only add `'use client'` directive at the top of a file when you need:
    - Interactivity (e.g., `onClick`, `onChange`).
    - React hooks (e.g., `useState`, `useEffect`, `useContext`, `useRef`).
    - Browser APIs (e.g., `window`, `document`).
    - Custom hooks that depend on the above.
4. **Push State Down**: If only a small part of a component needs to be interactive, extract that part into a separate Client Component rather than making the whole parent component a Client Component.

## Data Fetching & Mutations

1. **Server Fetching**: Fetch data directly in Server Components using `await fetch()` or direct database calls (e.g., Drizzle ORM). Do not use `useEffect` for data fetching.
2. **Server Actions**: Define asynchronous functions with `'use server'` for form submissions and mutations. 
    - Place Server Actions in an `actions/` directory or define them inline within Server Components.
    - Handle pending states using `useFormStatus` and optimistic UI updates with `useOptimistic`.
3. **Route Handlers**: Use Route Handlers (`app/api/.../route.ts`) for webhooks, external integrations, or traditional API endpoints. For direct UI interactions, prefer Server Actions.
4. **Caching & Revalidation**: Leverage Next.js caching heavily. Use `revalidatePath` and `revalidateTag` within Server Actions to purge cache after data mutations.

## Architecture & File Conventions

- Use standard file conventions: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
- Utilize Parallel Routes (`@folder`) and Intercepting Routes (`(.)folder`) for complex UI patterns like modals.
- Co-locate components, actions, and tests close to where they are used.

## Styling & Layout

- Use **Tailwind CSS** for styling by default.
- Utilize `clsx` and `tailwind-merge` (e.g., a `cn()` utility) for conditional class names.
- Ensure layouts are responsive and accessible.

## TypeScript and Type Safety

- Strictly define types/interfaces for component props, API responses, and database schemas (e.g., Zod).
- Never use `any`. Prioritize `unknown` combined with type narrowing if you are dealing with unknown external data.

## Performance & SEO

- Utilize Next.js Image component (`next/image`) for optimized images. Use the `priority` prop for Above-The-Fold images.
- Use `next/font` for zero-layout-shift font loading.
- Export `metadata` object or `generateMetadata` function from `layout.tsx` or `page.tsx` for robust SEO.

## Security

- Never expose secrets to the client. Keep sensitive logic and keys strictly on the server.
- Authenticate and authorize every Server Action and Route Handler. Never assume the action is called by an authorized user based on UI state alone.
- **Multi-Tenancy & RBAC**: Always verify `tenant_id` access and role permissions using the Firebase Auth token before fulfilling requests, per `AGENT.md` guidelines.

## Checklist & TDD Workflow (CRITICAL)

1. **Task Tracking**: Before writing any code, ALWAYS read `docs/tasks.md`. Identify your current task. 
2. **TDD Strict Enforcement**: 
   - If your assigned task is in the **GREEN Phase**, YOU MUST VERIFY that the **RED Phase** (failing tests) has already been completed by the QA agent. 
   - If tests do not exist or do not fail, STOP and ask the user to run the `qa` agent first. NEVER write implementation code without tests existing.
3. **Check-Off**: After successfully completing your code and ensuring tests pass, you MUST modify `docs/tasks.md` and mark your specific task as complete (`- [x]`). 
4. **Yield**: Stop and inform the user that your phase is complete so the next Phase/Agent can take over.