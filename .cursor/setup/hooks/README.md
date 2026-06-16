# useForm Hook Setup (React Native)

Templates for the schema-based **`useForm`** hook and its validation helpers, in both **TypeScript** and **JavaScript**. This is a **React Native** port — field handlers use the `(name, value)` signature (a `TextInput`'s `onChangeText` gives the value directly; there is no DOM event), and it has **no external dependencies** (no `lodash`, no `react-i18next`). Error messages are plain strings you pass from your `ALERTS` constants.

## Install

From the project root:

```bash
node .cursor/scripts/setup-useform.js          # auto: TypeScript if tsconfig.json exists, else JavaScript
node .cursor/scripts/setup-useform.js --ts     # force TypeScript (.ts)
node .cursor/scripts/setup-useform.js --js     # force JavaScript (.js)
node .cursor/scripts/setup-useform.js --force  # overwrite existing files
```

> The **Project Scaffold Agent** (`@project-scaffold-agent`) installs these same files automatically for every new project, so a fresh app already has `useForm`.

## Templates

| Template (TypeScript) | Template (JavaScript) | Installed to |
|-----------------------|-----------------------|--------------|
| `.cursor/setup/hooks/useForm.ts` | `.cursor/setup/hooks/useForm.js` | `src/hooks/useForm.{ts,js}` |
| `.cursor/setup/utility/form-validators.ts` | `.cursor/setup/utility/form-validators.js` | `src/utility/form-validators.{ts,js}` |

The script also adds `export { useForm } from './useForm';` to the `src/hooks` barrel (`index.ts`/`index.js`, creating it if needed).

**TypeScript note:** the hook imports its validators via the `@utility/form-validators` alias. For `tsc` to resolve aliases, your `tsconfig.json` needs `baseUrl` + `paths` mirroring the `babel.config.js` aliases (the scaffold sets these up). Exported types: `FormSchema`, `FieldSchema`, `Validator`, `SubmitFormCallback`, `UseFormOptions`.

`useForm` imports its validators with the `@utility/form-validators` path alias and is itself imported via `@hooks/useForm`. Both aliases are part of the standard scaffold (`babel-plugin-module-resolver`).

## Schema shape

```js
const initialState = {
  email: {
    value: '',
    error: '',
    required: true,
    validator: emailValidator(ALERTS.VALIDATION.EMAIL_INVALID),
  },
  remember: { value: false, error: '', required: false, type: 'boolean' },
};
```

- `validator?: { func: (value, values) => boolean; error: string }` — when `func` returns `false`, `error` is shown.
- `type?: 'boolean'` — boolean-aware required check.
- `requiredError?: string` — override the default required message for that field.
- `convertToLang?: true` + `options.translate` — run `error` through a translate function (optional; the project uses string constants by default).

Validator factories in `form-validators.js`: `emailValidator`, `patternValidator`, `minLengthValidator`, `maxLengthValidator`, `matchFieldValidator`.

## Usage

See `useForm.example.tsx` / `useForm.example.js` and `.cursor/rules/useform-validation.mdc`. Build full forms with **`@useform-builder-agent`**.

```js
const { values, errors, dirty, disable, handleOnChange, handleOnSubmit } =
  useForm(initialState, submitHandler);

<CustomInput
  value={values?.email}
  onChangeText={(text) => handleOnChange('email', text)}
  error={dirty?.email ? errors?.email : ''}
/>
<CustomButton onPress={() => handleOnSubmit()} disabled={disable} />
```

Show a field's error only when `dirty?.field` is true. Submit through a service in `src/services/` (or `src/api/`), never raw fetch in the screen.
