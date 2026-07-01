# AgentsReactNative

**External guides**

- React Native: [Google Doc](https://docs.google.com/document/d/1DB0if_g6tVlS1xhuW0uhhv3OoBF9yXhOKMyFjk00sQY/edit?tab=t.0#heading=h.oj34vq1p6br0)
- Next.js: [Google Doc](https://docs.google.com/document/d/12rLzhaPYanMHOlRMxeJvsFF3KXl9EzZUhPzqNcAW0UM/edit?tab=t.0)

This is a [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli). The repo also ships **two Cursor AI agent systems** — one for React Native (`.cursor/`) and one for Next.js (`.cursornext/`).

---

## Table of contents

1. [React Native — Getting Started](#react-native--getting-started)
2. [Cursor AI Agent Systems](#cursor-ai-agent-systems)
3. [React Native vs Next.js](#react-native-vs-nextjs)
4. [Workflows](#workflows)
5. [Agent reference](#agent-reference)
6. [Examples](#examples)
7. [Rules, docs & scripts](#rules-docs--scripts)
8. [Troubleshooting & Learn More](#troubleshooting--learn-more)

---

## React Native — Getting Started

> **Note**: Complete the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Step 1: Start Metro

Run **Metro**, the JavaScript build tool for React Native, from the project root:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Build and run your app

With Metro running, open a new terminal and use one of the following commands:

#### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

#### iOS

Install CocoaPods dependencies on first clone or after updating native deps.

First time — install CocoaPods via Bundler:

```sh
bundle install
```

Then, and whenever native dependencies change:

```sh
bundle exec pod install
```

For more information, see the [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, the app runs in the Android Emulator, iOS Simulator, or a connected device. You can also build directly from Android Studio or Xcode.

### Step 3: Modify your app

Open `App.tsx`, make changes, and save — [Fast Refresh](https://reactnative.dev/docs/fast-refresh) updates the app automatically.

To force a full reload:

- **Android**: Press <kbd>R</kbd> twice or select **"Reload"** from the **Dev Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> on Windows/Linux, <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> on macOS).
- **iOS**: Press <kbd>R</kbd> in the iOS Simulator.

### Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

**Now what?**

- Add this code to an existing app → [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps)
- Learn more about React Native → [docs](https://reactnative.dev/docs/getting-started)

---

## Cursor AI Agent Systems

This repo ships **two** agentic "software factory" systems for Cursor. Each is a set of specialized agents that do one job, write output to a file, then stop and hand off to the next agent (a human approves each step).

| System | Folder | Stack | Agents | E2E | Full guide |
| ------ | ------ | ----- | ------ | --- | ---------- |
| **React Native** | `.cursor/` | RN + TypeScript | 22 (00–20 + Ponytail) | Detox | [`.cursor/README.md`](.cursor/README.md) · [cheat sheet](.cursor/USAGE.md) |
| **Next.js** | `.cursornext/` | Next.js + TypeScript | 21 (00–20) | Playwright | [`.cursornext/README.md`](.cursornext/README.md) |

Both systems share the **same workflow** — only the framework details differ. Pick the folder for your stack; the agents auto-load that folder's rules.

**Core principle:** One agent, one task, one stop. Each step is manual unless noted. Planning does **not** auto-call Coding.

### How triggering works

| Trigger type | Meaning |
| --- | --- |
| **Manual** | You must `@invoke` the agent |
| **Auto (hook)** | Runs without `@` when a shell event fires |
| **Always-on** | Behavioral rule applied to every chat |
| **Chained** | Setup scripts run when you invoke a parent agent |

| Trigger | React Native | Next.js |
| --- | --- | --- |
| **Always-on** | Agent 21 Ponytail (`alwaysApply: true`) | Same Ponytail rule in `.cursornext/agents/agent-21-ponytail.md` |
| **Auto (hook)** | Agent 17 after `npm install` / `npm ci` | Agent 18 after `npm install` / `npm ci` |
| **Chained by Scaffold** | Agent 08 → fetch, useForm, error pages (18), keyboard (20) | Agent 08 → fetch, useForm, error pages (19); Agent 14 monorepo → same |
| **Chained by Socket** | Agent 19 → keyboard (20) first | Agent 20 socket setup (no keyboard agent) |
| **Manual only** | All other agents | All other agents |

### HTTP client: fetch over axios

New projects scaffold a **dependency-free `fetch` client** (`src/lib/fetch-client.ts`) instead of axios:

- **Project-owned** — full control, easy to audit and extend; no black-box HTTP library.
- **Zero dependencies** — no transitive CVEs or version bumps to chase.
- **Axios-compatible shape** — `{ data, status, ... }` responses and `error.response` errors, so existing `.then()/.catch()` service code keeps working.
- **Install:** `pnpm setup:fetch` (Next.js) or `node .cursor/scripts/setup-fetch.js` (React Native). Invoke `@fetch-client-agent` to wire interceptors or migrate off axios.

### UI QA during development (React Native)

Static UI checks run **while you code** — no Detox or manual device testing required for this layer.

**Rule file:** [`.cursor/rules/ui-qa-checklist.mdc`](.cursor/rules/ui-qa-checklist.mdc) (auto-loads when editing `src/screens/**`, `src/components/**`, `Root.js`, `AppRouteConfig.js`).

**What it enforces from code:**

- Safe area, responsive scaling (`moderateScale`), status bar props
- Keyboard wrappers on forms, scroll/list patterns, pull-to-refresh wiring
- Navigation route validation, Android `BackHandler` on modals
- Touch targets, press hierarchy, text truncation, SVG over PNG
- Offline/error UI, toast positioning, platform shadow/elevation

**Who uses it:**

| When | How |
| ---- | --- |
| Implementing UI | `@coding-agent` loads the rule and logs **UI QA (code-level)** in the coding log |
| Editing UI in Cursor | Rule applies via glob when you open screen/component files |
| Before PR | `@pre-pr-validation-agent` runs Section 3.8 (UI static QA) on changed files |

**What it does not replace:** visual polish, scroll/gesture feel, multi-OS device matrix, keyboard overlap on every screen size — use `@testcases-agent` / `@detox-testing-agent` for those.

Full details: [`.cursor/README.md` § UI QA during development](.cursor/README.md).

---

## React Native vs Next.js

| Concern | React Native (`.cursor/`) | Next.js (`.cursornext/`) |
| ------- | ------------------------- | ------------------------ |
| Scaffold (Agent 08) | RN Community CLI → then `npm install` + `cd ios && pod install` | `create-next-app` → then `npm install` + `npm run dev` |
| Run the app | `npm run ios` / `npm run android` (Metro) | `npm run dev` (localhost:3000) |
| Structure | `src/screens/*`, `navigation/` (React Navigation) | `src/app/*` (App Router), Server/Client Components |
| Styling | styled-components + `react-native-size-matters` | styled-components + CSS, `next/image` |
| Figma assets (Agent 00) | SVG → `src/assets/icons`; PNG → Android `drawable/` + iOS `Images.xcassets/` | SVG → `src/assets/icons`; raster → `public/images/` |
| E2E (Agent 11) | **Detox** — `@detox-testing-agent`, needs **testing target** (iOS/Android) | **Playwright** — `@e2e-testing-agent`, needs **base URL** |
| Unit/component tests | Jest + React Native Testing Library | Jest/Vitest + React Testing Library |
| Figma token file | `.env` | `.env` |
| Rules folder | `react-native.mdc`, `figma-to-react-native.mdc`, **`ui-qa-checklist.mdc`**, `detox-testing.mdc` | `nextjs.mdc`, `figma-to-nextjs.mdc`, `e2e-testing.mdc` |
| E2E setup doc | [`docs/DETOX-INTEGRATION.md`](docs/DETOX-INTEGRATION.md) | [`.cursornext/docs/E2E-PLAYWRIGHT.md`](.cursornext/docs/E2E-PLAYWRIGHT.md) |
| Error pages (Agent 18/19) | Connection Lost + Unauthorized + NetInfo (`@error-pages-agent`) | Connection Lost + Unauthorized + browser online/offline (`@error-pages-agent`) |
| Socket (Agent 19) | WebSocket client + module scaffold (`@socket-agent`) | WebSocket client + feature scaffold (`@socket-agent`) |

**Same across both:** Planning (PRD), Coding, Documentation, Test Cases, Fixing, Code Scanning, Vulnerability, Pre-PR Validation, PR Orchestrator, Prompt Generator — and the "one agent, one task, one stop" contract.

### Agent numbering differences

| Capability | React Native (`.cursor/`) | Next.js (`.cursornext/`) |
| --- | --- | --- |
| E2E testing | Agent 11 `@detox-testing-agent` | Agent 11 `@e2e-testing-agent` |
| User story test cases | Agent 15 `@user-story-testcases-agent` | Agent 16 |
| Unit test analysis | Agent 16 `@unit-test-analysis-agent` | Agent 17 |
| npm audit auto-fix | Agent 17 `@npm-audit-auto-fix-agent` | Agent 18 |
| Error pages | Agent 18 `@error-pages-agent` | Agent 19 |
| Socket setup | Agent 19 `@socket-agent` | Agent 20 |
| Keyboard layout | Agent 20 `@keyboard-layout-agent` | *(not in Next.js kit)* |
| Monorepo scaffold | *(not in RN kit)* | Agent 14 `@monorepo-scaffold-agent` |
| Fetch client | Agent 14 `@fetch-client-agent` | Agent 15 |
| Ponytail behavior rule | Agent 21 (always-on) | Agent 21 (always-on) |

---

## Workflows

### Recommended order (both kits)

```
Scaffold (optional) → Figma → Prompt (optional) → Planning → Coding
  → useForm / Fetch / Error Pages / Socket / Keyboard (optional)
    → Docs → User Story TCs / Test Cases / Unit Test Analysis (optional)
      → E2E (Detox or Playwright) → Fixing
        → Code Scan → Vulnerability → npm Audit Auto-Fix (auto on install)
          → Pre-PR Validation → PR Orchestrator
```

### Job A — Integrate a NEW module

Run in order; review each output before the next. **P1** = minimum to ship; **P2/P3** = quality gates.

```
P1  1. @figma-analyzer       → design specs + exported assets
P1  2. @planning-agent       → PRD
P1  3. @coding-agent         → implementation
P3  4. @documentation-agent  → JSDoc/comments
P2  5. @testcases-agent      → test cases + test file
P2  6. E2E agent             → E2E run + results
P1  7. @fixing-agent         → fix failures
P3  8. @code-scanning-agent  → quality report
P3  9. @vulnerability-agent  → security report
P2 10. @pre-pr-validation-agent → READY / NOT READY
P2 11. @pr-orchestrator-agent   → PR document
```

> **Minimum path (designed feature):** `@figma-analyzer → @planning-agent → @coding-agent → @fixing-agent`. No design? Skip Figma and describe the feature to `@planning-agent`.

**Build a form (any project):** use `@useform-builder-agent` for validated forms (schema-based `useForm` hook; no Formik/yup). Installs the hook automatically if missing (`node .cursor/scripts/setup-useform.js`). See `.cursor/rules/useform-validation.mdc`.

### Job B — Fix bugs in an EXISTING module

```
P1  1. @fixing-agent          → reproduce + apply simple fixes (or test-and-fix by TC-ID)
P2  2. @planning-agent + @coding-agent  → only if the fix needs new/complex behavior
P2  3. @pre-pr-validation-agent → confirm READY
P2  4. @pr-orchestrator-agent   → PR document
```

The Fixing Agent has **two modes**:

- **Fix-only** — describe the bug; reads coding log + code, applies simple fixes.
- **Test-and-fix** — run tests, fix failures by TC-ID; needs a test-cases file + target (RN: iOS/Android; Next.js: base URL).

> If the Fixing Agent reports "**Requires Coding Agent**" (new feature / complex change), hand it to `@planning-agent` → `@coding-agent`, then re-validate.

---

## Agent reference

**Priority:** P1 = core path · P2 = recommended quality gates · P3 = optional/on-demand.

### Quick lookup (both stacks)

| Priority | Agent | Invoke | Output |
| -------- | ----- | ------ | ------ |
| P1 | Figma Analyzer | `@figma-analyzer` | `cache/figma-specs-{feature}.md` + assets |
| P1 | Planning | `@planning-agent` | `logs/prd-{feature}-{ts}.md` |
| P1 | Coding | `@coding-agent` | Source + `logs/coding/coding-{feature}.md` |
| P1 | Fixing | `@fixing-agent` | `logs/fixing/fixing-{feature}.md` |
| P2 | Test Cases | `@testcases-agent` | `logs/test-cases-{feature}.md` + test file |
| P2 | E2E Testing | `@detox-testing-agent` (RN) / `@e2e-testing-agent` (Next.js) | `logs/{detox,e2e}-testing/{feature}/{ts}/test-results.md` |
| P2 | Pre-PR Validation | `@pre-pr-validation-agent` | READY / NOT READY report |
| P2 | PR Orchestrator | `@pr-orchestrator-agent` | `logs/pr/pr-{feature}-{ts}.md` |
| P3 | Documentation | `@documentation-agent` | Documented code |
| P3 | Code Scanning | `@code-scanning-agent` | `logs/code-scanning/...` |
| P3 | Vulnerability | `@vulnerability-agent` | `logs/vulnerability/...` |
| P3 | Project Scaffold | `@project-scaffold-agent` | New project + boilerplate (incl. fetch client) |
| P3 | useForm Builder | `@useform-builder-agent` | Form (`useForm`) + `logs/coding/coding-{feature}.md` |
| P3 | Fetch Client | `@fetch-client-agent` | `src/lib/fetch-client.ts` wired (axios-free) |
| P3 | Error Pages | `@error-pages-agent` | Connection Lost + Unauthorized + NetworkGate |
| P3 | Socket Setup | `@socket-agent` | WebSocket infra + optional module scaffold |
| P3 | Prompt Generator | `@prompt-generator-agent` | Planning/project prompt |
| P3 | User Story Test Cases | `@user-story-testcases-agent` | `logs/test-cases-{feature}.md` |
| P3 | Unit Test Analysis | `@unit-test-analysis-agent` | Analysis report + Jest file |
| P3 | Keyboard Layout | `@keyboard-layout-agent` (RN only) | Keyboard layouts + log |
| P3 | Monorepo Scaffold | `@monorepo-scaffold-agent` (Next.js only) | Sibling pnpm monorepo + log |
| — | npm Audit Auto-Fix | `@npm-audit-auto-fix-agent` (auto on install) | `logs/vulnerability/npm-audit-auto-fix-{ts}.md` |
| — | Ponytail | *(no @)* | Always-on minimal-diff behavior |

### React Native agents (`.cursor/` — Agents 00–21)

| # | Agent | Invoke | Trigger | Input | Output | Does | Does not |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 00 | Figma Analyzer | `@figma-analyzer` | Manual | Feature name, Figma URL + node-id, Frame, Section | `cache/figma-specs-{feature}.md` + assets | Mobile specs, SVG/PNG export | PRD, code |
| 01 | Planning | `@planning-agent` | Manual | Prompt/specs path or description | `logs/prd-{feature}-{ts}.md` | PRD for RN | Code, tests |
| 02 | Coding | `@coding-agent` | Manual | PRD path | `src/...` + `logs/coding/coding-{feature}.md` | Implement from PRD, UI QA log | PRD, E2E |
| 03 | Documentation | `@documentation-agent` | Manual | Files or coding log | Documented files + optional doc log | JSDoc, comments | Change logic |
| 04 | Fixing | `@fixing-agent` | Manual | Feature/issue; for test mode: test-cases + iOS/Android target | `logs/fixing/fixing-{feature}.md` | Fix bugs; Jest/Detox test-and-fix | PRD, new features |
| 05 | Code Scanning | `@code-scanning-agent` | Manual | Feature or scope | `logs/code-scanning/...` | ESLint + quality checklist | Fix code |
| 06 | Vulnerability | `@vulnerability-agent` | Manual | Project root | `logs/vulnerability/...` | npm audit + Snyk report | Apply fixes |
| 07 | PR Orchestrator | `@pr-orchestrator-agent` | Manual | Feature name | `logs/pr/pr-{feature}-{ts}.md` | PR document | Submit/merge PR |
| 08 | Project Scaffold | `@project-scaffold-agent` | Manual (chains setup) | App name | Sibling RN project + scaffold log | CLI init + boilerplate + fetch/useForm/error/keyboard | `npm install`, ios/android |
| 09 | Prompt Generator | `@prompt-generator-agent` | Manual | Feature (A) or project name (B) | `cache/prompt-*.md` | Planning or scaffold prompt | PRD, code |
| 10 | Test Cases | `@testcases-agent` | Manual | Feature + PRD + coding log | `logs/test-cases-{feature}.md` + Jest file | Manual QA + Jest | Detox, fixes |
| 11 | Detox Testing | `@detox-testing-agent` | Manual | Feature + iOS/Android target | `logs/detox-testing/{feature}/{ts}/` | E2E run + artifacts | Fix code |
| 12 | Pre-PR Validation | `@pre-pr-validation-agent` | Manual | Git diff vs base (default `main`) | `logs/pre-pr/...` + READY/NOT READY | Review changed files only | Modify code |
| 13 | useForm Builder | `@useform-builder-agent` | Manual | Form name, fields, path | Form + coding log | Schema `useForm` forms | Formik/yup, PRD |
| 14 | Fetch Client | `@fetch-client-agent` | Manual / chained by 08 | Optional interceptors | `src/lib/fetch-client.ts` + log | axios-free HTTP client | Product features |
| 15 | User Story Test Cases | `@user-story-testcases-agent` | Manual | Feature + user story | `logs/test-cases-{feature}.md` | TCs from story alone | Code, Jest/Detox files |
| 16 | Unit Test Analysis | `@unit-test-analysis-agent` | Manual | Target screen/component | Analysis report + Jest file | Code-driven tests + bugs | Fix code, Detox |
| 17 | npm Audit Auto-Fix | `@npm-audit-auto-fix-agent` | **Auto** + manual | Project root | `logs/vulnerability/npm-audit-auto-fix-{ts}.md` | Semver-safe audit fix | `audit fix --force` |
| 18 | Error Pages | `@error-pages-agent` | Manual / chained by 08 | Optional `--force` | Connection Lost + Unauthorized + log | NetInfo offline gate | Auth flow |
| 19 | Socket Setup | `@socket-agent` | Manual (chains 20) | Intake: mode, module, design | Socket infra + intake + log | WebSocket + chat scaffold | PRD, skip UI QA |
| 20 | Keyboard Layout | `@keyboard-layout-agent` | Manual / chained by 08, 19 | Optional `--force` | Keyboard layouts + log | iOS/Android keyboard avoidance | PRD |
| 21 | Ponytail | *(no @)* | **Always-on** | Every chat | Behavior only | Minimal diff, reuse, YAGNI | Skip security/a11y when requested |

### Next.js agents (`.cursornext/` — Agents 00–20)

Agent **names** (`@coding-agent`, etc.) are the same; **numbers differ** for setup agents. Paths use `.cursornext/logs/` and `.cursornext/cache/`.

| # | Agent | Invoke | Trigger | Input | Output | Notes vs React Native |
| --- | --- | --- | --- | --- | --- | --- |
| 00 | Figma Analyzer | `@figma-analyzer` | Manual | Feature, URL, Frame, Section | `cache/figma-specs-{feature}.md` | Web frame; raster → `public/images/` |
| 01 | Planning | `@planning-agent` | Manual | Prompt/specs/description | `logs/prd-{feature}-{ts}.md` | Server/Client component boundaries in PRD |
| 02 | Coding | `@coding-agent` | Manual | PRD path | `src/...` + coding log | App Router, styled-components |
| 03 | Documentation | `@documentation-agent` | Manual | Files or coding log | Documented files | Same contract |
| 04 | Fixing | `@fixing-agent` | Manual | Feature/issue; test mode needs **base URL** | `logs/fixing/fixing-{feature}.md` | Playwright instead of Detox |
| 05 | Code Scanning | `@code-scanning-agent` | Manual | Feature or scope | `logs/code-scanning/...` | Next.js checklist |
| 06 | Vulnerability | `@vulnerability-agent` | Manual | Project root | `logs/vulnerability/...` | Document only |
| 07 | PR Orchestrator | `@pr-orchestrator-agent` | Manual | Feature name | `logs/pr/pr-{feature}-{ts}.md` | Same contract |
| 08 | Project Scaffold | `@project-scaffold-agent` | Manual (chains setup) | App name | Sibling Next.js app + log | `create-next-app`; chains fetch, useForm, error pages |
| 09 | Prompt Generator | `@prompt-generator-agent` | Manual | Feature (A) or project (B) | `cache/prompt-*.md` | Same modes |
| 10 | Test Cases | `@testcases-agent` | Manual | Feature + PRD + coding log | Test cases + `__tests__/*.test.tsx` | RTL component tests |
| 11 | Playwright E2E | `@e2e-testing-agent` | Manual | Feature + **base URL** | `logs/e2e-testing/{feature}/{ts}/` | **Not** `@detox-testing-agent` |
| 12 | Pre-PR Validation | `@pre-pr-validation-agent` | Manual | Git diff vs base | `logs/pre-pr/...` + verdict | Same contract |
| 13 | useForm Builder | `@useform-builder-agent` | Manual | Form, fields, path | Form + coding log | Same `useForm` pattern |
| 14 | Monorepo Scaffold | `@monorepo-scaffold-agent` | Manual | Monorepo name, apps/packages | Sibling pnpm monorepo + log | **Next.js only** |
| 15 | Fetch Client | `@fetch-client-agent` | Manual / chained by 08, 14 | Optional target/interceptors | `src/lib/fetch-client.ts` + log | `NEXT_PUBLIC_API_BASE_URL` |
| 16 | User Story Test Cases | `@user-story-testcases-agent` | Manual | Feature + user story | `logs/test-cases-{feature}.md` | RN Agent 15 equivalent |
| 17 | Unit Test Analysis | `@unit-test-analysis-agent` | Manual | Target page/component | Analysis + Jest file | RN Agent 16 equivalent |
| 18 | npm Audit Auto-Fix | `@npm-audit-auto-fix-agent` | **Auto** + manual | Project root | `logs/vulnerability/npm-audit-auto-fix-{ts}.md` | RN Agent 17 equivalent |
| 19 | Error Pages | `@error-pages-agent` | Manual / chained by 08, 14 | Optional `ERROR_PAGES_TARGET` | Connection Lost + Unauthorized | Browser online/offline (no NetInfo) |
| 20 | Socket Setup | `@socket-agent` | Manual | Intake: mode, module, design | Socket infra + intake + log | No keyboard layout agent |
| 21 | Ponytail | *(no @)* | **Always-on** | Every chat | Behavior only | Same lazy-senior-dev rule |

### Output locations (both kits)

| Agent ran | React Native path | Next.js path |
| --- | --- | --- |
| Figma Analyzer | `.cursor/cache/figma-specs-{feature}.md` | `.cursornext/cache/figma-specs-{feature}.md` |
| Planning | `.cursor/logs/prd-{feature}-{ts}.md` | `.cursornext/logs/prd-{feature}-{ts}.md` |
| Coding | `.cursor/logs/coding/coding-{feature}.md` | `.cursornext/logs/coding/coding-{feature}.md` |
| Fixing | `.cursor/logs/fixing/fixing-{feature}.md` | `.cursornext/logs/fixing/fixing-{feature}.md` |
| Test cases | `.cursor/logs/test-cases-{feature}.md` | `.cursornext/logs/test-cases-{feature}.md` |
| E2E results | `.cursor/logs/detox-testing/...` | `.cursornext/logs/e2e-testing/...` |
| Pre-PR | `.cursor/logs/pre-pr/...` | `.cursornext/logs/pre-pr/...` |
| PR doc | `.cursor/logs/pr/...` | `.cursornext/logs/pr/...` |
| npm audit auto-fix | `.cursor/logs/vulnerability/npm-audit-auto-fix-{ts}.md` | `.cursornext/logs/vulnerability/npm-audit-auto-fix-{ts}.md` |

---

## Examples

### React Native — new module (profile-card)

```
@figma-analyzer
Feature name: profile-card
Mobile URL: https://www.figma.com/design/ABC123/App?node-id=10-8700
Mobile Frame: M_Profile_Card
Section: Profile card – avatar, name, stats, action buttons
```

```
@planning-agent
Plan feature: profile-card from .cursor/cache/figma-specs-profile-card.md
```

```
@coding-agent
Implement PRD from .cursor/logs/prd-profile-card-20260615-120000.md
```

```
@fixing-agent
Test profile-card.
Testing target: Android Emulator
```

### React Native — auth flow

```
@figma-analyzer
Feature name: auth-login
Mobile URL: https://www.figma.com/design/ABC123/App?node-id=8-6335
Mobile Frame: M_Login_Screen
Section: Login screen with email, password, and CTA
```

```
@planning-agent
Plan feature auth-login from .cursor/cache/figma-specs-auth-login.md
```

```
@coding-agent
Implement PRD from .cursor/logs/prd-auth-login-20260630-143000.md
```

```
@project-scaffold-agent
FitnessTracker
```

```bash
npm install
# → Agent 17 runs automatically via afterShellExecution hook
```

```
@socket-agent
Setup mode: new-module
Module name: Chat
Design source: figma
WebSocket URL: wss://api.example.com/ws
```

### React Native — useForm

```
@useform-builder-agent

Form: login
Fields: email (required), password (required, min 6)
Path: src/screens/Login
```

→ Creates `src/screens/Login/index.tsx` + `style.ts` using `useForm`, with `ALERTS`-based validation and a service-layer submit.

### React Native — fix bugs

```
@fixing-agent
Fix profile-card: avatar overflows its container on small screens, and the
follow button has no press feedback.
```

```
@fixing-agent
Test profile-card.
Testing target: iOS Simulator
```

### Next.js — new module (pricing-section)

```
@figma-analyzer
Feature name: pricing-section
URL: https://www.figma.com/design/ABC123/Web?node-id=22-140
Frame: Pricing_Section
Section: Pricing section – plan cards, toggle, CTA
```

```
@planning-agent
Plan feature: pricing-section from .cursornext/cache/figma-specs-pricing-section.md
```

```
@coding-agent
Implement PRD from .cursornext/logs/prd-pricing-section-20260615-120000.md
```

```
@fixing-agent
Test pricing-section.
Base URL: http://localhost:3000
```

```
@project-scaffold-agent
MyDashboard
```

```
@e2e-testing-agent
Run E2E for pricing-section
Base URL: http://localhost:3000
```

```
@monorepo-scaffold-agent
Create monorepo AcmePlatform with apps web and admin
```

### Next.js — fix bugs

```
@fixing-agent
Fix pricing-section: monthly/yearly toggle does not update prices, and the
CTA button is missing a data-testid.
```

```
@fixing-agent
Test pricing-section.
Base URL: http://localhost:3000
```

> For copy-paste examples for **every** agent, see [`.cursor/USAGE.md`](.cursor/USAGE.md) (React Native) and [`.cursornext/README.md`](.cursornext/README.md) (Next.js).

---

## Rules, docs & scripts

### Rules (auto-applied by Cursor)

- **React Native** (`.cursor/rules/`): `agent-workflow-rules.mdc`, `react-native.mdc`, `figma-to-react-native.mdc`, `ui-qa-checklist.mdc`, `detox-testing.mdc`, `coding-standards.md`.
- **Next.js** (`.cursornext/rules/`): `agent-workflow-rules.mdc`, `nextjs.mdc`, `figma-to-nextjs.mdc`, `e2e-testing.mdc`, `coding-standards.md`.

### Reference docs

| Doc | Purpose |
| --- | ------- |
| [`.cursor/README.md`](.cursor/README.md) | Full React Native agent-system guide |
| [`.cursornext/README.md`](.cursornext/README.md) | Full Next.js agent-system guide |
| [`docs/DETOX-INTEGRATION.md`](docs/DETOX-INTEGRATION.md) | RN Detox E2E setup (iOS + Android native wiring, troubleshooting, checklist) |
| [`.cursornext/docs/E2E-PLAYWRIGHT.md`](.cursornext/docs/E2E-PLAYWRIGHT.md) | Next.js Playwright E2E setup (config, specs, troubleshooting, checklist) |
| [`.cursor/TOKEN-USAGE.md`](.cursor/TOKEN-USAGE.md) | Tips to reduce Cursor token usage |
| [`.cursor/USAGE.md`](.cursor/USAGE.md) | One-page command cheat sheet (React Native) |

### Setup scripts

| Script | React Native — used by | Next.js — used by |
| --- | --- | --- |
| `setup-fetch.js` | Agents 08, 14 | Agents 08, 14, 15 |
| `setup-useform.js` | Agents 08, 13 | Agents 08, 13, 14 |
| `setup-error-pages.js` | Agents 08, 18 | Agents 08, 14, 19 |
| `setup-keyboard-layout.js` | Agents 08, 19, 20 | — |
| `setup-socket.js` | Agent 19 | Agent 20 |
| `setup-monorepo.js` | — | Agent 14 |
| `npm-audit-auto-fix.js` | Agent 17 (hook + manual) | Agent 18 (hook + manual) |

Run from project root:

```sh
# React Native (.cursor) — token in .env; PNG → Android drawable + iOS Images.xcassets
node .cursor/scripts/setup-fetch.js
node .cursor/scripts/setup-useform.js
node .cursor/scripts/setup-error-pages.js
node .cursor/scripts/setup-keyboard-layout.js
node .cursor/scripts/setup-socket.js
node .cursor/scripts/export-figma-svg.js <feature> <nodeId> [fileKey]
node .cursor/scripts/export-figma-png.js <nodeId> <android_name> <IosImageSet> [fileKey]

# Next.js (.cursornext) — token in .env; raster → public/images
node .cursornext/scripts/setup-fetch.js
node .cursornext/scripts/setup-socket.js
node .cursornext/scripts/setup-monorepo.js
node .cursornext/scripts/export-figma-svg.js <feature> <nodeId> [fileKey] [outFile]
node .cursornext/scripts/export-figma-png.js <nodeId> <output-name> <fileKey> [scale]
```

Figma export scripts require `FIGMA_ACCESS_TOKEN` in `.env`.

### E2E commands

```sh
# React Native (Detox) — this project
npm run e2e:build:android && npm run e2e:android   # emulator
npm run e2e:build:ios && npm run e2e:ios           # simulator
npm run e2e:android:attached                       # physical device
node scripts/collect-detox-artifacts.js {feature}  # collect failure screenshots/videos → logs

# Next.js (Playwright) — when used in a Next.js project
npm run e2e                                          # all specs
npx playwright test e2e/{feature}.spec.ts            # single spec
```

---

## Troubleshooting & Learn More

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

To learn more about React Native:

- [React Native Website](https://reactnative.dev) — learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) — an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) — a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) — read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) — the Open Source GitHub **repository** for React Native.
