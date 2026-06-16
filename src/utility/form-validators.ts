/**
 * Form validation helpers + types used by the `useForm` hook (React Native).
 *
 * Self-contained: no external dependencies (no lodash / no i18n lib).
 * Error messages are plain strings — pass them from your `ALERTS` constants
 * so they stay centralised and translatable.
 */

export type Validator<V = any> = {
  func: (value: V, values: Record<string, any>) => boolean;
  error: string;
};

export interface FieldSchema<V = any> {
  value: V;
  error?: string;
  required?: boolean;
  type?: 'boolean' | string;
  validator?: Validator<V>;
  requiredError?: string;
  convertToLang?: boolean;
}

export type FormSchema = Record<string, FieldSchema>;

export const is_required = (
  value: any,
  isRequired?: boolean,
  error: string = '',
  field?: FieldSchema,
): string => {
  if (!isRequired) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? error : '';
  }
  if (field?.type === 'boolean') {
    return typeof value === 'boolean' ? '' : error;
  }
  if (typeof value === 'number') {
    return '';
  }
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed ? '' : error;
};

export const is_object = (value: any): boolean =>
  typeof value === 'object' && value !== null;

export const get_prop_values = (
  stateSchema: Record<string, any> = {},
  prop?: string,
): Record<string, any> =>
  Object.keys(stateSchema).reduce((accumulator: Record<string, any>, key) => {
    if (!prop) {
      accumulator[key] = false;
    } else {
      accumulator[key] =
        stateSchema?.[key]?.[prop] ?? (prop === 'value' ? '' : '');
    }
    return accumulator;
  }, {});

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailValidator = (error: string): Validator<string> => ({
  func: (value) => EMAIL_REGEX.test(String(value ?? '').trim()),
  error,
});

export const patternValidator = (
  regex: RegExp,
  error: string,
): Validator<string> => ({
  func: (value) => regex.test(String(value ?? '')),
  error,
});

export const minLengthValidator = (
  min: number,
  error: string,
): Validator<string> => ({
  func: (value) => String(value ?? '').trim().length >= min,
  error,
});

export const maxLengthValidator = (
  max: number,
  error: string,
): Validator<string> => ({
  func: (value) => String(value ?? '').length <= max,
  error,
});

export const matchFieldValidator = (
  fieldName: string,
  error: string,
): Validator => ({
  func: (value, values) => value === values?.[fieldName],
  error,
});
