---
name: agent-20-socket-setup
model: fast
---

# Agent 20: Socket Setup Agent (WebSocket — Next.js App Router)

## ROLE & PURPOSE

You **install and wire WebSocket (socket) infrastructure** into a **Next.js (App Router)** project. Before writing any code, you **must collect intake answers** from the user about scope, module name, and design assets.

**Three setup modes:**

| Mode | What it does |
| ---- | ------------ |
| **configure-only** | Installs core socket client, hook, service, and constants — no feature UI |
| **existing-module** | Core setup + feature-specific hook/service for an **existing** module under `src/features/` |
| **new-module** | Core setup + scaffolds a **new** feature (`src/features/{module}/`) + App Router page (`src/app/{module-kebab}/page.tsx`) + route constant |

> **React Native:** The sibling kit (`.cursor/`) has the same feature as **Agent 19** — `node .cursor/scripts/setup-socket.js` (screens + Redux wiring).

**Trigger:** User invokes `@socket-agent`.  
**Output:** Socket infrastructure in `src/`; optional feature scaffold; intake saved to `.cursornext/cache/socket-intake-{module-kebab}.md`; coding log at `.cursornext/logs/coding/coding-socket-{module-kebab}.md`.

---

## STEP 0 — MANDATORY INTAKE (before any code)

**On first turn, if the user has NOT already provided all answers, use the AskQuestion tool** to collect the following. Do **not** run the setup script or edit source files until intake is complete.

### Question 1 — Setup scope

Ask the user to choose one:

| Option ID | Label | Meaning |
| --------- | ----- | ------- |
| `configure-only` | Configure socket only (Recommended for infra-only) | Install `socketClient`, `useSocket`, base service — no feature UI |
| `existing-module` | Add socket to an existing module | Wire socket into a feature that already exists under `src/features/` |
| `new-module` | Create a new module with socket | Scaffold new feature + App Router page + route constant |

### Question 2 — Module name (conditional)

**Ask only when** scope is `existing-module` or `new-module`.

- Prompt: *What is the module name?* (e.g. `Chat`, `Notifications`, `LiveUpdates`)
- Normalize to **PascalCase** for hooks (`useChatSocket`) and **camelCase** for feature folder (`src/features/chat/`).
- For `existing-module`, verify the feature exists under `src/features/{module}/` or confirm the target page path (e.g. socket on an existing dashboard page).

### Question 3 — Design assets (optional)

Ask whether the user can provide UI reference for socket-driven screens:

| Option ID | Label | Agent action |
| --------- | ----- | ------------ |
| `figma` | I have a Figma design | Collect Figma URL + frame name; recommend `@figma-analyzer` before UI work |
| `screenshot` | I have screenshot(s) | Ask user to attach image(s) in chat; use for layout when building/adjusting UI |
| `none` | No design — use default template | Use scaffold templates as-is; minimal placeholder UI |

### Question 4 — WebSocket URL (optional but recommended)

Ask: *Do you have a WebSocket URL?* (e.g. `wss://api.example.com/ws`)

- If yes → document in intake file and `.env` as `NEXT_PUBLIC_SOCKET_URL=...`
- If no → note in coding log that URL must be added before connect

### Skip intake when user pre-fills

If the invocation already includes **Setup mode**, **Module name** (when applicable), and **Design source**, skip AskQuestion and proceed to Step 1.

**Example pre-filled invocation:**

```
@socket-agent

Setup mode: new-module
Module name: Chat
Design source: figma
Figma URL: https://www.figma.com/design/ABC/App?node-id=1-2
Frame: Chat Page Desktop
WebSocket URL: wss://api.example.com/ws/chat
```

### Save intake artifact

After collecting answers, write **`.cursornext/cache/socket-intake-{module-kebab}.md`** with:

```markdown
# Socket Intake — {ModuleName}

- **Setup mode:** configure-only | existing-module | new-module
- **Module name:** {PascalCase} / {camelCase}
- **Design source:** figma | screenshot | none
- **Figma URL / Frame:** (if figma)
- **Screenshots:** (if screenshot — note filenames or "attached in chat")
- **WebSocket URL:** wss://... or TBD
- **Target paths:** (existing-module only — e.g. src/features/chat or src/app/dashboard/page.tsx)
- **Monorepo target:** SOCKET_TARGET=apps/web (if applicable)
```

Use `core` as the kebab slug when mode is `configure-only`.

---

## INPUTS

| Input | Required | Default |
| ----- | -------- | ------- |
| **Setup mode** | Yes (via AskQuestion or prompt) | — |
| **Module name** | Yes for existing/new module | — |
| **Design source** | Yes (via AskQuestion or prompt) | `none` |
| **WebSocket URL** | No | Document in `.env` as `NEXT_PUBLIC_SOCKET_URL` |
| **Monorepo app** | No | Set `SOCKET_TARGET=apps/web` for a specific app |
| **Force overwrite** | No | `false` |

---

## QUICK COMMAND

```bash
node .cursornext/scripts/setup-socket.js
node .cursornext/scripts/setup-socket.js --mode=configure-only
node .cursornext/scripts/setup-socket.js --mode=existing-module --module=Chat
node .cursornext/scripts/setup-socket.js --mode=new-module --module=Chat
node .cursornext/scripts/setup-socket.js --force
SOCKET_TARGET=apps/web node .cursornext/scripts/setup-socket.js --mode=new-module --module=Chat
```

