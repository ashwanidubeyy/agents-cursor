# Next.js Best Practices (Vibe Engineering)

**Full rule:** See `.cursornext/rules/nextjs.mdc` for complete guidelines (App Router, TypeScript, COLORS, TYPOGRAPHY, server/client components, performance, accessibility). This file is a short reference.

**Project structure and coding standards:** See `.cursornext/skills/nextjs-architecture/SKILL.md` and `.cursornext/rules/coding-standards.md`.

Applied by Coding and Figma agents.

## Server / Client Components

- Default to Server Components; add `'use client'` only for interactivity, browser APIs, styled-components, Redux hooks, or context.
- Fetch data server-side; pass to client components via props. Keep client boundaries small.

## Performance

- **Lists:** virtualize long lists; stable unique keys (never index).
- **Images:** `next/image` for raster assets; SVGs as components from `@/assets/icons`.
- **Fonts:** `next/font` to avoid layout shift.
- **Code-splitting:** `next/dynamic` for heavy client-only components.
- **Memoization:** `React.memo`, `useCallback`, `useMemo` for expensive renders/callbacks.
- **Caching:** use App Router `revalidate`/`revalidateTag`/`revalidatePath` appropriately.

## Accessibility

- Semantic HTML, `aria-*`, labeled inputs, keyboard navigation, visible focus.
- Sufficient contrast; respect reduced motion.

## Design System

- Colors: COLORS only (no hex in styles).
- Typography: TYPOGRAPHY (e.g. TYPOGRAPHY.TEXT_PARAGRAPH_14, TYPOGRAPHY.HEADING_H2_BOLD) with font-weight.
- Spacing: consistent scale from `@/theme/spacing`; rem-based units.

## Routing

- App Router file-based routing; navigate with `next/link` / `useRouter`. Path constants in `constants/routes.ts`.

## Error Handling

- Optional chaining: `obj?.value`, `arr?.[0]`.
- `error.tsx` / `not-found.tsx` for route-level states; `.then()/.catch()` for service promises with user-facing error UI.

## SEO

- Per-route `metadata` / `generateMetadata`.

Full structure and patterns: `.cursornext/skills/nextjs-architecture/SKILL.md`, `.cursornext/rules/coding-standards.md`.
