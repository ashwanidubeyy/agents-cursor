import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontFamily, fontSize } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  title: {
    fontFamily: fontFamily.BOLD,
    fontSize: fontSize._20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  message: {
    fontFamily: fontFamily.REGULAR,
    fontSize: fontSize._16,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: verticalScale(32),
    lineHeight: moderateScale(24),
  },
});
