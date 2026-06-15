import { StyleSheet, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: moderateScale(40),
    left: moderateScale(16),
    right: moderateScale(16),
    padding: moderateScale(14),
    borderRadius: moderateScale(10),
    zIndex: 999,
    minHeight: moderateScale(44),
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  success: {
    backgroundColor: COLORS.SUCCESS,
  },
  error: {
    backgroundColor: COLORS.ERROR,
  },
  text: {
    fontSize: fontSize._14,
    fontWeight: '500',
    color: COLORS.WHITE,
    textAlign: 'center',
  },
});
