import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { useChatKeyboardInsets } from '@hooks/useChatKeyboardInsets';
import styles from './style';

const ChatKeyboardInsetsContext = createContext(null);

export const useChatKeyboardLayoutInsets = () => useContext(ChatKeyboardInsetsContext);

const ChatKeyboardLayout = ({ children, footer, footerStyle }) => {
  const layoutInsets = useChatKeyboardInsets();
  const content =
    typeof children === 'function' ? children(layoutInsets) : children;

  return (
    <ChatKeyboardInsetsContext.Provider value={layoutInsets}>
      <View style={styles.container}>
        <View style={styles.content}>{content}</View>
        <View
          onLayout={layoutInsets.onFooterLayout}
          style={[styles.footer, { bottom: layoutInsets.footerBottom }, footerStyle]}>
          {footer}
        </View>
      </View>
    </ChatKeyboardInsetsContext.Provider>
  );
};

export default ChatKeyboardLayout;
