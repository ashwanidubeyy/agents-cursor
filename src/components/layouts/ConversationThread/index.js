import React from 'react';
import { View, Text } from 'react-native';
import { TITLES } from '@constants/titles';
import { COMMENT_TYPES } from '@constants/tickets';
import { formatDate } from '@utility/formatDate';
import styles from './style';

const ConversationThread = ({ messages }) => {
  if (!messages?.length) {
    return <Text style={styles.empty}>{TITLES.TICKET_DETAILS.NO_CONVERSATION}</Text>;
  }

  return (
    <View>
      {messages?.map?.((msg) => {
        const isAgent = msg?.type === COMMENT_TYPES.AGENT_REPLY;
        const isNote = msg?.type === COMMENT_TYPES.INTERNAL_NOTE;
        const bubbleStyle = isNote ? styles.noteBubble : isAgent ? styles.agentBubble : styles.customerBubble;
        return (
          <View key={msg?.id} style={[styles.bubble, bubbleStyle]}>
            <Text style={styles.author}>{msg?.author}</Text>
            <Text style={styles.text}>{msg?.text}</Text>
            <Text style={styles.date}>{formatDate(msg?.createdAt)}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default ConversationThread;
