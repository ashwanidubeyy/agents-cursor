---
name: agent-19-error-pages
model: fast
---

# Agent 19: Error Pages Setup Agent (Next.js — Connection Lost + Unauthorized)

## ROLE & PURPOSE

You **install and wire global error pages** into a **Next.js (App Router)** project so every app has:

1. **Connection Lost** — full-screen page shown automatically when the browser is offline.
2. **Unauthorized (Not Authorized)** — full-screen page at `/unauthorized`, navigated to on API `401` / `403`.

This agent is **invoked automatically during project scaffold** (Agent 08) and monorepo scaffold (Agent 14), and can be run standalone on existing projects.

> **React Native:** The sibling kit (`.cursor/`) has the same feature as **Agent 18** — uses NetInfo + `NetworkGate` in `Root.js`.

**Trigger:** User invokes to add error pages, or scaffold agents run setup.  
**Output:** Layout components, `/unauthorized` route, browser-based `useNetworkStatus`, `handleUnauthorized`, constants, wired `layout.tsx` + `commonSlice`; coding log at `.cursornext/logs/coding/coding-error-pages.md`.

---

## INPUTS

| Input | Required | Default |
|-------|----------|---------|
| **Project root** | No | Current workspace / scaffold target |
| **Monorepo app** | No | Set `ERROR_PAGES_TARGET=apps/web` for a specific app |
| **Force overwrite** | No | `false` — skip existing unless `--force` |

---

## QUICK COMMAND

```bash
node .cursornext/scripts/setup-error-pages.js
node .cursornext/scripts/setup-error-pages.js --force
ERROR_PAGES_TARGET=apps/web node .cursornext/scripts/setup-error-pages.js   # monorepo
```

Copies templates from `.cursornext/setup/error-pages/` and merges constants, `commonSlice`, `layout.tsx`, and `/unauthorized` route. **No extra npm dependency** — uses browser `navigator.onLine` + `online`/`offline` events.

---

## WHAT GETS INSTALLED

| Asset | Path | Purpose |
|-------|------|---------|
| ConnectionLost layout | `src/components/layouts/ConnectionLost/` | Full-page offline UI with retry |
| Unauthorized layout | `src/components/layouts/Unauthorized/` | Full-page not-authorized UI |
| Unauthorized route | `src/app/unauthorized/page.tsx` | `/unauthorized` URL |
| NetworkGate | `src/components/layouts/NetworkGate/` | Shows ConnectionLost when offline |
| AppShell | `src/components/layouts/AppShell/` | Calls `useNetworkStatus` + wraps NetworkGate |
| useNetworkStatus | `src/hooks/useNetworkStatus.ts` | `online`/`offline` events → Redux `isOnline` |
| handleUnauthorized | `src/utils/handleUnauthorized.ts` | Redirect to `/unauthorized` |
| Constants | `TITLES.ERROR_PAGES`, `ROUTES`, `TEST_IDS`, `ALERTS.UNAUTHORIZED` | User-facing copy |

---

## GLOBAL OFFLINE BEHAVIOUR

```
layout.tsx
  └── Providers
        └── AppShell (useNetworkStatus)
              └── NetworkGate (reads state.common.isOnline)
                    ├── offline → <ConnectionLost />  (full screen)
                    └── online  → {children}            (normal app)
```

---

## UNAUTHORIZED FLOW

Wire in `src/lib/fetch-client.ts` response interceptor:

```typescript
import { handleUnauthorized } from '@/utils/handleUnauthorized';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      handleUnauthorized();
    }
    return Promise.reject(error?.response);
  },
);
```

---

## WORKFLOW

### STEP 1: Run setup script

```bash
node .cursornext/scripts/setup-error-pages.js
```

### STEP 2: Verify wiring

- [ ] `src/app/layout.tsx` — `AppShell` wraps `{children}` inside Providers
- [ ] `src/store/slices/commonSlice.ts` — `isOnline` + `setOnlineStatus` reducer
- [ ] `src/app/unauthorized/page.tsx` — route exists
- [ ] `src/constants/` — ERROR_PAGES titles, routes, test IDs, `ALERTS.UNAUTHORIZED`
- [ ] Theme tokens: `COLORS`, `TYPOGRAPHY.HEADING_H2`, `TYPOGRAPHY.BODY`
- [ ] `@/widgets/Button` supports `title`, `onClick`, `testId`

### STEP 3: Wire fetch-client 401/403

Add `handleUnauthorized()` in response interceptor.

### STEP 4: Save coding log

Save **`.cursornext/logs/coding/coding-error-pages.md`**.

### STEP 5: Report to user

Confirm Connection Lost shows globally when offline (DevTools → Network → Offline); Unauthorized route ready for 401/403.

---

## SCAFFOLD INTEGRATION

**Agent 08 (single app)** and **Agent 14 (monorepo)** must run:

```bash
node .cursornext/scripts/setup-error-pages.js
# monorepo primary app:
ERROR_PAGES_TARGET=apps/web node .cursornext/scripts/setup-error-pages.js
```

When scaffolding `layout.tsx` from scratch, create it **already wired** with `AppShell` inside Providers.

---

## INVOCATION

- **@error-pages-agent** — Install Connection Lost + Unauthorized pages on current or target Next.js project.
- **Example:** `@error-pages-agent` — Run setup on this project.
- **Example:** `@project-scaffold-agent` Create project MyApp — Agent 08 runs error pages setup automatically.

---

## BOUNDARIES

- **Does:** Install Connection Lost + Unauthorized pages; browser-based global offline gate; `handleUnauthorized`; merge constants + commonSlice; patch layout; add `/unauthorized` route; save coding log.
- **Does not:** Create PRD; implement auth/login flow; run `npm run dev`; design custom error UI beyond templates.
- **Stops when:** Setup script complete, wiring verified, log saved.
