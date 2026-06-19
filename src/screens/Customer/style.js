import { StyleSheet, Platform } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { COLORS } from '@constants/colors';
import { fontSize } from '@constants/fonts';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16, 0.9),
    paddingVertical: verticalScale(12, 0.9),
    borderBottomWidth: moderateScale(1, 0.9),
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    minWidth: moderateScale(44, 0.9),
    minHeight: moderateScale(44, 0.9),
    justifyContent: 'center',
  },
  backText: {
    fontSize: moderateScale(fontSize._16, 0.9),
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  title: {
    fontSize: moderateScale(fontSize._18, 0.9),
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: moderateScale(10, 0.9),
    paddingVertical: moderateScale(4, 0.9),
    borderRadius: moderateScale(12, 0.9),
    minHeight: moderateScale(28, 0.9),
    justifyContent: 'center',
  },
  statusConnected: {
    backgroundColor: COLORS.BADGE_BG_RESOLVED,
  },
  statusDisconnected: {
    backgroundColor: COLORS.BADGE_BG_HIGH,
  },
  statusText: {
    fontSize: moderateScale(fontSize._12, 0.9),
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: moderateScale(16, 0.9),
    paddingBottom: verticalScale(24, 0.9),
    flexGrow: 1,
  },
  empty: {
    fontSize: moderateScale(fontSize._14, 0.9),
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: verticalScale(40, 0.9),
  },
  bubbleRow: {
    marginBottom: verticalScale(10, 0.9),
    maxWidth: '85%',
  },
  bubbleRowIncoming: {
    alignSelf: 'flex-start',
  },
  bubbleRowOutgoing: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: moderateScale(14, 0.9),
    paddingVertical: verticalScale(10, 0.9),
    borderRadius: moderateScale(14, 0.9),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  bubbleIncoming: {
    backgroundColor: COLORS.SURFACE,
  },
  bubbleOutgoing: {
    backgroundColor: COLORS.PRIMARY,
  },
  bubbleText: {
    fontSize: moderateScale(fontSize._14, 0.9),
    fontWeight: '400',
    lineHeight: moderateScale(20, 0.9),
  },
  bubbleTextIncoming: {
    color: COLORS.TEXT_PRIMARY,
  },
  bubbleTextOutgoing: {
    color: COLORS.WHITE,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: moderateScale(12, 0.9),
    paddingVertical: verticalScale(10, 0.9),
    borderTopWidth: moderateScale(1, 0.9),
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    gap: moderateScale(8, 0.9),
  },
  input: {
    flex: 1,
    minHeight: moderateScale(44, 0.9),
    maxHeight: verticalScale(120, 0.9),
    borderWidth: moderateScale(1, 0.9),
    borderColor: COLORS.BORDER,
    borderRadius: moderateScale(12, 0.9),
    paddingHorizontal: moderateScale(12, 0.9),
    paddingVertical: verticalScale(10, 0.9),
    fontSize: moderateScale(fontSize._14, 0.9),
    fontWeight: '400',
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  sendButton: {
    minWidth: moderateScale(72, 0.9),
    minHeight: moderateScale(44, 0.9),
    borderRadius: moderateScale(12, 0.9),
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(12, 0.9),
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.BORDER,
  },
  sendText: {
    fontSize: moderateScale(fontSize._14, 0.9),
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});
