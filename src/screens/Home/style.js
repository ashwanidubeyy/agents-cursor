import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS, fontFamily, fontSize } from '@constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: moderateScale(24),
  },
  title: {
    fontFamily: fontFamily.BOLD,
    fontSize: fontSize._24,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: moderateScale(8),
  },
  subtitle: {
    fontFamily: fontFamily.REGULAR,
    fontSize: fontSize._16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: moderateScale(24),
  },
});

export default styles;
