# Next.js Architecture Skill (Vibe Engineering)

Reference for Planning and Coding agents. Adapt paths to your project. Target: **Next.js 14+ (App Router) + TypeScript**.

## App Structure

```
src/
├── app/                   # App Router: routes, layouts, pages, route handlers
│   ├── layout.tsx         # Root layout (html/body, providers, fonts)
│   ├── page.tsx           # Home route (/)
│   ├── globals.css        # Global styles / CSS reset / theme variables
│   ├── (group)/           # Route groups for organization
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   └── api/               # Route handlers (route.ts) for server endpoints
│       └── health/route.ts
├── components/
│   ├── layouts/           # Layout/structural components (Header, Footer, Sidebar, Modal)
│   │   └── ComponentName/
│   │       ├── index.tsx
│   │       └── styles.ts
│   └── widgets/           # Reusable UI (Button, Input, Card, Badge)
│       └── WidgetName/
│           ├── index.tsx
│           └── styles.ts
├── constants/             # App constants and i18n keys
│   ├── titles.ts          # TITLES (static UI copy / i18n keys)
│   ├── alerts.ts          # ALERTS (error/toast messages / i18n keys)
│   ├── routes.ts          # ROUTES (path constants for navigation)
│   ├── keys.ts
│   └── index.ts           # Re-export all
├── theme/                 # Design system tokens
│   ├── colors.ts          # COLORS object (no hex in component styles)
│   ├── typography.ts      # TYPOGRAPHY / FONTS (font family, size, weight)
│   ├── spacing.ts         # spacing scale
│   └── index.ts           # theme object for styled-components ThemeProvider
├── hooks/                 # Custom hooks (e.g. useDebounce, useMediaQuery)
├── services/              # Business logic + API calls (auth.service.ts, home.service.ts)
├── lib/                   # Dependency-free fetch HTTP client (axios-free)
│   └── fetch-client.ts    # http instance + interceptors (axios-like response/error)
├── api/                   # API path constants
│   └── apiPaths.ts        # API_PATHS endpoint constants
├── store/                 # Redux Toolkit by domain (slices)
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── commonSlice.ts
│   ├── hooks.ts           # typed useAppDispatch / useAppSelector
│   └── index.ts           # configureStore
├── types/                 # TypeScript type definitions ([module].types.ts)
├── utils/                 # Helpers (formatters, validators); re-export via index.ts
├── styles/                # Shared styled-components (commonStyles.ts), global theme
└── assets/
    └── icons/             # SVG icon React components (index.tsx -> Icons object)

public/
└── images/                # Static raster assets (png/webp) served via next/image
```

## Path Aliases (tsconfig paths)

Use these in imports; do not use deep relative paths. Configure in `tsconfig.json` `compilerOptions.paths` (Next.js default uses `@/*` → `./src/*`).

| Alias          | Path                       |
|----------------|----------------------------|
| `@/*`          | `./src/*`                  |
| `@/components` | `./src/components`         |
| `@/app`        | `./src/app`                |
| `@/constants`  | `./src/constants`          |
| `@/theme`      | `./src/theme`              |
| `@/store`      | `./src/store`              |
| `@/services`   | `./src/services`           |
| `@/api`        | `./src/api`                |
| `@/hooks`      | `./src/hooks`              |
| `@/utils`      | `./src/utils`              |
| `@/types`      | `./src/types`              |
| `@/assets`     | `./src/assets`             |
| `@/layouts`    | `./src/components/layouts` |
| `@/widgets`    | `./src/components/widgets` |

Example: `import { COLORS } from '@/theme/colors';`
Example: `import { Button } from '@/widgets/Button';`
Example: `import { login } from '@/store/slices/authSlice';`

## Design System

- **Colors:** Export a `COLORS` object from `theme/colors.ts`. Use only `COLORS.xxx` in styles; no raw hex in component/style files. Use `UPPERCASE_SNAKE_CASE` keys (e.g. `COLORS.PRIMARY`, `COLORS.TEXT_PRIMARY`).
- **Typography:** Export `TYPOGRAPHY` (or `FONTS`) from `theme/typography.ts` with fontFamily, fontSize, and **fontWeight** tokens. Use them in styles; no hardcoded font values when a token exists.
- **Spacing:** Export a spacing scale from `theme/spacing.ts` (e.g. `SPACING.SM`, `SPACING.MD`, `SPACING.LG`). Use rem-based units for responsive scaling.
- **Shared styles:** `styles/commonStyles.ts` — styled-components shared across the app (Container, Row, Center, etc.). If a style pattern repeats more than 3 times, extract it here.
- **Theme provider:** Compose tokens into a `theme` object in `theme/index.ts` and pass to styled-components `ThemeProvider` in the root layout (with the registry for SSR).

