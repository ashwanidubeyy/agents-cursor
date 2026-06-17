# Coding Standards (Next.js Vibe Engineering)

Use in conjunction with agent-workflow and figma-to-nextjs rules.

## General

- Self-documenting names; clear comments for complex logic only; small, focused functions.
- DRY: extract to utils, components (widgets/layouts); reuse COLORS, TYPOGRAPHY, commonStyles from theme/styles.
- Error handling: use optional chaining (`obj?.value`, `data?.items?.length`) for safe access.
- TypeScript everywhere (`.ts`/`.tsx`); avoid `any` where a type can be defined.
- Import order: React/Next → third-party → aliased modules (`@/theme`, `@/store`, `@/components`, `@/services`, `@/utils`) → relative (`./styles`).

## Project Structure

- **src/app** — App Router routes (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`).
- **src/components/layouts** — Structural components (Header, Footer, Sidebar, Modal, Card sections).
- **src/components/widgets** — Reusable UI (Button, Input, Badge, Avatar).
- **src/theme** — colors.ts (COLORS), typography.ts (TYPOGRAPHY/FONTS), spacing.ts, index.ts (theme object).
- **src/constants** — titles.ts (TITLES), alerts.ts (ALERTS), routes.ts (ROUTES), keys.ts, index.ts.
- **src/services** — Business logic + API calls; components/pages call services, not the HTTP client directly.
- **src/lib** — fetch-client.ts (dependency-free HTTP client, axios-free; `http` + interceptors).
- **src/api** — apiPaths.ts (API_PATHS) only.
- **src/store** — Redux Toolkit slices (`slices/`), `index.ts` (configureStore), `hooks.ts` (typed hooks).
- **src/hooks** — Custom hooks (`useXxx`).
- **src/types** — Type definitions (`[module].types.ts`); re-export via index.ts.
- **src/utils** — Helpers; re-export via index.ts.
- **src/styles** — commonStyles.ts (shared styled-components), global theme helpers.
- **src/assets/icons** — SVG icon React components (`index.tsx` → `Icons` object).
- **public/images** — Static raster assets (png/webp) used via `next/image`.

## Path Aliases

Use aliases instead of deep relative paths: `@/theme`, `@/store`, `@/components`, `@/layouts`, `@/widgets`, `@/services`, `@/api`, `@/constants`, `@/hooks`, `@/utils`, `@/types`, `@/assets`. Example: `import { COLORS } from '@/theme/colors';` `import { Button } from '@/widgets/Button';`

## File Naming

- Components: PascalCase folder and component name (e.g. `Header/`, `Button/`).
- Entry file: `index.tsx`; co-located styles: `styles.ts`.
- Routes: lowercase folder = URL segment; App Router special files (`page.tsx`, `layout.tsx`).
- Utilities/constants/hooks: camelCase (e.g. `formatDate.ts`, `useDebounce.ts`); types: `[module].types.ts`.

## Server vs Client Components

- **Server Components by default.** Use for pages, layouts, static UI, and data fetching. No hooks, state, effects, or browser APIs.
- **Client Components** (`'use client'`): only when you need interactivity (useState/useEffect/handlers), browser APIs, styled-components, Redux hooks, or context.
- Keep `'use client'` at the leaves; fetch data server-side and pass via props where possible.

## Components

- Functional components with hooks only. Strongly typed props (define prop interfaces in `@/types` for reusable components).
- One component per folder: `ComponentName/index.tsx` (named export) + `ComponentName/styles.ts`.
- Use styled-components from `styles.ts`; reference COLORS and TYPOGRAPHY from theme (no hardcoded hex or font values).
- Accessibility: semantic HTML, `aria-*`, label inputs, keyboard navigation, visible focus.

## Styling (styled-components)

- Colors: always `COLORS.xxx` from `@/theme/colors` (e.g. `COLORS.PRIMARY`, `COLORS.BACKGROUND`). No raw hex in style files.
- Typography: `TYPOGRAPHY`/`FONTS` from `@/theme/typography` (fontFamily, fontSize, **fontWeight**).
- Spacing: use the spacing scale from `@/theme/spacing`; prefer rem units; avoid magic pixel numbers.
- Shared patterns: use `commonStyles` from `@/styles/commonStyles`. If a pattern repeats > 3 times, extract it there.
- **Never** use inline `style={{ ... }}`; create a styled component in `styles.ts`.
- Export styles as a single named object: `export const ComponentNameStyles = { Container, Title }`; import and use as `ComponentNameStyles.Container` (no destructuring).
- SSR: register styled-components via `StyledComponentsRegistry` in the root layout; enable `compiler.styledComponents` in `next.config.js`.
- **Alternative:** CSS Modules or Tailwind are acceptable if the project standard differs; keep it consistent.

## Static Text and Alerts (i18n-friendly)

- **Static text:** All static UI copy (titles, headings, labels, placeholders, button labels) must live in `src/constants/titles.ts` (export `TITLES`) using i18n-style keys (`module.section.key`). Import from `@/constants`; no hardcoded copy in components/pages.
- **Alert/error messages:** All user-facing alert/error/toast messages must live in `src/constants/alerts.ts` (export `ALERTS`). Import from `@/constants`; no hardcoded alert/error strings in components/pages.
- **Routes:** All navigation paths in `src/constants/routes.ts` (export `ROUTES`); never hardcode route strings in `<Link>`/`router.push`.

## State

- Local state (`useState`/`useReducer`) for UI-only.
- Redux Toolkit for shared/persisted state; slices under `store/slices/`. Use typed hooks: `useAppDispatch`, `useAppSelector`. Always use optional chaining when reading state.
- Avoid overusing Context for app-wide state.

## Data Fetching, Lists, Images

- Server Components: fetch with `fetch` (with `cache`/`revalidate`) or server SDKs. Client/shared logic: use `services/` over `http` from `lib/fetch-client.ts` (axios-free); use `API_PATHS`.
- Handle promises with `.then()/.catch()` in services; expose loading/error states in UI.
- Lists: virtualize large lists (`@tanstack/react-virtual`) where needed; always provide stable unique `key` (never array index).
- Images: use `next/image` for `public/` raster assets (with `width`/`height` or `fill` + `sizes`); SVGs as React components from `@/assets/icons`.

## Redux Toolkit Slice Pattern

- Per domain: `slices/xxxSlice.ts` with `createSlice` (state, reducers, optional `extraReducers` for async thunks). Root: `store/index.ts` uses `configureStore`; `store/hooks.ts` exports typed `useAppDispatch`/`useAppSelector`.

## Next.js Specifics

- Per-route `metadata` (or `generateMetadata`) export for SEO.
- Route handlers (`app/api/.../route.ts`) for server endpoints; validate inputs; never leak secrets to the client.
- Environment variables: server-only secrets without `NEXT_PUBLIC_`; only expose client-safe values with `NEXT_PUBLIC_` prefix. Use **`.env`** only; never `.env.local` or `.env.example`. Never commit `.env`.
- Use `next/link` for navigation and `next/font` for fonts.

For full structure and path aliases, see `.cursornext/skills/nextjs-architecture/SKILL.md`.
