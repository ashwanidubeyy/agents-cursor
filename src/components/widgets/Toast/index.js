import React, { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '@store/Common/actions';
import styles from './style';

const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state?.common?.toast);

  useEffect(() => {
    if (toast?.message) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast?.message, dispatch]);

  if (!toast?.message) {
    return null;
  }

  const isSuccess = toast?.toastType === 'success';

  return (
    <TouchableOpacity
      style={[styles.container, isSuccess ? styles.success : styles.error]}
      onPress={() => dispatch(hideToast())}
      accessibilityRole="alert"
      accessibilityLabel={toast?.message}
      activeOpacity={0.9}>
      <Text style={styles.text}>{toast?.message}</Text>
    </TouchableOpacity>
  );
};

export default Toast;
