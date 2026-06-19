import { useKeyboardInsets } from './useKeyboardInsets';

export const useChatKeyboardInsets = () => {
  const insets = useKeyboardInsets();

  return {
    ...insets,
    listPaddingBottom: insets.scrollPaddingBottom,
    footerPadding: insets.edgePadding,
  };
};
