import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BaseScreen from '@layouts/BaseScreen';
import OfflineBanner from '@layouts/OfflineBanner';
import StatusBadge from '@widgets/StatusBadge';
import PriorityBadge from '@widgets/PriorityBadge';
import CustomButton from '@widgets/CustomButton';
import FilterChips from '@widgets/FilterChips';
import ConversationThread from '@layouts/ConversationThread';
import TimelineList from '@layouts/TimelineList';
import AssignmentSheet from '@layouts/AssignmentSheet';
import {
  TITLES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  COLORS,
  ALERTS,
  COMMENT_TYPES,
} from '@constants';
import { formatDate } from '@utility/formatDate';
import { getAgentNameById } from '@utility/ticketSelectors';
import { validateReply, validateNote } from '@utility/validators';
import {
  fetchTicketDetails,
  updateTicket,
  addComment,
  fetchAgents,
  sendReply,
  retryPendingReply,
} from '@store/Tickets/actions';
import { setPendingReply, showToast } from '@store/Common/actions';
import styles from './style';

const STATUS_OPTIONS = [
  { label: TITLES.STATUS.OPEN, value: TICKET_STATUS.OPEN },
  { label: TITLES.STATUS.IN_PROGRESS, value: TICKET_STATUS.IN_PROGRESS },
  { label: TITLES.STATUS.RESOLVED, value: TICKET_STATUS.RESOLVED },
];

const PRIORITY_OPTIONS = [
  { label: TITLES.PRIORITY.LOW, value: TICKET_PRIORITY.LOW },
  { label: TITLES.PRIORITY.MEDIUM, value: TICKET_PRIORITY.MEDIUM },
  { label: TITLES.PRIORITY.HIGH, value: TICKET_PRIORITY.HIGH },
];

