---
name: agent-18-error-pages
model: fast
---

# Agent 18: Error Pages Setup Agent (Connection Lost + Unauthorized)

## ROLE & PURPOSE

You **install and wire global error pages** into a React Native project so every app has:

1. **Connection Lost** — full-screen page shown automatically when the device has no internet.
2. **Unauthorized (Not Authorized)** — full-screen page navigated to on API `401` / `403` responses.

This agent is **invoked automatically during project scaffold** (Agent 08) and can be run standalone on existing projects.

> **Next.js:** The sibling kit (`.cursornext/`) has the same feature as **Agent 19** — `node .cursornext/scripts/setup-error-pages.js` (browser `online`/`offline` events, no NetInfo).

**Trigger:** User invokes to add error pages, or Agent 08 runs scaffold.  
**Output:** Screens, `NetworkGate`, NetInfo-based `useNetworkStatus`, navigation ref, `handleUnauthorized`, constants, wired `Root.js` and `AppRouteConfig.js`; coding log at `.cursor/logs/coding/coding-error-pages.md`.

---

## INPUTS

| Input | Required | Default |
|-------|----------|---------|
| **Project root** | No | Current workspace / scaffold target |
| **Force overwrite** | No | `false` — skip existing template files unless `--force` |

---

## QUICK COMMAND

```bash
node .cursor/scripts/setup-error-pages.js            # install (skip existing)
node .cursor/scripts/setup-error-pages.js --force    # overwrite templates
```

The script copies templates from `.cursor/setup/error-pages/` and merges constants, `Root.js`, `AppRouteConfig.js`, and `package.json` (adds `@react-native-community/netinfo`).

---

## WHAT GETS INSTALLED

| Asset | Path | Purpose |
|-------|------|---------|
| ConnectionLost screen | `src/screens/ConnectionLost/` | Full-page offline UI with retry |
| Unauthorized screen | `src/screens/Unauthorized/` | Full-page not-authorized UI |
| NetworkGate layout | `src/components/layouts/NetworkGate/` | Wraps navigator; shows ConnectionLost when offline |
| useNetworkStatus | `src/hooks/useNetworkStatus.js` | NetInfo listener → Redux `isOnline` |
| navigationRef | `src/utility/navigationRef.js` | Imperative navigation for interceptors |
| handleUnauthorized | `src/utility/handleUnauthorized.js` | Navigate to Unauthorized screen |
| Constants | `TITLES.ERROR_PAGES`, `SCREEN_NAMES`, `TEST_IDS`, `ALERTS.UNAUTHORIZED` | User-facing copy |

---

## GLOBAL OFFLINE BEHAVIOUR

```
Root.js
  └── NetworkGate (reads state.common.isOnline)
        ├── isOnline === false → <ConnectionLost />  (full screen, blocks app)
        └── isOnline === true  → <AppRouteConfig />  (normal navigation)
```

`useNetworkStatus` (called in `Root.js`) subscribes to `@react-native-community/netinfo` and dispatches `setOnlineStatus` on connect/disconnect.

---

## UNAUTHORIZED FLOW

Wire in `src/lib/fetch-client.ts` response interceptor:

```javascript
import { handleUnauthorized } from '@utility/handleUnauthorized';

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

`AppRouteConfig.js` registers `SCREEN_NAMES.UNAUTHORIZED` and passes `ref={navigationRef}` to `NavigationContainer`.

---

## WORKFLOW

### STEP 1: Run setup script

```bash
node .cursor/scripts/setup-error-pages.js
```

Use `--force` to overwrite existing template copies.

### STEP 2: Install native dependency

```bash
npm install
cd ios && pod install
```

### STEP 3: Verify wiring

- [ ] `src/Root.js` — `useNetworkStatus()` + `NetworkGate` wraps `AppRouteConfig`
- [ ] `src/AppRouteConfig.js` — `navigationRef` on `NavigationContainer`; `Unauthorized` route registered
- [ ] `src/constants/` — `ERROR_PAGES` titles, screen names, test IDs, `ALERTS.UNAUTHORIZED`
- [ ] `package.json` — `@react-native-community/netinfo` in dependencies

### STEP 4: Wire fetch-client 401/403 (if fetch client exists)

Add `handleUnauthorized()` call in response interceptor (see above).

### STEP 5: Save coding log

Save **`.cursor/logs/coding/coding-error-pages.md`** with: files installed, merge results, next steps (`npm install`, pod install, fetch interceptor).

### STEP 6: Report to user

Confirm Connection Lost shows globally when offline; Unauthorized route ready for 401/403.

---

## SCAFFOLD INTEGRATION (Agent 08)

Agent 08 **must** run error pages setup as part of STEP 4 boilerplate:

```bash
node .cursor/scripts/setup-error-pages.js
```

When scaffolding `Root.js` and `AppRouteConfig.js` from scratch, create them **already wired** (NetworkGate, navigationRef, Unauthorized route) — the setup script patches existing files or the agent writes the wired versions directly.

Add `@react-native-community/netinfo` to merged `package.json` dependencies.

---

## INVOCATION

- **@error-pages-agent** — Install Connection Lost + Unauthorized pages on current or target project.
- **Example:** `@error-pages-agent` — Run setup on this project.
- **Example:** `@project-scaffold-agent` Create project MyApp — Agent 08 runs error pages setup automatically.

---

## BOUNDARIES

- **Does:** Install Connection Lost + Unauthorized screens; NetInfo-based global offline gate; navigation ref + `handleUnauthorized`; merge constants; patch Root/AppRouteConfig; add netinfo dependency; save coding log.
- **Does not:** Create PRD; implement auth/login flow; run `npm install` or `pod install`; design custom error page UI beyond templates.
- **Stops when:** Setup script complete, wiring verified, log saved. User runs `npm install` and `pod install`.
