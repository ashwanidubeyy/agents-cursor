import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: moderateScale(16),
    paddingBottom: moderateScale(32),
  },
  title: {
    fontSize: fontSize._24,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(20),
  },
  label: {
    fontSize: fontSize._14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(8),
  },
  spacer: {
    height: moderateScale(16),
  },
});
