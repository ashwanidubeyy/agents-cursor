import React from 'react';
import { View, Text } from 'react-native';
import { TITLES } from '@constants/titles';
import { TIMELINE_EVENT_TYPES } from '@constants/tickets';
import { formatDate } from '@utility/formatDate';
import styles from './style';

const getEventLabel = (type) => {
  const map = {
    [TIMELINE_EVENT_TYPES.CREATED]: TITLES.TIMELINE.CREATED,
    [TIMELINE_EVENT_TYPES.STATUS_CHANGED]: TITLES.TIMELINE.STATUS_CHANGED,
    [TIMELINE_EVENT_TYPES.PRIORITY_CHANGED]: TITLES.TIMELINE.PRIORITY_CHANGED,
    [TIMELINE_EVENT_TYPES.ASSIGNED]: TITLES.TIMELINE.ASSIGNED,
    [TIMELINE_EVENT_TYPES.COMMENT_ADDED]: TITLES.TIMELINE.COMMENT_ADDED,
  };
  return map[type] || type;
};

const TimelineList = ({ events }) => {
  if (!events?.length) {
    return <Text style={styles.empty}>{TITLES.TICKET_DETAILS.NO_TIMELINE}</Text>;
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime(),
  );

  return (
    <View>
      {sorted?.map?.((event) => (
        <View key={event?.id} style={styles.item}>
          <View style={styles.dot} />
          <View style={styles.content}>
            <Text style={styles.title}>{getEventLabel(event?.type)}</Text>
            <Text style={styles.description}>{event?.description}</Text>
            <Text style={styles.date}>{formatDate(event?.createdAt)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default TimelineList;
