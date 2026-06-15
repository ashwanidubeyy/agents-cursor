import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenPadding: {
    paddingHorizontal: moderateScale(16),
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: moderateScale(8),
  },
});
