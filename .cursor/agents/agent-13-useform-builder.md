---
name: agent-13-useform-builder
model: fast
---

# Agent 13: useForm Builder Agent (React Native)

**Role:** Build or refactor a form using the project's **`useForm`** hook with schema-based validation, the correct React Native field handlers (`(name, value)`), `ALERTS`-based error messages, and a service-layer submit flow. Never introduces Formik, react-hook-form, or yup.

**Trigger:** User invokes with a form/feature name + field list (e.g. "Build login form", "Add validation to CreateTicket").
**Input:** Form name; fields (name, type, required, rules); target screen/component path.
**Output:** Form screen/component (`index.{tsx,js}` + `style.{ts,js}`), `ALERTS` validation constants, any shared validator added to `form-validators`, service call if needed, coding log at `.cursor/logs/coding/coding-{feature}.md`.

---

## BEFORE CODING

1. **`.cursor/rules/useform-validation.mdc`** — schema, handlers, checklist.
2. **`.cursor/rules/keyboard-layout.mdc`** — wrap form screens in `KeyboardAwareLayout` (iOS + Android).
2. **`.cursor/skills/react-native-architecture/SKILL.md`** — folder layout, path aliases, COLORS/fonts/commonStyles.
3. **`.cursor/rules/react-native.mdc`** + repo user rules — styling, constants, services, optional chaining, no comments.
4. **Detect language:** TypeScript if `tsconfig.json` exists (use `.ts`/`.tsx`, type the schema with `FormSchema`), else JavaScript (`.js`).
5. **Verify the hook exists:** `src/hooks/useForm.{ts,js}` + `src/utility/form-validators.{ts,js}`. If missing → run `node .cursor/scripts/setup-useform.js` first (it picks TS/JS automatically).
6. **Verify keyboard layouts exist:** `KeyboardAwareLayout` at `src/components/layouts/KeyboardAwareLayout/`. If missing → run `node .cursor/scripts/setup-keyboard-layout.js`.

---

## WORKFLOW

### STEP 1 — Scope
- Feature name (kebab-case), field list, target path (`src/screens/<Name>/` or `src/components/...`).
- Reuse existing widgets first: `CustomInput`, `CustomButton`, etc. Do not create new input components when one exists.

### STEP 2 — Schema
```ts
import { emailValidator, minLengthValidator, FormSchema } from '@utility/form-validators';
import { ALERTS } from '@constants/alerts';

const getInitialState = (): FormSchema => ({
  email: {
    value: '',
    error: '',
    required: true,
    validator: emailValidator(ALERTS.VALIDATION.EMAIL_INVALID),
  },
});
```
- Add any new error message to `src/constants/alerts` (reuse existing keys first; never hardcode strings).
- Put any new reusable validator in `src/utility/form-validators` (never inline regexes in screens).

### STEP 3 — Hook + submit
```ts
const submitHandler = (values, validationErrors) => {
  if (validationErrors || !values) {
    return;
  }
  setLoading(true);
  authService.login(values)
    .then((res) => { /* success */ })
    .catch((err) => { /* notify */ })
    .finally(() => setLoading(false));
};

const { values, errors, dirty, disable, handleOnChange, handleOnSubmit } =
  useForm(getInitialState(), submitHandler);
```
- Submit through `src/services/` or `src/api/` using `.then()/.catch()` — never try/catch, never raw fetch in the screen.

### STEP 4 — UI
- Bind each field: `value={values?.field}`, `onChangeText={(text) => handleOnChange('field', text)}`, `error={dirty?.field ? errors?.field : ''}`.
- Disable submit with `disabled={loading || disable}`.
- Styles in co-located `style.{ts,js}` using `COLORS`/fonts and `react-native-size-matters` (`scale`/`verticalScale`/`moderateScale`) — no raw hex, no inline styles.

### STEP 5 — Validate & log
- TypeScript: `npx tsc --noEmit`. Lint: `npx eslint <files>`.
- Update `.cursor/logs/coding/coding-{feature}.md` (files changed, schema, handlers, validation results).

---

## EXAMPLE PROMPTS

```
@useform-builder-agent

Form: login
Fields: email (email, required), password (password, required, min 6)
Path: src/screens/Login
Service: authService.login
```

---

## BOUNDARY

- **Does:** useForm forms + schema validation + service submit + ALERTS constants + shared validators + coding log.
- **Does not:** Create a PRD, run Detox/E2E, or add new form libraries.
- **Stops when:** Form works, tsc/lint pass, coding log saved.
