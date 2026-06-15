import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
  },
  label: {
    fontSize: fontSize._14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(6),
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
  multiline: {
    minHeight: moderateScale(100),
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  error: {
    fontSize: fontSize._12,
    fontWeight: '400',
    color: COLORS.ERROR,
    marginTop: moderateScale(4),
  },
  counter: {
    fontSize: fontSize._12,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: moderateScale(4),
  },
});
