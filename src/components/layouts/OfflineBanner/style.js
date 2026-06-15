import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.OFFLINE_BANNER,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
  },
  text: {
    fontSize: fontSize._14,
    fontWeight: '500',
    color: COLORS.WHITE,
  },
});
