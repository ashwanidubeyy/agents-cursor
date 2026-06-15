import React, { memo } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import StatusBadge from '@widgets/StatusBadge';
import PriorityBadge from '@widgets/PriorityBadge';
import { TITLES } from '@constants/titles';
import { formatDateShort } from '@utility/formatDate';
import styles from './style';

const TicketListItem = ({ ticket, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(ticket)}
      accessibilityRole="button"
      accessibilityLabel={`${ticket?.id}, ${ticket?.subject}`}
      activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.ticketId}>{ticket?.id}</Text>
        <Text style={styles.date}>{formatDateShort(ticket?.createdAt)}</Text>
      </View>
      <Text style={styles.subject} numberOfLines={1}>
        {ticket?.subject}
      </Text>
      <Text style={styles.customer}>
        {`${TITLES.LABELS.CUSTOMER_NAME}: ${ticket?.customerName}`}
      </Text>
      <View style={styles.badges}>
        <StatusBadge status={ticket?.status} />
        <PriorityBadge priority={ticket?.priority} />
      </View>
    </TouchableOpacity>
  );
};

export default memo(TicketListItem);
