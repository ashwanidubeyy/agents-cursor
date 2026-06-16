import { useState, useEffect, useCallback } from 'react';
import {
  get_prop_values,
  is_object,
  is_required,
} from '@utility/form-validators';

const DEFAULT_REQUIRED_ERROR = 'This field is required.';

/**
 * Schema-based form hook for React Native.
 *
 * @param {object} stateSchema       Field schema: { value, error, required, validator, type, requiredError, convertToLang }.
 * @param {function} submitFormCallback (values | null, errors | null, extraParams?) => void.
 * @param {object} options           { requiredError?: string, translate?: (key) => string }.
 *
 * Field handlers use the React Native `(name, value)` signature (TextInput
 * `onChangeText` gives the value directly — there is no DOM event).
 */
export const useForm = (stateSchema = {}, submitFormCallback, options = {}) => {
  const { requiredError = DEFAULT_REQUIRED_ERROR, translate } = options;

  const t = useCallback(
    (value) => (typeof translate === 'function' ? translate(value) : value),
    [translate],
  );

  const [state, setStateSchema] = useState({ ...stateSchema });
  const [values, setValues] = useState(get_prop_values(stateSchema, 'value'));
  const [errors, setErrors] = useState(get_prop_values(stateSchema, 'error'));
  const [dirty, setDirty] = useState(get_prop_values(stateSchema, ''));
  const [disable, setDisable] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const validateFormFields = useCallback(
    (name, value) => {
      const field = state?.[name];
      if (!field) {
        return '';
      }

      const requiredMessage = field?.requiredError
        ? t(field.requiredError)
        : t(requiredError);
      let error = is_required(value, field?.required, requiredMessage, field);

      if (error === '' && is_object(field?.validator)) {
        const validator = field.validator;
        const testFunc = validator?.func;
        const hasValue = Array.isArray(value)
          ? value.length > 0
          : value !== '' && value !== null && value !== undefined;

        if (hasValue && typeof testFunc === 'function' && !testFunc(value, values)) {
          error = field?.convertToLang ? t(validator?.error) : validator?.error;
        }
      }

      return error;
    },
    [state, values, requiredError, t],
  );

  const validateErrorState = useCallback(
    () => Object.values(errors).some((error) => Boolean(error)),
    [errors],
  );

  const setInitialErrorState = useCallback(() => {
    setErrors((prevState) =>
      Object.keys(prevState).reduce((accumulator, name) => {
        accumulator[name] = validateFormFields(name, values?.[name]);
        return accumulator;
      }, {}),
    );
  }, [values, validateFormFields]);

  useEffect(() => {
    setInitialErrorState();
    setDisable(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isDirty) {
      setDisable(validateErrorState());
    }
  }, [errors, isDirty, validateErrorState]);

  const updateValue = useCallback(
    (name, value) => {
      setIsDirty(true);
      const error = validateFormFields(name, value);
      setValues((prevState) => ({ ...prevState, [name]: value }));
      setErrors((prevState) => ({ ...prevState, [name]: error }));
      setDirty((prevState) => ({ ...prevState, [name]: true }));
    },
    [validateFormFields],
  );

  const handleOnChange = useCallback(
    (name, value) => {
      if (typeof value === 'string' && value.startsWith(' ')) {
        return;
      }
      updateValue(name, value);
    },
    [updateValue],
  );

  const handleOnNumberChange = useCallback(
    (name, value) => updateValue(name, value === '' ? '' : Number(value)),
    [updateValue],
  );

  const handleOnSelection = useCallback(
    (name, value) => updateValue(name, value),
    [updateValue],
  );

  const handleOnMultipleSelection = useCallback(
    (name, selectedValues) => updateValue(name, selectedValues ?? []),
    [updateValue],
  );

  const handleOnCheckBoxChange = useCallback(
    (name, checked) => updateValue(name, Boolean(checked)),
    [updateValue],
  );

  const handleOnSwitch = useCallback(
    (name, value) => updateValue(name, Boolean(value)),
    [updateValue],
  );

  const handleOnValueChange = useCallback(
    (name, value) => updateValue(name, value ?? ''),
    [updateValue],
  );

  const handleOnSubmit = useCallback(
    (extraParams) => {
      const nextErrors = Object.keys(state).reduce((accumulator, name) => {
        accumulator[name] = validateFormFields(name, values?.[name]);
        return accumulator;
      }, {});
      setErrors(nextErrors);

      const hasError = Object.values(nextErrors).some((error) => Boolean(error));
      if (!hasError) {
        submitFormCallback?.(values, null, extraParams);
        return;
      }

      setDirty((prevState) => {
        const nextDirty = { ...prevState };
        Object.keys(nextErrors).forEach((name) => {
          if (nextErrors[name]) {
            nextDirty[name] = true;
          }
        });
        return nextDirty;
      });
      submitFormCallback?.(null, nextErrors, extraParams);
    },
    [state, values, validateFormFields, submitFormCallback],
  );

  const setUseFormStates = useCallback((vals, errs, dirt) => {
    if (vals) {
      setValues((prevState) => ({ ...prevState, ...vals }));
    }
    if (errs) {
      setErrors((prevState) => ({ ...prevState, ...errs }));
    }
    if (dirt) {
      setDirty((prevState) => ({ ...prevState, ...dirt }));
    }
  }, []);

  const setRequired = useCallback((fields) => {
    setStateSchema((prevState) => {
      const nextState = { ...prevState };
      Object.keys(fields).forEach((key) => {
        if (nextState[key]) {
          nextState[key] = { ...nextState[key], required: fields[key] };
        }
      });
      return nextState;
    });
  }, []);

  const setValidator = useCallback((name, validator) => {
    setStateSchema((prevState) => {
      if (!prevState[name]) {
        return prevState;
      }
      return { ...prevState, [name]: { ...prevState[name], validator } };
    });
  }, []);

  const clearStateSchema = useCallback(() => {
    setValues(get_prop_values(stateSchema, 'value'));
    setErrors(get_prop_values(stateSchema, 'error'));
    setDirty(get_prop_values(stateSchema, ''));
    setIsDirty(false);
    setDisable(true);
  }, [stateSchema]);

  const handleNewSchema = useCallback((newSchema) => {
    setStateSchema(newSchema);
    setValues(get_prop_values(newSchema, 'value'));
    setErrors(get_prop_values(newSchema, 'error'));
    setDirty(get_prop_values(newSchema, ''));
  }, []);

  const validateSpecificFields = useCallback(
    (fields = [], callback = () => {}) => {
      const newErrors = {};
      fields.forEach((name) => {
        const error = validateFormFields(name, values?.[name]);
        setErrors((prevState) => ({ ...prevState, [name]: error }));
        setDirty((prevState) => ({ ...prevState, [name]: Boolean(error) }));
        if (error) {
          newErrors[name] = error;
        }
      });
      callback(values, Object.keys(newErrors).length > 0 ? newErrors : null);
    },
    [validateFormFields, values],
  );

  const addUseFormFields = useCallback(
    ({ keys = [], errorMessages = [], newSchemaFields = null }) => {
      const valuesToSet = {};
      const errorsToSet = {};
      const dirtyToSet = {};
      keys.forEach((key, index) => {
        valuesToSet[key] = '';
        errorsToSet[key] = errorMessages?.[index] ?? '';
        dirtyToSet[key] = errorMessages?.[index] ? false : true;
      });
      setUseFormStates(valuesToSet, errorsToSet, dirtyToSet);

      if (newSchemaFields) {
        setStateSchema((prevState) => ({ ...prevState, ...newSchemaFields }));
      }
    },
    [setUseFormStates],
  );

  const removeUseFormFields = useCallback((keys = []) => {
    if (!keys.length) {
      return;
    }
    const omit = (prevState) => {
      const nextState = { ...prevState };
      keys.forEach((key) => delete nextState[key]);
      return nextState;
    };
    setValues(omit);
    setErrors(omit);
    setDirty(omit);
    setStateSchema(omit);
  }, []);

  return {
    values,
    errors,
    dirty,
    disable,
    handleOnChange,
    handleOnNumberChange,
    handleOnSelection,
    handleOnMultipleSelection,
    handleOnCheckBoxChange,
    handleOnSwitch,
    handleOnValueChange,
    handleOnSubmit,
    setValues,
    setErrors,
    setDirty,
    setUseFormStates,
    setRequired,
    setValidator,
    clearStateSchema,
    handleNewSchema,
    validateSpecificFields,
    validateErrorState,
    addUseFormFields,
    removeUseFormFields,
  };
};
