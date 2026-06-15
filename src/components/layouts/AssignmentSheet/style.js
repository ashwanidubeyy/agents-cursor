import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';
export default StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.MODAL_OVERLAY,
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    padding: moderateScale(20),
    maxHeight: '60%',
  },
  title: {
    fontSize: fontSize._18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(16),
  },
  subtitle: {
    fontSize: fontSize._14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginTop: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  option: {
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    minHeight: moderateScale(44),
    justifyContent: 'center',
  },
  optionText: {
    fontSize: fontSize._16,
    fontWeight: '400',
    color: COLORS.TEXT_PRIMARY,
  },
  disabled: {
    opacity: 0.4,
  },
});
