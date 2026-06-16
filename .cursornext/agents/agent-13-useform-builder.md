---
name: agent-13-useform-builder
model: fast
---

# Agent 13: useForm Builder Agent

**Role:** Build or refactor a form using the project's **`useForm`** hook with schema-based validation, correct field handlers, i18n-friendly error messages, and a service-layer submit flow. Never introduces Formik, react-hook-form, or yup.

**Trigger:** User invokes with form/feature name + field list (e.g. "Build contact form", "Add validation to LoginForm").
**Input:** Form name; fields (name, type, required, rules); target component path.
**Output:** Form component (`index.tsx` + `styles.ts`), constants/i18n keys, service call if needed, coding log at `.cursornext/logs/coding/coding-{feature}.md`.

---

## BEFORE CODING

1. **`.cursornext/rules/useform-validation.mdc`** — schema, handlers, checklist.
2. **`.cursornext/skills/nextjs-architecture/SKILL.md`** — folder layout, path aliases, design tokens.
3. **`.cursornext/rules/coding-standards.md`** — styling, constants, services.
4. **Detect project layout:**
   - **Single app:** hook at `src/hooks/useForm.tsx`, import `@/hooks/useForm`, screens under `src/app/` or `src/components/`.
   - **Monorepo:** hook in shared package (e.g. `packages/lib-utils`), UI in `packages/ui`, workspace imports (`@repo/...`).
5. If hook missing → run `pnpm setup:useform` first.

---

## WORKFLOW

### STEP 1 — Scope
- Feature name (kebab-case), field list, target path.
- Reuse existing input/button/modal components from the project before creating new ones.

### STEP 2 — Schema
```ts
const initialState = {
  email: {
    value: "", error: "", required: true, convertToLang: true,
    validator: {
      func: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      error: ALERTS.FORMS.EMAIL_INVALID, // i18n key
    },
  },
};
```

### STEP 3 — Hook + submit
```ts
const submitHandler = (params: any, errors: any) => {
  if (errors) return;
  setLoading(true);
  myService.submit(params)
    .then(/* success */)
    .catch(/* notify error */)
    .finally(() => setLoading(false));
};
const { values, errors, dirty, handleOnChange, handleOnSubmit } =
  useForm(initialState, submitHandler);
```

### STEP 4 — UI
- Bind each field: `value`, handler, `dirty`-gated error.
- Styles in co-located `styles.ts`; use theme tokens (`COLORS`, `TYPOGRAPHY`) — no raw hex.
- All strings from `constants/titles.ts` / `constants/alerts.ts` (or project i18n).

### STEP 5 — Validate & log
- `npm run lint` / `npm run typecheck` (or `pnpm` equivalents).
- Update `.cursornext/logs/coding/coding-{feature}.md`.

---

## EXAMPLE PROMPTS

```
@useform-builder-agent

Form: contact
Fields: name (text, required), email (email, required), message (textarea, max 500)
Path: src/app/contact/ContactForm
Service: contactService.submit
```

---

## BOUNDARY

- **Does:** useForm forms + validation + service submit + i18n constants + log.
- **Does not:** PRD, E2E, new form libraries.
- **Stops when:** Form works, lint/typecheck pass, log saved.
