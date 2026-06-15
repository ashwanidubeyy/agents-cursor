import { StyleSheet, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.WHITE,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderLeftWidth: moderateScale(4),
    borderLeftColor: COLORS.PRIMARY,
    minHeight: moderateScale(100),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  label: {
    fontSize: fontSize._12,
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: moderateScale(8),
  },
  value: {
    fontSize: fontSize._28,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
});
