import { StyleSheet, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  fab: {
    position: 'absolute',
    right: moderateScale(20, 0.9),
    minWidth: moderateScale(56, 0.9),
    minHeight: moderateScale(56, 0.9),
    borderRadius: moderateScale(28, 0.9),
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 998,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  fabIcon: {
    fontSize: moderateScale(fontSize._22, 0.9),
    fontWeight: '700',
    color: COLORS.WHITE,
  },
});
