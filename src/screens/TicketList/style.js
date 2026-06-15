import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(16),
  },
  title: {
    fontSize: fontSize._24,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(16),
  },
  sortButton: {
    alignSelf: 'flex-end',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    marginBottom: moderateScale(8),
    minHeight: moderateScale(44),
    justifyContent: 'center',
  },
  sortText: {
    fontSize: fontSize._14,
    fontWeight: '500',
    color: COLORS.PRIMARY,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: moderateScale(24),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(48),
  },
  emptyText: {
    fontSize: fontSize._16,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: moderateScale(16),
  },
  footer: {
    paddingVertical: moderateScale(16),
  },
  footerText: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    paddingVertical: moderateScale(16),
  },
});
