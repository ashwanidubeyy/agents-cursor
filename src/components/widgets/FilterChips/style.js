import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  scroll: {
    marginBottom: moderateScale(8),
  },
  container: {
    flexDirection: 'row',
    gap: moderateScale(8),
    paddingVertical: moderateScale(4),
  },
  chip: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minHeight: moderateScale(44),
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  chipText: {
    fontSize: fontSize._12,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  chipTextSelected: {
    color: COLORS.WHITE,
  },
});