const TicketDetails = ({ route, navigation }) => {
  const ticketId = route?.params?.ticketId;
  const dispatch = useDispatch();
  const isOnline = useSelector((state) => state?.common?.isOnline);
  const currentAgentId = useSelector((state) => state?.common?.currentAgentId);
  const pendingReply = useSelector((state) => state?.common?.pendingReply);
  const agents = useSelector((state) => state?.tickets?.agents?.items);
  const detailState = useSelector((state) => state?.tickets?.detailsById?.[ticketId]);
  const ticket = detailState?.data;

  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showAssignment, setShowAssignment] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchTicketDetails(ticketId));
      dispatch(fetchAgents());
    }
  }, [dispatch, ticketId]);

  useEffect(() => {
    if (pendingReply?.ticketId === ticketId && pendingReply?.text) {
      setReplyText(pendingReply.text);
      setShowReplyInput(true);
    }
  }, [pendingReply, ticketId]);

  const isResolved = ticket?.status === TICKET_STATUS.RESOLVED;
  const actionsDisabled = !isOnline;

  const handleStatusChange = useCallback(
    (status) => {
      if (actionsDisabled) {
        dispatch(showToast(ALERTS.OFFLINE_ACTION));
        return;
      }
      dispatch(updateTicket(ticketId, { status }));
    },
    [dispatch, ticketId, actionsDisabled],
  );

  const handlePriorityChange = useCallback(
    (priority) => {
      if (actionsDisabled) {
        dispatch(showToast(ALERTS.OFFLINE_ACTION));
        return;
      }
      dispatch(updateTicket(ticketId, { priority }));
    },
    [dispatch, ticketId, actionsDisabled],
  );

  const handleAssignSelf = useCallback(() => {
    if (isResolved) {
      dispatch(showToast(ALERTS.REASSIGN_RESOLVED));
      return;
    }
    if (actionsDisabled) {
      dispatch(showToast(ALERTS.OFFLINE_ACTION));
      return;
    }
    dispatch(updateTicket(ticketId, { assignedTo: currentAgentId }));
    setShowAssignment(false);
  }, [dispatch, ticketId, currentAgentId, isResolved, actionsDisabled]);

  const handleAssignAgent = useCallback(
    (agentId) => {
      if (isResolved) {
        dispatch(showToast(ALERTS.REASSIGN_RESOLVED));
        return;
      }
      if (actionsDisabled) {
        dispatch(showToast(ALERTS.OFFLINE_ACTION));
        return;
      }
      dispatch(updateTicket(ticketId, { assignedTo: agentId }));
      setShowAssignment(false);
    },
    [dispatch, ticketId, isResolved, actionsDisabled],
  );

  const handleUnassign = useCallback(() => {
    if (isResolved) {
      dispatch(showToast(ALERTS.REASSIGN_RESOLVED));
      return;
    }
    if (actionsDisabled) {
      dispatch(showToast(ALERTS.OFFLINE_ACTION));
      return;
    }
    dispatch(updateTicket(ticketId, { assignedTo: null }));
    setShowAssignment(false);
  }, [dispatch, ticketId, isResolved, actionsDisabled]);

  const handleSendReply = useCallback(() => {
    const error = validateReply(replyText);
    if (error) {
      dispatch(showToast(error));
      return;
    }
    if (!isOnline) {
      dispatch(setPendingReply(ticketId, replyText));
      dispatch(showToast(ALERTS.OFFLINE_ACTION));
      return;
    }
    const agentName = getAgentNameById(agents, currentAgentId);
    dispatch(sendReply(ticketId, replyText, agentName)).then(() => {
      setReplyText('');
      setShowReplyInput(false);
    });
  }, [dispatch, replyText, ticketId, isOnline, agents, currentAgentId]);

  const handleRetryReply = useCallback(() => {
    dispatch(retryPendingReply()).then(() => {
      setReplyText('');
      setShowReplyInput(false);
    });
  }, [dispatch]);

  const handleAddNote = useCallback(() => {
    const error = validateNote(noteText);
    if (error) {
      dispatch(showToast(error));
      return;
    }
    if (actionsDisabled) {
      dispatch(showToast(ALERTS.OFFLINE_ACTION));
      return;
    }
    const agentName = getAgentNameById(agents, currentAgentId);
    dispatch(
      addComment(ticketId, {
        type: COMMENT_TYPES.INTERNAL_NOTE,
        author: agentName,
        text: noteText,
      }, () => {
        setNoteText('');
        setShowNoteInput(false);
      }),
    );
  }, [dispatch, noteText, ticketId, actionsDisabled, agents, currentAgentId]);

  const handleRetryFetch = useCallback(() => {
    dispatch(fetchTicketDetails(ticketId));
  }, [dispatch, ticketId]);

  if (detailState?.isLoading && !ticket) {
    return (
      <BaseScreen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </BaseScreen>
    );
  }

  if (detailState?.error && !ticket) {
    return (
      <BaseScreen>
        <View style={styles.center}>
          <Text style={styles.errorText}>{detailState.error}</Text>
          <CustomButton title={TITLES.LABELS.RETRY} onPress={handleRetryFetch} />
        </View>
      </BaseScreen>
    );
  }

  const hasPendingReply = pendingReply?.ticketId === ticketId && pendingReply?.text;

  return (
    <BaseScreen>
      <OfflineBanner />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.ticketId}>{ticket?.id}</Text>
          <Text style={styles.subject}>{ticket?.subject}</Text>
          <View style={styles.badges}>
            <StatusBadge status={ticket?.status} />
            <PriorityBadge priority={ticket?.priority} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{TITLES.TICKET_DETAILS.CUSTOMER_DETAILS}</Text>
            <Text style={styles.detailText}>{ticket?.customerName}</Text>
            <Text style={styles.detailText}>{ticket?.customerEmail}</Text>
            <Text style={styles.detailText}>
              {`${TITLES.LABELS.CREATED}: ${formatDate(ticket?.createdAt)}`}
            </Text>
            <Text style={styles.detailText}>
              {`${TITLES.LABELS.ASSIGNED_TO}: ${
                ticket?.assignedTo
                  ? getAgentNameById(agents, ticket.assignedTo)
                  : TITLES.LABELS.UNASSIGNED
              }`}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>{TITLES.TICKET_DETAILS.CHANGE_STATUS}</Text>
          <FilterChips
            options={STATUS_OPTIONS}
            selectedValue={ticket?.status}
            onSelect={handleStatusChange}
          />

          <Text style={styles.sectionTitle}>{TITLES.TICKET_DETAILS.CHANGE_PRIORITY}</Text>
          <FilterChips
            options={PRIORITY_OPTIONS}
            selectedValue={ticket?.priority}
            onSelect={handlePriorityChange}
          />

          <CustomButton
            title={TITLES.TICKET_DETAILS.ASSIGNMENT}
            onPress={() => setShowAssignment(true)}
            disabled={isResolved}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionLink}
              onPress={() => setShowReplyInput(!showReplyInput)}
              accessibilityRole="button">
              <Text style={styles.actionLinkText}>{TITLES.TICKET_DETAILS.REPLY}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionLink}
              onPress={() => setShowNoteInput(!showNoteInput)}
              accessibilityRole="button">
              <Text style={styles.actionLinkText}>{TITLES.TICKET_DETAILS.INTERNAL_NOTE}</Text>
            </TouchableOpacity>
          </View>

          {showReplyInput ? (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                value={replyText}
                onChangeText={(text) => {
                  setReplyText(text);
                  dispatch(setPendingReply(ticketId, text));
                }}
                multiline
                placeholder={TITLES.TICKET_DETAILS.REPLY}
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                accessibilityLabel={TITLES.TICKET_DETAILS.REPLY}
              />
              <CustomButton
                title={TITLES.TICKET_DETAILS.REPLY}
                onPress={handleSendReply}
                disabled={actionsDisabled && !hasPendingReply}
              />
              {hasPendingReply && !isOnline ? (
                <CustomButton
                  title={TITLES.TICKET_DETAILS.RETRY_REPLY}
                  onPress={handleRetryReply}
                />
              ) : null}
            </View>
          ) : null}

          {showNoteInput ? (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                placeholder={TITLES.TICKET_DETAILS.INTERNAL_NOTE}
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                accessibilityLabel={TITLES.TICKET_DETAILS.INTERNAL_NOTE}
              />
              <CustomButton
                title={TITLES.TICKET_DETAILS.INTERNAL_NOTE}
                onPress={handleAddNote}
                disabled={actionsDisabled}
              />
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>{TITLES.TICKET_DETAILS.CONVERSATION}</Text>
          <ConversationThread messages={ticket?.conversation} />

          <Text style={styles.sectionTitle}>{TITLES.TICKET_DETAILS.ATTACHMENTS}</Text>
          {ticket?.attachments?.length ? (
            ticket.attachments.map((att) => (
              <Text key={att?.id} style={styles.attachment}>
                {`${att?.name} (${att?.type})`}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>{TITLES.TICKET_DETAILS.NO_ATTACHMENTS}</Text>
          )}

          <Text style={styles.sectionTitle}>{TITLES.TICKET_DETAILS.TIMELINE}</Text>
          <TimelineList events={ticket?.timeline} />
        </ScrollView>
      </KeyboardAvoidingView>

      <AssignmentSheet
        visible={showAssignment}
        agents={agents}
        currentAgentId={currentAgentId}
        onAssignSelf={handleAssignSelf}
        onAssignAgent={handleAssignAgent}
        onUnassign={handleUnassign}
        onClose={() => setShowAssignment(false)}
        disabled={isResolved || actionsDisabled}
      />
    </BaseScreen>
  );
};

export default TicketDetails;
