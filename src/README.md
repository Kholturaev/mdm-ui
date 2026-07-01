# Architecture (Feature-Sliced Design)

```
app/       providers, store, routes, global styles — composition root
pages/     thin route-level screens
widgets/   composite UI blocks made of features/entities (AppShell, DealerTable)
features/  user interactions (dealer-create-edit, theme-toggle, auth-login)
entities/  business entities: api (axios + TanStack Query hooks) + model (types)
shared/    design system (ui/), api client, i18n, lib (hooks/utils) — no business logic
```

**Import rule:** a slice may only import from layers below it —
`shared → entities → features → widgets → pages → app`. Never the other way
around, and never sideways between two entities/features directly (compose
them in a widget or page instead).

Server state (lists, single records, mutations) lives in TanStack Query,
scoped per entity in `entities/<name>/api/queries.ts`. Redux (`app/store`)
holds only client UI state — theme, sidebar, auth session flags.
