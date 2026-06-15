import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Pressable } from 'react-native';
import { TITLES } from '@constants/titles';
import styles from './style';

const AssignmentSheet = ({
  visible,
  agents,
  currentAgentId,
  onAssignSelf,
  onAssignAgent,
  onUnassign,
  onClose,
  disabled,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{TITLES.TICKET_DETAILS.ASSIGNMENT}</Text>
          <TouchableOpacity
            style={[styles.option, disabled ? styles.disabled : null]}
            onPress={onAssignSelf}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={TITLES.TICKET_DETAILS.ASSIGN_SELF}>
            <Text style={styles.optionText}>{TITLES.TICKET_DETAILS.ASSIGN_SELF}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, disabled ? styles.disabled : null]}
            onPress={onUnassign}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={TITLES.TICKET_DETAILS.UNASSIGN}>
            <Text style={styles.optionText}>{TITLES.TICKET_DETAILS.UNASSIGN}</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>{TITLES.TICKET_DETAILS.ASSIGN_OTHER}</Text>
          <FlatList
            data={agents?.filter?.((a) => a?.id !== currentAgentId) ?? []}
            keyExtractor={(item) => item?.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, disabled ? styles.disabled : null]}
                onPress={() => onAssignAgent?.(item?.id)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={item?.name}>
                <Text style={styles.optionText}>{item?.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AssignmentSheet;
