/**
 * Form validation helpers used by the `useForm` hook.
 *
 * Greenfield install: this file is self-contained (no lodash).
 * Edulac live repo: `packages/lib-utils/src/constants/form-validators.ts`
 * re-exports the same helpers from `utilities.ts`.
 */

export const is_required = (
  value: any,
  isRequired: any,
  error: any,
  field: any
) => {
  if (Array.isArray(value)) {
    if (value.length === 0 && isRequired) return error;
  } else if (field?.type === "boolean" && isRequired) {
    if (typeof value !== "boolean") {
      return error;
    }
  } else if (!value && isRequired) return error;
  return "";
};

export const is_object = (value: any) => {
  return typeof value === "object" && value !== null;
};

export const get_prop_values = (stateSchema: any, prop?: any) => {
  return Object.keys(stateSchema).reduce((accumulator: any, curr) => {
    accumulator[curr] = !prop ? false : stateSchema?.[curr]?.[prop];
    return accumulator;
  }, {});
};

export const is_micro_field_required = (
  value: any,
  isRequired: any,
  error: any,
  type = ""
) => {
  if (Array.isArray(value)) {
    if (value.length === 0 && isRequired) return error;
  } else if (type === "NUMBER" || type === "PERCENTAGE_OBTAINED") {
    if (typeof value !== "number" && !value) {
      return error;
    }
  } else if (!value && isRequired) return error;
  return "";
};
