import { StyleSheet, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minHeight: moderateScale(44),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(6),
  },
  ticketId: {
    fontSize: fontSize._12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  date: {
    fontSize: fontSize._12,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
  },
  subject: {
    fontSize: fontSize._16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(4),
  },
  customer: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: moderateScale(8),
  },
  badges: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
});
