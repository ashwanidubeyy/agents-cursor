/**
 * Reference example: a login form built with the `useForm` hook.
 *
 * This file is documentation-only — copy the pattern into a real screen under
 * `src/screens/<Name>/index.js` and keep its styles in a co-located `style.js`.
 * Replace ALERTS / authService with the project's real constants and services.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from '@hooks/useForm';
import { emailValidator, minLengthValidator } from '@utility/form-validators';
import { ALERTS } from '@constants/alerts';
import CustomInput from '@widgets/CustomInput';
import CustomButton from '@widgets/CustomButton';

const getInitialState = () => ({
  email: {
    value: '',
    error: '',
    required: true,
    validator: emailValidator(ALERTS.VALIDATION.EMAIL_INVALID),
  },
  password: {
    value: '',
    error: '',
    required: true,
    validator: minLengthValidator(6, ALERTS.VALIDATION.PASSWORD_MIN),
  },
});

const LoginForm = () => {
  const [loading, setLoading] = useState(false);

  const submitHandler = (params, validationErrors) => {
    if (validationErrors) {
      return;
    }
    setLoading(true);
    // authService.login(params).then(...).catch(...).finally(() => setLoading(false));
  };

  const { values, errors, dirty, disable, handleOnChange, handleOnSubmit } =
    useForm(getInitialState(), submitHandler);

  return (
    <View>
      <CustomInput
        label="Email"
        value={values?.email}
        onChangeText={(text) => handleOnChange('email', text)}
        error={dirty?.email ? errors?.email : ''}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <CustomInput
        label="Password"
        value={values?.password}
        onChangeText={(text) => handleOnChange('password', text)}
        error={dirty?.password ? errors?.password : ''}
      />
      <CustomButton
        title="Log In"
        onPress={() => handleOnSubmit()}
        disabled={loading || disable}
      />
    </View>
  );
};

export default LoginForm;
