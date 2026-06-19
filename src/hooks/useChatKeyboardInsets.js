import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';
import { useKeyboardHeight } from './useKeyboardHeight';

export const useChatKeyboardInsets = () => {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [footerHeight, setFooterHeight] = useState(0);

  const footerBottom = keyboardHeight > 0 ? keyboardHeight : insets.bottom;
  const footerPadding = verticalScale(10, 0.9);

  const listPaddingBottom = useMemo(
    () => footerHeight + footerBottom + footerPadding,
    [footerBottom, footerHeight, footerPadding],
  );

  const onFooterLayout = useCallback((event) => {
    setFooterHeight(event?.nativeEvent?.layout?.height ?? 0);
  }, []);

  return {
    footerBottom,
    footerPadding,
    footerHeight,
    listPaddingBottom,
    keyboardHeight,
    onFooterLayout,
    isKeyboardVisible: keyboardHeight > 0,
  };
};
