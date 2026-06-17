# Example module template

A complete, runnable **feature-first** module the scaffold installs into a project. It demonstrates the standard feature anatomy and the `useForm` hook.

## Installed layout

```
src/features/example/
├── components/
│   ├── ExampleForm/   index.tsx + styles.ts   (uses @/hooks/useForm)
│   └── ExampleList/   index.tsx + styles.ts
├── hooks/             useExample.ts            (data hook; service-backed)
├── services/          example.service.ts       (mock; swap for @/lib/fetch-client)
├── types/             example.types.ts
└── store/             exampleSlice.ts          (optional Redux Toolkit slice)

src/app/example/
└── page.tsx           route at /example composing the feature
```

## Install

```bash
pnpm setup:example                 # → src/features/example + src/app/example
pnpm setup:example -- --force      # overwrite existing files
```

Source → destination mapping is handled by `.cursor/scripts/setup-example.js`:

| Template | Installed to |
|----------|--------------|
| `feature/**` | `src/features/example/**` |
| `app/page.tsx` | `src/app/example/page.tsx` |

## Requirements

- `@/*` path alias → `./src/*` (create-next-app default).
- `styled-components` installed.
- The `useForm` hook present (`pnpm setup:useform`). `setup:example` reminds you if it's missing.

## Use it as a blueprint

Copy `features/example/` to `features/<your-feature>/`, rename symbols, and:
- Replace the mock `example.service.ts` with real calls via `@/lib/fetch-client` (the dependency-free, axios-free HTTP client).
- Register `exampleSlice` in `@/store` if you want Redux instead of local state.
- Move any UI that a second feature needs into `@/components/ui`.
