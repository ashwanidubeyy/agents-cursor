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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  ticketId: {
    fontSize: fontSize._12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginBottom: moderateScale(4),
  },
  subject: {
    fontSize: fontSize._20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(12),
  },
  badges: {
    flexDirection: 'row',
    gap: moderateScale(8),
    marginBottom: moderateScale(16),
  },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: moderateScale(16),
  },
  sectionTitle: {
    fontSize: fontSize._16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  detailText: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: moderateScale(4),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: moderateScale(12),
  },
  actionLink: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    minHeight: moderateScale(44),
    justifyContent: 'center',
  },
  actionLinkText: {
    fontSize: fontSize._14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  inputSection: {
    marginBottom: moderateScale(16),
  },
  textInput: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minHeight: moderateScale(80),
    textAlignVertical: 'top',
    marginBottom: moderateScale(8),
  },
  attachment: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: moderateScale(4),
  },
  emptyText: {
    fontSize: fontSize._14,
    fontWeight: '400',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: moderateScale(8),
  },
  errorText: {
    fontSize: fontSize._16,
    fontWeight: '400',
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: moderateScale(16),
  },
});
