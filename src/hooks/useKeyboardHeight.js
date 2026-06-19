import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

const getKeyboardHeight = (event) => {
  const reportedHeight = event?.endCoordinates?.height ?? 0;
  const screenY = event?.endCoordinates?.screenY;
  const windowHeight = Dimensions.get('window').height;

  if (screenY != null && screenY > 0) {
    return Math.max(reportedHeight, windowHeight - screenY);
  }

  return reportedHeight;
};

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = (event) => {
      setKeyboardHeight(getKeyboardHeight(event));
    };

    const handleHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardHeight;
};
