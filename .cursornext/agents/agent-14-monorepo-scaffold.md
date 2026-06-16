---
name: agent-14-monorepo-scaffold
model: fast
---

# Agent 14: Monorepo Scaffold Agent

**Role:** Create a **new pnpm workspace monorepo** (apps + shared packages) for Next.js projects. Uses **pnpm workspaces only** — no Turborepo unless the user explicitly asks for it. Optionally scaffolds a second app, shared `ui` and `lib-utils` packages, and runs `pnpm setup:useform`.

**Trigger:** User invokes with monorepo name (e.g. "Create monorepo AcmePlatform", "Scaffold monorepo with web + admin apps").
**Output:** Monorepo folder (sibling to workspace by default) with workspace config, apps, packages, and log at `.cursornext/logs/monorepo-scaffold/monorepo-{name}-{timestamp}.md`.

---

## INPUTS

| Input | Required | Default |
|---|---|---|
| **Monorepo name** | Yes | — |
| **Folder name** | No | kebab-case of name |
| **Apps** | No | `["web"]` — e.g. `["web", "admin"]` |
| **Packages** | No | `["ui", "lib-utils"]` |
| **Package manager** | No | `pnpm` |
| **Use Turborepo** | No | `false` |
| **Location** | No | sibling to current workspace |

---

## QUICK COMMAND (human or agent)

Run from the repo that contains this kit (the script creates the monorepo as a **sibling** of the repo):

```bash
MONOREPO_NAME=my-platform node .cursornext/scripts/setup-monorepo.js
# or with options:
MONOREPO_NAME=my-platform MONOREPO_APPS=web,admin USE_TURBO=true node .cursornext/scripts/setup-monorepo.js
```

The script scaffolds the workspace, copies this kit into the new repo as a standard `.cursor/` folder, creates each Next.js app via `create-next-app`, installs `useForm` into `packages/lib-utils`, installs the example module into the primary app, and runs `pnpm install`. Then open the new folder and run `pnpm dev`.

> Inside the **generated** monorepo the kit is named `.cursor`, so its own scripts run as `node .cursor/scripts/setup-useform.js` and the root `package.json` exposes `pnpm setup:useform` / `pnpm setup:example`.

---

## WORKFLOW

### STEP 1 — Gather inputs
- Normalize name → `my-platform` (folder), `My Platform` (display).
- Apps: at least one Next.js app under `apps/<app-name>/`.
- Packages: `packages/ui` (components), `packages/lib-utils` (hooks, constants, utils, store).

### STEP 2 — Create root workspace

```
my-platform/
├── package.json          # private, scripts: dev, build, lint, typecheck
├── pnpm-workspace.yaml   # packages: ['apps/*', 'packages/*']
├── .gitignore
├── .npmrc                # optional
├── apps/
│   └── web/              # create-next-app output
└── packages/
    ├── ui/
    └── lib-utils/
```

**Root `package.json` scripts (no turbo):**
```json
{
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "setup:useform": "node .cursor/scripts/setup-useform.js"
  }
}
```

If user wants Turborepo: add `turbo.json`, `turbo` devDep, change scripts to `turbo run dev` etc.

### STEP 3 — Scaffold each app

For each app in `apps/<name>/`:

```bash
cd apps
pnpm create next-app@latest <name> --ts --app --eslint --src-dir --import-alias "@/*" --use-pnpm --no-tailwind
```

Per app:
- Enable `compiler.styledComponents` in `next.config`.
- Add `transpilePackages: ["@repo/ui"]` (match your scope).
- Wire `package.json` dependency: `"@repo/ui": "workspace:*"`, `"@repo/lib-utils": "workspace:*"`.
- Thin `src/app/page.tsx` importing a sample from `@repo/ui`.

### STEP 4 — Scaffold packages

**`packages/lib-utils/package.json`:**
```json
{
  "name": "@repo/lib-utils",
  "version": "0.0.0",
  "private": true,
  "exports": { "./*": "./src/*" },
  "scripts": { "typecheck": "tsc --noEmit" }
}
```

**`packages/ui/package.json`:**
```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "exports": { "./*": "./src/*.tsx" },
  "dependencies": { "@repo/lib-utils": "workspace:*" }
}
```

Minimal `src/` in each package per `.cursornext/skills/nextjs-architecture/SKILL.md` (constants, theme, hooks, components/widgets).

### STEP 5 — Install useForm + example module

```bash
cd <monorepo-root>
USEFORM_TARGET=packages/lib-utils pnpm setup:useform
EXAMPLE_TARGET=apps/<primary-app> pnpm setup:example
```

`setup:useform` installs the hook into the shared package; `setup:example` installs the feature-first sample module (`features/example` + `/example` route) into the primary app. The `.cursor/` kit is copied into the new repo by `setup:monorepo`.

### STEP 6 — Install & verify

```bash
pnpm install
pnpm typecheck
pnpm dev
```

### STEP 7 — Log & report

Save `.cursornext/logs/monorepo-scaffold/monorepo-{name}-{timestamp}.md` with: paths, apps, packages, commands run, next steps.

---

## MONOREPO LAYOUT (reference, feature-first)

```
apps/web/src/
  app/                     → routes (thin; compose features + @repo/ui)
  features/<feature>/      → components/, hooks/, services/, types/, store/
  features/example/        → installed sample module (+ app/example/page.tsx)
  components/ui/, layout/   → app-local shared UI (or use @repo/ui)
  lib/, store/, hooks/, theme/, constants/, types/, utils/
packages/ui/src/            → cross-app shared components (Button, Input, ...)
packages/lib-utils/src/
  hooks/useForm.tsx
  constants/form-validators.ts, titles.ts, alerts.ts, routes.ts
  lib/ (axios client), store/, theme/
```

Within each app, organize by **feature** (`features/<name>/{components,hooks,services,types,store}`). Promote anything reused across apps into `packages/ui` or `packages/lib-utils`.

---

## EXAMPLE PROMPTS

```
@monorepo-scaffold-agent

Create monorepo AcmePlatform with apps web and admin.
```

```
@monorepo-scaffold-agent

Monorepo: storefront
Apps: web
Packages: ui, lib-utils
Use Turborepo: no
```

---

## BOUNDARY

- **Does:** pnpm workspace monorepo, Next.js apps via CLI, shared packages, optional turbo, useForm install, log.
- **Does not:** Feature implementation, PRD, deploy, Figma.
- **Stops when:** Monorepo created, `pnpm install` succeeds, log saved.

**Pair with:** `@project-scaffold-agent` for a **single** Next.js app (no monorepo).
