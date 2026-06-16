# Monorepo scaffold templates

Used by `node .cursornext/scripts/setup-monorepo.js` and **@monorepo-scaffold-agent**. (Inside a generated repo the same script is exposed as `pnpm setup:monorepo`.)

## Default layout (pnpm workspaces, no Turborepo)

```
<monorepo-name>/
├── package.json
├── pnpm-workspace.yaml
├── apps/
│   └── web/                 # Next.js (create-next-app)
└── packages/
    ├── ui/                  # @repo/ui — components & screens
    └── lib-utils/           # @repo/lib-utils — hooks, constants, services, store
```

## Create a monorepo

**CLI (run from the repo that contains this kit; the monorepo is created as a sibling):**

```bash
MONOREPO_NAME=my-platform node .cursornext/scripts/setup-monorepo.js
MONOREPO_NAME=my-platform MONOREPO_APPS=web,admin node .cursornext/scripts/setup-monorepo.js
MONOREPO_NAME=my-platform USE_TURBO=true node .cursornext/scripts/setup-monorepo.js
```

**Agent:**

```
@monorepo-scaffold-agent

Create monorepo AcmePlatform with apps web and admin.
```

## After scaffold

```bash
cd ../my-platform
pnpm install
USEFORM_TARGET=packages/lib-utils pnpm setup:useform
pnpm dev
```

Copy the `.cursor/` agent kit into the new repo if it was not copied automatically.

## Optional Turborepo

Set `USE_TURBO=true` to add `turbo.json` and turbo-based root scripts. Default is **pnpm workspaces only** (simpler, no turbo dependency).
