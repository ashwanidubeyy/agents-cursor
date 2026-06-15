import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    marginBottom: moderateScale(12),
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minHeight: moderateScale(44),
  },
  placeholderColor: {
    color: COLORS.TEXT_SECONDARY,
  },
});
