# Coding Log — Socket Setup (Customer)

**Date:** 2026-06-19  
**Agent:** Agent 19 (Socket Setup)  
**Intake:** `.cursor/cache/socket-intake-customer.md`

## Summary

Installed WebSocket infrastructure and scaffolded the **Customer** module (`new-module` mode). Added a global floating action button (bottom-right) on all screens except Customer that navigates to the chat screen.

## Intake

| Field | Value |
| ----- | ----- |
| Setup mode | new-module |
| Module name | Customer |
| Design source | Agent-designed chat UI |
| WebSocket URL | `wss://api.example.com/ws/chat` (in `.env` as `SOCKET_URL`) |

## Files installed / updated

### Core socket

| File | Action |
| ---- | ------ |
| `src/utility/socketClient.js` | Installed |
| `src/hooks/useSocket.js` | Installed |
| `src/services/socket.service.js` | Installed |
| `src/constants/socket.js` | Installed |
| `src/utility/socketConfig.js` | Created — reads `process.env.SOCKET_URL` |
| `src/constants/index.js` | Socket exports + `SCREEN_NAMES.CUSTOMER` |
| `src/hooks/index.js` | `useSocket`, `useCustomerSocket` exports |
| `babel.config.js` | `@services` alias |
| `tsconfig.json` | `@services/*` path |

### Customer module

| File | Action |
| ---- | ------ |
| `src/hooks/useCustomerSocket.js` | Installed |
| `src/services/customer.service.js` | Installed |
| `src/constants/customer.js` | Installed |
| `src/screens/Customer/index.js` | Chat UI (StyleSheet, FlatList, composer) |
| `src/screens/Customer/style.js` | StyleSheet (project convention) |
| `src/screens/index.js` | Customer export |

### Global FAB + routing

| File | Action |
| ---- | ------ |
| `src/components/widgets/CustomerFab/index.js` | Floating bottom-right button |
| `src/components/widgets/CustomerFab/style.js` | FAB styles |
| `src/AppRouteConfig.js` | Customer route + FAB overlay |
| `src/constants/titles.js` | `TITLES.CUSTOMER.*` |
| `src/constants/testIds.js` | `TEST_IDS.CUSTOMER.*` |
| `.env` | `SOCKET_URL=wss://api.example.com/ws/chat` |
| `.gitignore` | `.env` added |

## Wiring

1. **Route:** `SCREEN_NAMES.CUSTOMER` registered in `AppRouteConfig.js`.
2. **FAB:** `CustomerFab` renders inside `NavigationContainer`; hidden on Customer screen; uses `navigationRef.navigate`.
3. **Socket URL:** Set in `.env` — wire `react-native-config` (or your env layer) so `process.env.SOCKET_URL` is available at runtime. Until then, connection status shows "Disconnected".

## UI QA (code-level)

| Check | Status |
| ----- | ------ |
| Safe area (BaseScreen + FAB insets) | Pass |
| Touch targets ≥ 44 (FAB, send, back) | Pass |
| KeyboardAvoidingView on chat composer | Pass |
| No hardcoded WS URL in source | Pass |
| Strings in TITLES / constants | Pass |
| Route registered in AppRouteConfig | Pass |
| FlatList for messages | Pass |
| Unique keys (`item.id`) | Pass |

## Next steps

1. Install and wire `react-native-config` (or equivalent) so `SOCKET_URL` from `.env` reaches `src/utility/socketConfig.js`.
2. Run `npm install` if adding dependencies.

## Root cause — keyboard not avoided (fixed in agent + templates)

| Gap | Impact |
| --- | ------ |
| Old screen template was a **title-only placeholder** (no chat composer, no keyboard code) | Agent hand-built UI without checklist |
| Agent **stopped after `setup-socket.js`** with no Step 3b UI QA pass | `ui-qa-checklist.mdc` §4 never applied |
| Agent said design `none` → "use templates as-is" | Incorrect for chat modules |
| Template used **styled-components** (not in project) | Agent rewrote screen ad hoc, missing keyboard rules |

**Agent/template updates (2026-06-19):** Chat scaffold template now includes full keyboard-safe layout; agent-19 Step 3b mandates `ui-qa-checklist.mdc` verification before stop.

## Related agents

- `@coding-agent` — full product UI / Redux integration
- `@fixing-agent` — connection or navigation issues
- `@fetch-client-agent` — share auth token with socket handshake
