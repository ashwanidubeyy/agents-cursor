import React from 'react';
import { View, Text } from 'react-native';
import { TICKET_PRIORITY } from '@constants/tickets';
import { getPriorityLabel } from '@utility/ticketSelectors';
import styles from './style';

const PriorityBadge = ({ priority }) => {
  const badgeStyle =
    priority === TICKET_PRIORITY.LOW
      ? styles.low
      : priority === TICKET_PRIORITY.MEDIUM
        ? styles.medium
        : styles.high;

  return (
    <View style={[styles.badge, badgeStyle]} accessibilityRole="text">
      <Text style={[styles.text, badgeStyle]}>{getPriorityLabel(priority)}</Text>
    </View>
  );
};

export default PriorityBadge;