## Styling (styled-components)

- Use **styled-components** for component styling; separate styles into a `styles.ts` file per component/screen.
- Define styled components, then export as a single named object: `export const ComponentNameStyles = { Container, Title }`.
- Import as `import { ComponentNameStyles } from './styles'` and use as `ComponentNameStyles.Container` — never destructure.
- **Never** use inline `style={{ ... }}`; always create a styled component.
- Use theme tokens via props: `${({ theme }) => theme.colors.PRIMARY}` or import `COLORS` directly.
- For SSR, add `styled-components` registry (`StyledComponentsRegistry`) in the root layout and enable the SWC plugin in `next.config.js` (`compiler: { styledComponents: true }`).
- **Alternative styling:** CSS Modules (`*.module.css`) or Tailwind are acceptable if the project standard differs; keep it consistent project-wide.

## Server vs Client Components

- **Server Components by default** (no `'use client'`): data fetching, no hooks/state/effects, no browser APIs. Prefer for pages, layouts, and static UI.
- **Client Components** (`'use client'` at top of file): interactivity (useState/useEffect, event handlers), browser APIs, styled-components, Redux hooks, context.
- Keep `'use client'` at the leaves; do not mark whole pages client unless needed. Fetch data in Server Components or route handlers; pass to Client Components via props.

## Data Fetching & Services

- Server Components: fetch directly (async component with `fetch`/server SDK) using `cache`/`revalidate` options.
- Client/shared logic: use `services/` which call the dependency-free fetch client `http` in `lib/fetch-client.ts` (axios-free); use `API_PATHS` from `api/apiPaths.ts`. Components/pages call services, never the client directly.
- Use optional chaining (`obj?.value`) for API responses.

## File and Folder Conventions

- **Components:** One folder per component. Named export from `index.tsx`; styles in `styles.ts`. Import: `import { ComponentName } from '@/components/layouts/ComponentName'`.
- **Routes:** App Router files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`). Route folder names are lowercase (URL segments).
- **Naming:** PascalCase for components; camelCase for hooks/utilities; `*.types.ts` for types. Style file: `styles.ts`.
- **Store:** Redux Toolkit slices in `store/slices/`; `configureStore` in `store/index.ts`; typed hooks in `store/hooks.ts`.

## Patterns

- Functional components + hooks only. TypeScript everywhere (`.ts`/`.tsx`).
- State: `useState`/`useReducer` (local UI), Redux Toolkit (shared/app state) via typed hooks.
- Lists: virtualize large lists (e.g. `@tanstack/react-virtual`) when needed.
- Images: use `next/image` for raster assets in `public/`; SVGs as React components from `@/assets/icons`.
- Error handling: optional chaining (`obj?.value`); error boundaries (`error.tsx`) for routes.
- a11y: semantic HTML, `aria-*`, labels for inputs, focus management; visible focus states.
- SEO: per-route `metadata` export (or `generateMetadata`) in App Router.

## Navigation

- Use App Router file-based routing. Navigate with `next/link` (`<Link href={ROUTES.DASHBOARD}>`) and `useRouter`/`redirect` from `next/navigation`. Define path constants in `constants/routes.ts`; never hardcode route strings.

## Figma → Next.js

- Map Figma colors to `COLORS` tokens; map typography to `TYPOGRAPHY` (fontFamily + fontSize + **fontWeight**).
- Figma Frame → `<div>`/section or layout component; Auto Layout → flexbox/grid (`display: flex`, `gap`).
- Effects: box-shadow for shadows; border-radius; opacity.
- SVG icons → `src/assets/icons` (as React components); raster images → `public/images` (via `next/image`).
- Save Figma specs to `.cursornext/cache/figma-specs-{feature}.md` via Figma Analyzer.

Update this SKILL when your project structure or design system changes.
