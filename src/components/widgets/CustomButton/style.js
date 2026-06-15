import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS, fontFamily, fontSize } from '@constants';

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: COLORS.BORDER,
  },
  title: {
    color: COLORS.WHITE,
    fontFamily: fontFamily.SEMI_BOLD,
    fontSize: fontSize._16,
  },
});

export default styles;
