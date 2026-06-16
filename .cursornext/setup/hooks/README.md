# useForm Hook Setup

Templates for the schema-based **`useForm`** hook and validation helpers. Works in **single-app** and **monorepo** projects.

## Install

**Single Next.js app** (installs into `src/`):

```bash
pnpm setup:useform
```

**Monorepo shared package:**

```bash
USEFORM_TARGET=packages/lib-utils pnpm setup:useform
```

Overwrite existing: `pnpm setup:useform -- --force`

## Templates

| File | Installed to |
|------|----------------|
| `hooks/useForm.tsx` | `src/hooks/useForm.tsx` |
| `hooks/useTranslation.tsx` | `src/hooks/useTranslation.tsx` |
| `../constants/form-validators.ts` | `src/constants/form-validators.ts` |
| `../constants/strings-stub.ts` | `src/constants/strings.ts` **only if no `strings.ts`/`strings.tsx` exists** |

`useForm` imports `STATIC_VALUES` + `TRANSLATION_KEYS` from `../constants/strings`. The script creates `strings.ts` from the stub when your project doesn't already have one, so the hook compiles immediately. If you **already** have a strings file, the script leaves it untouched and asks you to merge the stub keys.

`../constants/language-stub.ts` is a manual-merge stub for `useTranslation` locales.

## After install

1. Install deps if missing: `pnpm add lodash react-i18next i18next` (`useForm` uses `_.cloneDeep`; `useTranslation` wraps `react-i18next`).
2. If you had an existing `strings` file, merge `STATIC_VALUES` + `TRANSLATION_KEYS` from the stub and add the required-field error translations to all locales.
3. Build forms with **@useform-builder-agent** or follow `.cursor/rules/useform-validation.mdc`.

## Import paths

```ts
// Single app (@/* alias)
import { useForm } from "@/hooks/useForm";

// Monorepo
import { useForm } from "@repo/lib-utils/hooks/useForm";
```
