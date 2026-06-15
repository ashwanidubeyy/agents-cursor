import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  bubble: {
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: moderateScale(10),
  },
  customerBubble: {
    backgroundColor: COLORS.SURFACE,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  agentBubble: {
    backgroundColor: COLORS.BADGE_BG_OPEN,
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  noteBubble: {
    backgroundColor: COLORS.BADGE_BG_MEDIUM,
    alignSelf: 'center',
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
  },
  author: {
    fontSize: fontSize._12,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(4),
  },
  text: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_PRIMARY,
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
