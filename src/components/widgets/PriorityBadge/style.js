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
  low: {
    backgroundColor: COLORS.BADGE_BG_LOW,
    color: COLORS.PRIORITY_LOW,
  },
  medium: {
    backgroundColor: COLORS.BADGE_BG_MEDIUM,
    color: COLORS.PRIORITY_MEDIUM,
  },
  high: {
    backgroundColor: COLORS.BADGE_BG_HIGH,
    color: COLORS.PRIORITY_HIGH,
  },
});
