import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  scroll: {
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: moderateScale(24),
  },
  spacer: {
    height: moderateScale(12),
  },
});
