# AGENTS.md — Engineering rules for the AKFA MDM rebuild

These rules are binding for every task in this repository. If a task instruction
conflicts with a rule here, stop and ask.

## Source of truth
- The `./docs` folder is the product spec. Read the relevant doc before building a
  feature. Do not contradict it.
- If something is not in the docs, do NOT invent business logic. Implement the
  obvious platform-standard behavior (loading state, empty state, error toast) and
  leave a `// SPEC-GAP:` comment describing the assumption. Never guess at pricing,
  discount, permission, or sync logic — those must come from the docs.

## Honesty rules (most important)
- Never claim a feature is complete if any part is stubbed, mocked, or faked.
- When you stub something, mark it with `// TODO Phase 2:` or `// BACKEND-NEEDED:`
  and list it in your final summary.
- Do not invent backend endpoints or pretend data is real. Phase 1 is mock-data only;
  mocks live in `src/shared/mocks/` and are clearly named `*.mock.ts`.
- The product↔external-system data model can only express SYNCED vs MISSING today.
  Do not render PENDING/FAILED/STALE as if they were real unless the data carries them.
  Document the backend fields required (mapping.status, mapping.lastSyncAt,
  mapping.lastError) wherever you touch coverage logic.

## Scope discipline
- Build only what the current task lists. For anything out of scope, create a route
  with a placeholder page ("Phase 2 — not yet implemented") so navigation never breaks.
- Do not refactor unrelated files. Do not change the build tooling, the auth flow, or
  the i18n setup unless the task says so.

## Stack (do not substitute)
React 19 + TypeScript, Redux Toolkit + RTK Query, React Router v7, Tailwind CSS v4
+ CSS custom properties, react-hook-form (+ zod for new schemas), Framer Motion,
i18next (RU + UZ). Feature-Sliced Design: entities / features / pages / shared.

## Code quality
- No hardcoded colors, spacing, or font sizes — use the tokens in
  `src/shared/design/tokens.css`.
- Shared UI components are presentational: data in via props, no API calls inside them.
- Centralize route strings in `src/shared/constants/routes.ts`; never hardcode paths
  in components.
- Use the existing permission codes (see 01-data-models.md / 07-users-roles-permissions.md).
  Never invent new permission strings.
- Every status shown to a user is text + icon + color, never color alone (accessibility).
- Add i18n keys for BOTH ru and uz. No empty translation values.

## Definition of done (every task)
1. `npm run build` passes with zero TypeScript errors.
2. No dead links, no blank screens — every nav item resolves.
3. New code uses design tokens and shared components, not one-off styles.
4. Final summary lists: files created/changed, every Phase-2 stub, every backend TODO,
   and every `SPEC-GAP` assumption you made.

## What to do when unsure
Stop and ask one specific question rather than guessing. A blocked task is recoverable;
a confidently-wrong MDM feature is not.
