import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';
import { useKeyboardHeight } from './useKeyboardHeight';

export const useKeyboardInsets = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [footerHeight, setFooterHeight] = useState(0);

  const footerBottom = keyboardHeight > 0 ? keyboardHeight : safeAreaInsets.bottom;
  const edgePadding = verticalScale(10, 0.9);

  const scrollPaddingBottom = useMemo(() => {
    const bottomSpace = keyboardHeight > 0 ? keyboardHeight : safeAreaInsets.bottom;
    return footerHeight + bottomSpace + edgePadding;
  }, [edgePadding, footerHeight, keyboardHeight, safeAreaInsets.bottom]);

  const onFooterLayout = useCallback((event) => {
    setFooterHeight(event?.nativeEvent?.layout?.height ?? 0);
  }, []);

  return {
    footerBottom,
    footerHeight,
    scrollPaddingBottom,
    edgePadding,
    keyboardHeight,
    safeAreaBottom: safeAreaInsets.bottom,
    onFooterLayout,
    isKeyboardVisible: keyboardHeight > 0,
  };
};
