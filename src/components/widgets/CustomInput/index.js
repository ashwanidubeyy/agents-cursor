import React from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from './style';

const CustomInput = ({
  label,
  value,
  onChangeText,
  error,
  maxLength,
  multiline,
  keyboardType,
  autoCapitalize,
  testID,
  errorTestID,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.multiline : null, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={label}
        testID={testID}
      />
      {maxLength ? (
        <Text style={styles.counter}>{`${value?.length ?? 0}/${maxLength}`}</Text>
      ) : null}
      {error ? (
        <Text style={styles.error} testID={errorTestID}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default CustomInput;
