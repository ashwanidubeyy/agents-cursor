/**
 * Form validation helpers used by the `useForm` hook (React Native).
 *
 * Self-contained: no external dependencies (no lodash / no i18n lib).
 * Error messages are plain strings — pass them from your `ALERTS` constants
 * so they stay centralised and translatable.
 */

export const is_required = (value, isRequired, error, field) => {
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

export const is_object = (value) => typeof value === 'object' && value !== null;

export const get_prop_values = (stateSchema = {}, prop) =>
  Object.keys(stateSchema).reduce((accumulator, key) => {
    if (!prop) {
      accumulator[key] = false;
    } else {
      accumulator[key] = stateSchema?.[key]?.[prop] ?? (prop === 'value' ? '' : '');
    }
    return accumulator;
  }, {});

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailValidator = (error) => ({
  func: (value) => EMAIL_REGEX.test(String(value ?? '').trim()),
  error,
});

export const patternValidator = (regex, error) => ({
  func: (value) => regex.test(String(value ?? '')),
  error,
});

export const minLengthValidator = (min, error) => ({
  func: (value) => String(value ?? '').trim().length >= min,
  error,
});

export const maxLengthValidator = (max, error) => ({
  func: (value) => String(value ?? '').length <= max,
  error,
});

export const matchFieldValidator = (fieldName, error) => ({
  func: (value, values) => value === values?.[fieldName],
  error,
});
