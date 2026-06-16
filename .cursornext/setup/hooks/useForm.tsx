import {
  get_prop_values,
  is_micro_field_required,
  is_object,
  is_required,
} from "../constants/form-validators";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "./useTranslation";
import { STATIC_VALUES, TRANSLATION_KEYS } from "../constants/strings";
import _ from "lodash";
/**
 * Custom hooks to validate your Form...
 *
 * @param {object} stateSchema model you stateSchema.
 * @param {object} stateValidatorSchema model your validation.
 * @param {function} submitFormCallback function to be execute during form submission.
 */
export const useForm = (
  stateSchema?: any,
  submitFormCallback?: any,
  specificValidationFields?: any
) => {
  const [state, setStateSchema] = useState({ ...stateSchema });
  const [values, setValues] = useState(get_prop_values(state, "value"));
  const [errors, setErrors] = useState(get_prop_values(state, "error"));
  const [dirty, setDirty] = useState(get_prop_values(state, ""));
  const [disable, setDisable] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const { t } = useTranslation(STATIC_VALUES.COMMON.FILE_NAME_COMMON);

  // Get a local copy of stateSchema
  useEffect(() => {
    setStateSchema(stateSchema);
    setDisable(true); // Disable button in initial render.
    setInitialErrorState();
  }, []); // eslint-disable-line

  const updateSchema = (schema: any) => {
    setStateSchema(schema);
  };

  // For every changed in our state this will be fired
  // To be able to disable the button
  useEffect(() => {
    if (isDirty) {
      setDisable(validateErrorState());
    }
  }, [errors, isDirty]); // eslint-disable-line

  const setRequired = (fields: Record<string, boolean>) => {
    Object.keys(fields).forEach((key) => {
      if (state[key] !== undefined) {
        state[key].required = fields[key];
      }
    });
  };

  const setValidator = (fieldName: any, validatorFunction: any) => {
    if (!state[fieldName]) return;

    let field = state[fieldName];
    field.validator = validatorFunction;
  };

  // Validate fields in forms
  const validateFormFields = useCallback(
    (name: any, value: any) => {
      // const validator = stateValidatorSchema;
      // Making sure that stateValidatorSchema name is same in
      // stateSchema
      if (!state[name]) return;
      const field = state[name];

      let error = "";
      error = is_required(
        value,
        field.required,
        t(TRANSLATION_KEYS.COMMON.ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD),
        state[name]
      );

      if (is_object(field["validator"]) && error === "") {
        if (value && value.length > 0) {
          const fieldValidator = field["validator"];
          // Test the function callback if the value is meet the criteria
          const testFunc = fieldValidator["func"];
          if (testFunc) {
            if (!testFunc(value, values)) {
              error =
                "convertToLang" in state?.[name]
                  ? t(fieldValidator["error"])
                  : fieldValidator["error"];
            }
          } else {
            error =
              "convertToLang" in state?.[name]
                ? t(fieldValidator["error"])
                : fieldValidator["error"];
          }
        }
      }

      return error;
    },
    [state, values]
  );

  // Validate microsite fields in forms
  const validateMicroSiteFormFields = (name: any, value: any, type: any) => {
    if (!state[name]) return;
    const field = state[name];
    let error = "";
    const isFieldToConsider = (name: any) => {
      if (specificValidationFields.length === 0) return true;
      else if (
        specificValidationFields.length > 0 &&
        specificValidationFields.includes(name)
      )
        return true;
      else return false;
    };
    if (isFieldToConsider(name)) {
      error = is_micro_field_required(
        value,
        field.required,
        t(TRANSLATION_KEYS.COMMON.ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD),
        type
      );
      if (is_object(field["validator"]) && error === "") {
        if (value && value.length > 0) {
          const fieldValidator = field["validator"];
          // Test the function callback if the value is meet the criteria
          const testFunc = fieldValidator["func"];
          if (testFunc) {
            if (field.type === "TELEPHONE_WITH_EXT") {
              if (Array.isArray(value)) {
                const newVal = value.join("");
                if (!testFunc(newVal, values)) {
                  error = fieldValidator["error"];
                }
              } else if (!testFunc(value, values)) {
                error = fieldValidator["error"];
              }
            } else {
              if (!testFunc(value, values)) {
                error = fieldValidator["error"];
              }
            }
          } else {
            error = fieldValidator["error"];
          }
        }
      }
    }
    return error;
  };

  // Set Initial Error State
  // When hooks was first rendered...
  const setInitialErrorState = useCallback(() => {
    Object.keys(errors).forEach((name) => {
      errors[name] = validateFormFields(name, values[name]);
      setErrors((prevState: any) => ({
        ...prevState,
        [name]: validateFormFields(name, values[name]),
      }));
    });
  }, [errors, values, validateFormFields]);

  const setInitialErrorsForForm = useCallback(
    (initialState: any) => {
      Object.keys(initialState).forEach((name) =>
        setErrors((prevState: any) => ({
          ...prevState,
          [name]: validateFormFields(name, values[name]),
        }))
      );
    },
    [errors, values, validateFormFields]
  );

  // Used to disable submit button if there's a value in errors
  // or the required field in state has no value.
  // Wrapped in useCallback to cached the function to avoid intensive memory leaked
  // in every re-render in component

  const validateErrorState = useCallback(
    () => Object.values(errors).some((error) => error),
    [errors]
  );

  // Event handler for handling changes in input.
  const handleOnChange = useCallback(
    (event: any) => {
      setIsDirty(true);

      const name = event?.target?.name;
      const value = event?.target?.value;
      if (typeof value === "string" && value?.startsWith(" ")) {
        return;
      }
      const error = validateFormFields(name, value);
      setValues((prevState: any) => ({ ...prevState, [name]: value }));
      setErrors((prevState: any) => ({ ...prevState, [name]: error }));
      setDirty((prevState: any) => ({ ...prevState, [name]: error !== "" }));
    },
    [validateFormFields]
  );

  const handleOnNumberChange = useCallback(
    (event: any) => {
      setIsDirty(true);
      const name = event.target.name;
      const value = event.target.valueAsNumber;
      const error = validateFormFields(name, event.target.value);
      setValues((prevState: any) => ({ ...prevState, [name]: value }));
      setErrors((prevState: any) => ({ ...prevState, [name]: error }));
      setDirty((prevState: any) => ({ ...prevState, [name]: error !== "" }));
    },
    [validateFormFields]
  );

  // Event handler for handling changes in input.
  const handleOnSelection = useCallback(
    (event: any, allowEmptyVal = false) => {
      setIsDirty(true);

      const name = event?.target?.name;
      let value = event?.target?.value;

      if (value || allowEmptyVal) {
        const error = validateFormFields(name, value);
        setValues((prevState: any) => ({ ...prevState, [name]: value }));
        setErrors((prevState: any) => ({ ...prevState, [name]: error }));
        setDirty((prevState: any) => ({ ...prevState, [name]: true }));
      }
    },
    [validateFormFields]
  );

  const handleOnFileUpload = useCallback(
    (event: any) => {
      setIsDirty(true);

      let stateName = "file";
      let stateValue = event;
      let error = validateFormFields(stateName, stateValue);

      setValues((prevState: any) => ({
        ...prevState,
        [stateName]: stateValue,
      }));
      setErrors((prevState: any) => ({ ...prevState, [stateName]: error }));
      setDirty((prevState: any) => ({ ...prevState, [stateName]: true }));

      let sName = "documents";
      let sValue = event;
      let sError = validateFormFields(sName, sValue);

      setValues((prevState: any) => ({ ...prevState, [sName]: sValue }));
      setErrors((prevState: any) => ({ ...prevState, [sName]: sError }));
      setDirty((prevState: any) => ({ ...prevState, [sName]: true }));
    },
    [validateFormFields]
  );

  const handleOnRadioChange = (e: any) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.id;

    const error = validateFormFields(name, value);
    if (value !== null || value !== undefined) {
      setValues((prevState: any) => ({ ...prevState, [name]: value }));
      setErrors((prevState: any) => ({ ...prevState, [name]: error }));
      setDirty((prevState: any) => ({ ...prevState, [name]: true }));
    }
  };

  const handleOnMultipleSelection = useCallback(
    (name: any, selectedValues: any) => {
      setIsDirty(true);
      if (selectedValues) {
        const error = validateFormFields(name, selectedValues);
        setValues((prevState: any) => ({
          ...prevState,
          [name]: selectedValues,
        }));
        setErrors((prevState: any) => ({ ...prevState, [name]: error }));
        setDirty((prevState: any) => ({ ...prevState, [name]: true }));
      }
    },
    [validateFormFields]
  );

  const setErrorsAndDirty = (
    keysToSet: any,
    errorOrReset = "reset",
    errorMessages = []
  ) => {
    let errorObjToSet: any, dirtyObjectToSet: any;
    keysToSet.forEach((key: any, index: any) => {
      errorObjToSet = {
        ...errorObjToSet,
        [key]:
          errorOrReset === "error"
            ? errorMessages[index]
              ? errorMessages[index]
              : t(TRANSLATION_KEYS.COMMON.ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD)
            : "",
      };
      dirtyObjectToSet = {
        ...dirtyObjectToSet,
        [key]: errorOrReset === "error",
      };
    });

    setErrors((prevState: any) => ({ ...prevState, ...errorObjToSet }));
    setDirty((prevState: any) => ({ ...prevState, ...dirtyObjectToSet }));
  };

  const handleOnCheckboxChange = (
    e: any,
    selection: any,
    isDirect = false,
    directKey = ""
  ) => {
    if (isDirect) {
      setValues((prevState: any) => ({
        ...prevState,
        [directKey]: selection,
      }));
    } else {
      const name = e?.currentTarget?.name;
      const value = e?.currentTarget?.id;
      let checkedValues: any = [];
      if (selection) {
        if (Array.isArray(selection)) {
          checkedValues = [...selection];
        } else if (selection.length > 0) {
          checkedValues = [selection];
        }
      }

      if (checkedValues.includes(value)) {
        const index = checkedValues.indexOf(value);
        if (index > -1) {
          checkedValues.splice(index, 1); // 2nd parameter means remove one item only
        }
      } else {
        checkedValues = [...checkedValues, value];
      }

      const error = validateFormFields(name, value);
      if (value !== null || value !== undefined) {
        setValues((prevState: any) => ({
          ...prevState,
          [name]: checkedValues,
        }));
        setErrors((prevState: any) => ({ ...prevState, [name]: error }));
        setDirty((prevState: any) => ({ ...prevState, [name]: true }));
      }
    }
  };

  const handleOnCheckBoxChange = useCallback(
    (e) => {
      setIsDirty(true);
      const name = e.currentTarget.name;
      const value = e.currentTarget.checked ? true : false;

      const error = validateFormFields(name, value);
      if (value !== null || value !== undefined) {
        setValues((prevState) => ({ ...prevState, [name]: value }));
        setErrors((prevState) => ({ ...prevState, [name]: error }));
        setDirty((prevState) => ({ ...prevState, [name]: true }));
      }
    },
    [validateFormFields]
  );

  const handleOnMultiselectChange = (value: any, name: any) => {
    setDirty(false);

    const error = validateFormFields(name, value);
    if (value !== null || value !== undefined) {
      setValues((prevState: any) => ({ ...prevState, [name]: value }));
      setErrors((prevState: any) => ({ ...prevState, [name]: error }));
      setDirty((prevState: any) => ({ ...prevState, [name]: true }));
    }
  };

  const handleOnValueChange = (value: any, name: any) => {
    setDirty(false);

    const error = validateFormFields(name, value);
    if (!value) value = "";
    if (value !== null || value !== undefined) {
      setValues((prevState: any) => ({ ...prevState, [name]: value }));
      setErrors((prevState: any) => ({ ...prevState, [name]: error }));
      setDirty((prevState: any) => ({ ...prevState, [name]: true }));
    }
  };

  const handleOnClear = (object: any) => {
    setValues((prevState: any) => ({
      ...prevState,
      ...object,
    }));
  };

  const handleOnSwitch = useCallback(
    (e: any) => {
      setIsDirty(true);

      const name = e.currentTarget.name;
      const value = e.currentTarget.checked ? true : false;

      const error = validateFormFields(name, value);
      if (value !== null || value !== undefined) {
        setValues((prevState: any) => ({ ...prevState, [name]: value }));
        setErrors((prevState: any) => ({ ...prevState, [name]: error }));
        setDirty((prevState: any) => ({ ...prevState, [name]: true }));
      }
    },
    [validateFormFields]
  );

  const handleOnEditorChange = (e: any, id: any) => {
    setDirty(false);

    const name = id;
    const value = e;

    const error = "validateFormFields(name, value)";
    if (value !== null || value !== undefined) {
      setValues((prevState: any) => ({ ...prevState, [name]: value }));
      setErrors((prevState: any) => ({ ...prevState, [name]: error }));
      setDirty((prevState: any) => ({ ...prevState, [name]: true }));
    }
  };

  const handleOnSubmit = useCallback(
    (event?: any, extraParams?: any) => {
      event?.preventDefault();

      // Making sure that there's no error in the state
      // before calling the submit callback function
      setInitialErrorState();
      if (!validateErrorState()) {
        submitFormCallback(values, null, extraParams);
      } else {
        Object.keys(errors).forEach((name) => {
          if (errors[name] && errors[name].length > 0) {
            setDirty((prevState: any) => ({
              ...prevState,
              [name]: true,
            }));
          }
        });
        submitFormCallback(null, errors, extraParams);
      }
    },
    [validateErrorState, submitFormCallback, values, errors]
  );

  const clearStateSchema = () => {
    Object.keys(values).forEach((name) =>
      setValues((prevState: any) => ({
        ...prevState,
        [name]: "",
      }))
    );
    Object.keys(errors).forEach((name) =>
      setErrors((prevState: any) => ({
        ...prevState,
        [name]: "",
      }))
    );
    Object.keys(dirty).forEach((name) =>
      setDirty((prevState: any) => ({
        ...prevState,
        [name]: false,
      }))
    );
    setInitialErrorState();
  };

  const handleNewSchema = (newSchema: any) => {
    setStateSchema(newSchema);
    setValues(get_prop_values(newSchema, "value"));
    setErrors(get_prop_values(newSchema, "error"));
    setDirty(get_prop_values(newSchema, ""));
  };

  // to clear the form fields and set error states
  const handleOnDataClear = (name: any, value = "", stateVal = true) => {
    const error = validateFormFields(name, value);
    setValues((prevState: any) => ({ ...prevState, [name]: value }));
    setErrors((prevState: any) => ({ ...prevState, [name]: error }));
    setDirty((prevState: any) => ({ ...prevState, [name]: stateVal }));
  };

  const clearFieldFromSchema = (name: any, value = "") => {
    setValues((prevState: any) => ({ ...prevState, [name]: value }));
    setErrors((prevState: any) => ({ ...prevState, [name]: "" }));
    setDirty((prevState: any) => ({ ...prevState, [name]: false }));
  };

  const setNewErrorAndDirty = (stateName: any, errorMessage: any) => {
    if (errorMessage) {
      setErrors((prevState: any) => ({
        ...prevState,
        [stateName]: errorMessage,
      }));
      setDirty((prevState: any) => ({ ...prevState, [stateName]: true }));
    } else {
      setErrors((prevState: any) => ({ ...prevState, [stateName]: "" }));
      setDirty((prevState: any) => ({ ...prevState, [stateName]: false }));
    }
  };

  const setUseFormStates = (vals?: any, errs?: any, dirt?: any) => {
    if (vals) {
      setValues((prevState: any) => ({ ...prevState, ...vals }));
    }
    if (errs) {
      setErrors((prevState: any) => ({ ...prevState, ...errs }));
    }
    if (dirt) {
      setDirty((prevState: any) => ({ ...prevState, ...dirt }));
    }
  };

  const addUseFormFields = (fields) => {
    const { keys = [], errorMessages = [], newSchemaFields = null } = fields;
    let valuesToSet, errorsToSet, dirtyToSet;
    keys.forEach((eleKey, index) => {
      valuesToSet = { ...valuesToSet, [eleKey]: "" };
      errorsToSet = { ...errorsToSet, [eleKey]: errorMessages?.[index] ?? "" };
      dirtyToSet = {
        ...dirtyToSet,
        [eleKey]: errorMessages?.[index] ? false : true,
      };
    });
    setUseFormStates(valuesToSet, errorsToSet, dirtyToSet);

    if (newSchemaFields !== null) {
      let clonedStates = _.cloneDeep(state);
      clonedStates = { ...clonedStates, ...newSchemaFields };
      updateSchema(clonedStates);
    }
  };

  const removeUseFormFields = (keys = []) => {
    if (keys?.length > 0) {
      let valuesToSet = _.cloneDeep(values);
      let errorsToSet = _.cloneDeep(errors);
      let dirtyToSet = _.cloneDeep(dirty);
      let clonedStates = _.cloneDeep(state);
      keys.forEach((eleKey) => {
        delete valuesToSet?.[eleKey];
        delete errorsToSet?.[eleKey];
        delete dirtyToSet?.[eleKey];
        delete clonedStates?.[eleKey];
      });
      setUseFormStates(valuesToSet, errorsToSet, dirtyToSet);
      updateSchema(clonedStates);
    }
  };

  const resetRequiredFields = (keys: any) => {
    if (keys?.length > 0) {
      let valuesToSet: any, errorsToSet: any, dirtyToSet: any;
      keys.forEach((eleKey, index) => {
        valuesToSet = { ...valuesToSet, [eleKey]: "" };
        errorsToSet = {
          ...errorsToSet,
          [eleKey]: t(
            TRANSLATION_KEYS.COMMON.ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD
          ),
        };
        dirtyToSet = { ...dirtyToSet, [eleKey]: false };
      });
      setUseFormStates(valuesToSet, errorsToSet, dirtyToSet);
    }
  };

  const handleSubmitForm = useCallback(
    (event: any) => {
      setStateSchema(event);
      // Making sure that there's no error in the state
      // before calling the submit callback function
      setInitialErrorsForForm(event);

      if (!validateErrorState()) {
        submitFormCallback(values, null);
      } else {
        Object.keys(errors).forEach((name) => {
          if (errors[name] && errors[name].length > 0) {
            setDirty((prevState: any) => ({
              ...prevState,
              [name]: true,
            }));
          }
        });
        submitFormCallback(null, errors);
      }
    },
    [validateErrorState, submitFormCallback, values, errors]
  );

  const validateSpecificFields = useCallback(
    (fields: any[], callback = (values: any, state: any) => { }) => {
      let newErrors = {};
      fields?.forEach((name: any, i: any) => {
        const error = validateFormFields(name, values?.[name]);
        setErrors((prevState: any) => ({ ...prevState, [name]: error }));
        setDirty((prevState: any) => ({ ...prevState, [name]: error }));
        if (error) {
          newErrors[name] = error;
        }
      });

      callback(values, Object.keys(newErrors)?.length > 0 ? newErrors : null);
    },
    [validateFormFields, errors]
  );

  //   const handleMicroSiteFormFilled = (event: any, successCallBack: any) => {
  //     setStateSchema(event);
  //     const initialErrState = (event: any) => {
  //       let err: any = {};
  //       Object.keys(event).forEach((name) => {
  //         err[name] = validateMicroSiteFormFields(name, values[name], "");
  //         setErrors((prevState: any) => ({
  //           ...prevState,
  //           [name]: err[name],
  //         }));
  //       });
  //       return err;
  //     };
  //     const _errListObj: any = initialErrState(event);
  //     const validError = (_errListObj) => {
  //       return () => Object.values(_errListObj).some((error) => error);
  //     };
  //     const CheckError = validError(_errListObj);
  //     if (!CheckError()) {
  //       successCallBack(values, null);
  //     } else {
  //       setErrors(_errListObj);
  //       Object.keys(_errListObj).forEach((name) => {
  //         if (_errListObj[name] && _errListObj[name].length > 0) {
  //           setDirty((prevState: any) => ({
  //             ...prevState,
  //             [name]: true,
  //           }));
  //         }
  //       });
  //       successCallBack(null, _errListObj);
  //     }
  //   };

  return {
    handleOnChange,
    handleOnNumberChange,
    handleOnSelection,
    handleOnMultipleSelection,
    handleOnSubmit,
    clearStateSchema,
    handleOnMultiselectChange,
    handleOnValueChange,
    values,
    errors,
    disable,
    setValues,
    setErrors,
    setDirty,
    dirty,
    handleOnDataClear,
    clearFieldFromSchema,
    handleNewSchema,
    setNewErrorAndDirty,
    handleSubmitForm,
    updateSchema,
    validateErrorState,
    setErrorsAndDirty,
    setRequired,
    setValidator,
    setUseFormStates,
    handleOnFileUpload,
    validateSpecificFields,
    handleOnCheckBoxChange,
    resetRequiredFields,
    addUseFormFields,
  };
};