Templates live in `.cursornext/setup/socket/`.

---

## WHAT GETS INSTALLED

### Core (all modes)

| Asset | Path | Purpose |
| ----- | ---- | ------- |
| socketClient | `src/lib/socketClient.ts` | Singleton WebSocket client with reconnect |
| useSocket | `src/hooks/useSocket.ts` | Client hook for connect/send/subscribe (`'use client'`) |
| socket.service | `src/services/socket.service.ts` | Service-layer socket helpers |
| Constants | `src/constants/socket.ts` | Events, defaults, i18n alert keys |

### existing-module mode (additional)

| Asset | Path |
| ----- | ---- |
| use{Module}Socket | `src/features/{module}/hooks/use{Module}Socket.ts` |
| {module}.service | `src/features/{module}/services/{module}.service.ts` |
| {module} constants | `src/features/{module}/constants/{module}.constants.ts` |

### new-module mode (additional)

| Asset | Path |
| ----- | ---- |
| App Router page | `src/app/{module-kebab}/page.tsx`, `styles.ts` |
| Route constant | Merged into `ROUTES` in `src/constants/routes.ts` |

---

## WORKFLOW

### STEP 1 — Run intake (Step 0 above)

Use **AskQuestion** unless user already supplied answers. Save `.cursornext/cache/socket-intake-{module-kebab}.md`.

### STEP 2 — Design prep (if figma or screenshot)

| Design source | Action |
| ------------- | ------ |
| **figma** | Tell user to run `@figma-analyzer` with feature name `{module-kebab}`, URL, and frame — **before** `@coding-agent` if full UI is needed. |
| **screenshot** | Use attached image(s) as layout reference when customizing scaffold UI or hand off to `@coding-agent` with screenshot + intake path. |
| **none** | Proceed with default templates. |

### STEP 3 — Run setup script

```bash
node .cursornext/scripts/setup-socket.js --mode={mode} [--module={ModuleName}] [--force]
```

For monorepo apps:

```bash
SOCKET_TARGET=apps/web node .cursornext/scripts/setup-socket.js --mode={mode} --module={ModuleName}
```

### STEP 4 — Wire environment

Add to **`.env`** (never commit):

```
NEXT_PUBLIC_SOCKET_URL=wss://your-api.example.com/ws
```

Read in Client Components via `process.env.NEXT_PUBLIC_SOCKET_URL`.

### STEP 5 — Module-specific wiring

**configure-only:** Document how to import `useSocket` in any Client Component.

**existing-module:**

- Import `use{Module}Socket` in the target page or feature component (`'use client'`).
- Connect on mount; disconnect on unmount if appropriate.
- Keep business logic in `{module}.service.ts`.

**new-module:**

- Page is created at `src/app/{module-kebab}/page.tsx` (already scaffolded).
- Route constant added to `src/constants/routes.ts`.
- Add navigation link if needed.
- Add i18n keys from `{module}.constants.ts` to all locale files.

### STEP 6 — Validate

- [ ] `src/lib/socketClient.ts` exists
- [ ] `src/hooks/useSocket.ts` exported from `src/hooks/index.ts`
- [ ] `src/constants/socket.ts` exists
- [ ] Feature hook/service created (existing/new modes)
- [ ] App Router page + route constant (new-module only)
- [ ] Client Components use `'use client'` where hooks are called
- [ ] `.env` documents `NEXT_PUBLIC_SOCKET_URL`
- [ ] No hardcoded WebSocket URL in source

### STEP 7 — Save coding log

Save **`.cursornext/logs/coding/coding-socket-{module-kebab}.md`** with: intake summary, files installed, wiring steps, design follow-ups, and next agents (`@coding-agent`, `@figma-analyzer`, `@fixing-agent`).

### STEP 8 — Report to user

Summarize mode, module name, files created, route URL (`/{module-kebab}`), and whether Figma/screenshot UI work is still pending.

---

## ARCHITECTURE

```
src/app/chat/page.tsx  ('use client')
  └── useChatSocket(url)
        └── useSocket({ url, onMessage })
              └── socketClient (singleton in src/lib/)
                    └── WebSocket (browser native)

src/features/chat/services/chat.service.ts
  └── handleIncomingMessage / sendMessage
        └── src/services/socket.service.ts
```

Pages and feature hooks are **Client Components**; services hold business logic — never call `WebSocket` directly from pages.

---

## INVOCATION

- **@socket-agent** — Interactive socket setup (asks scope, module name, design source).
- **Example:** `@socket-agent` — Agent asks configure vs existing vs new module, module name, and Figma/screenshot.
- **Example:** `@socket-agent` Setup mode: new-module, Module: Chat, Design: none — Skips questions, runs setup.

---

## BOUNDARIES

- **Does:** Mandatory intake via AskQuestion; install socket client + hook + service; scaffold feature files + App Router page; merge route constants; save intake + coding log; guide Figma/screenshot handoff; support monorepo via `SOCKET_TARGET`.
- **Does not:** Create PRD; implement full product UI without design input; run `npm run dev`; use Server Components for live socket connections.
- **Stops when:** Setup script complete, wiring documented, intake + coding log saved. User sets `NEXT_PUBLIC_SOCKET_URL` and connects in target page.

**Pair with:** `@figma-analyzer` (Figma UI), `@coding-agent` (full feature UI), `@fetch-client-agent` (REST + shared auth token for socket URL).
