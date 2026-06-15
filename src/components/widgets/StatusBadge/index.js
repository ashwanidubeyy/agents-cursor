import React from 'react';
import { View, Text } from 'react-native';
import { TICKET_STATUS } from '@constants/tickets';
import { getStatusLabel } from '@utility/ticketSelectors';
import styles from './style';

const StatusBadge = ({ status }) => {
  const badgeStyle =
    status === TICKET_STATUS.OPEN
      ? styles.open
      : status === TICKET_STATUS.IN_PROGRESS
        ? styles.inProgress
        : styles.resolved;

  return (
    <View style={[styles.badge, badgeStyle]} accessibilityRole="text">
      <Text style={[styles.text, badgeStyle]}>{getStatusLabel(status)}</Text>
    </View>
  );
};

export default StatusBadge;
