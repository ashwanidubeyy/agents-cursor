import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  badge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    minHeight: moderateScale(28),
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize._12,
    fontWeight: '500',
  },
  open: {
    backgroundColor: COLORS.BADGE_BG_OPEN,
    color: COLORS.STATUS_OPEN,
  },
  inProgress: {
    backgroundColor: COLORS.BADGE_BG_IN_PROGRESS,
    color: COLORS.STATUS_IN_PROGRESS,
  },
  resolved: {
    backgroundColor: COLORS.BADGE_BG_RESOLVED,
    color: COLORS.STATUS_RESOLVED,
  },
});
