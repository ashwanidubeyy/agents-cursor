/**
 * Minimal TRANSLATION_KEYS + STATIC_VALUES required by useForm.
 * When installing into a project, merge these keys into the real
 * `constants/strings.tsx` (or strings.ts) and add translations to all locales.
 */
export const TRANSLATION_KEYS = {
  COMMON: {
    ERROR_MESSAGES: {
      THIS_IS_REQUIRED_FIELD: "common.error_messages.this_is_required_field",
      FIELDS_NOT_FILLED_IN_FORM:
        "common.error_messages.fields_not_filled_in_form",
    },
  },
} as const;

export const STATIC_VALUES = {
  COMMON: {
    FILE_NAME_COMMON: "common",
    SUCCESS_STATUS_CODES: [200, 201, 204],
    FIELD_TYPES: {
      TEXT: "text",
      PASSWORD: "password",
      EMAIL: "email",
      NUMBER: "number",
    },
    COOKIE_KEYS: {
      LANGUAGE: "language",
      ACCESS_TOKEN: "accessToken",
      ROLE: "role",
      ROLE_TOKEN: "roleToken",
      DEFAULT_COUNTRY: "defaultCountry",
    },
  },
} as const;
