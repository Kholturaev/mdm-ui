### Promp 3

Read ./AGENTS.md again. Continue Phase 1, part 3 of 3 — the final part. Use existing
tokens, shared components, routes, and mocks. Implement ONLY these two views.

5. PRODUCT LIST (/products) from 03-products.md
   - Table columns: Name, SAP Code, Status (StatusBadge), Type, Group, Nomenclature Type,
     External Coverage (inline per-system badges via the CoverageMatrix cell renderer),
     Updated At, Actions.
   - Filters: search (name / SAP code), status, type, and a "missing from system X" quick
     filter that actually filters rows.
   - Data from src/shared/mocks (MOCK_PRODUCTS, EXTERNAL_SYSTEMS). No new data invented.

6. PRODUCT DETAIL (/products/:id) from 03-products.md and 08-audit-activity.md
   - Header: name + StatusBadge + SAP code.
   - Build ONLY these two tabs fully:
     "External Systems" — list all 5 systems with status + last sync; include an Export
     button that is DISABLED with a tooltip "Phase 2" (do not fake a working export).
     "History" — AuditTimeline from MOCK_PRODUCT_HISTORY; items expand to show
     old -> new field values.
   - All other tabs render the Phase-2 placeholder. Do not leave any tab blank or broken.

Coverage honesty: render real SYNCED/MISSING from the data; PENDING/FAILED come from the
mock and must keep the backend-TODO comment in CoverageMatrix. Do not invent sync logic.

Stack unchanged. i18n keys for ru + uz, no empty values.

DONE means: `npm run build` passes, the product list shows AKFA products with the coverage
column, the "missing from system" filter works, and product detail shows populated
External Systems and History tabs. Output a final Phase-1 summary: everything built, every
Phase-2 stub, every backend TODO, every SPEC-GAP assumption.
