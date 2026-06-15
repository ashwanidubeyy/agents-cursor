import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  item: {
    flexDirection: 'row',
    marginBottom: moderateScale(16),
  },
  dot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: COLORS.PRIMARY,
    marginTop: moderateScale(6),
    marginRight: moderateScale(12),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize._14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(2),
  },
  description: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: moderateScale(4),
  },
  date: {
    fontSize: fontSize._12,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
  },
  empty: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    paddingVertical: moderateScale(16),
  },
});
