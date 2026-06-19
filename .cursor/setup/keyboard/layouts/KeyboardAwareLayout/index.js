import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { useKeyboardInsets } from '@hooks/useKeyboardInsets';
import styles from './style';

const KeyboardInsetsContext = createContext(null);

export const useKeyboardAwareInsets = () => useContext(KeyboardInsetsContext);

const KeyboardAwareLayout = ({ children, footer, footerStyle }) => {
  const layoutInsets = useKeyboardInsets();
  const content =
    typeof children === 'function' ? children(layoutInsets) : children;

  if (!footer) {
    return (
      <KeyboardInsetsContext.Provider value={layoutInsets}>
        <View style={styles.container}>{content}</View>
      </KeyboardInsetsContext.Provider>
    );
  }

  return (
    <KeyboardInsetsContext.Provider value={layoutInsets}>
      <View style={styles.container}>
        <View style={styles.content}>{content}</View>
        <View
          onLayout={layoutInsets.onFooterLayout}
          style={[styles.footer, { bottom: layoutInsets.footerBottom }, footerStyle]}>
          {footer}
        </View>
      </View>
    </KeyboardInsetsContext.Provider>
  );
};

export default KeyboardAwareLayout;
