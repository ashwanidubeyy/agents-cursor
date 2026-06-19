import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { verticalScale } from 'react-native-size-matters';
import BaseScreen from '@layouts/BaseScreen';
import ChatKeyboardLayout from '@layouts/ChatKeyboardLayout';
import { TITLES, TEST_IDS } from '@constants';
import { Customer_CONSTANTS } from '@constants/customer';
import { useCustomerSocket } from '@hooks/useCustomerSocket';
import { SOCKET_URL } from '@utility/socketConfig';
import styles from './style';

const formatPayloadText = (payload) => {
  if (typeof payload === 'string') {
    return payload;
  }
  if (payload?.text) {
    return payload.text;
  }
  if (payload?.message) {
    return payload.message;
  }
  return JSON.stringify(payload ?? '');
};

const Customer = ({ navigation }) => {
  const listRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const { isConnected, lastMessage, sendMessage } = useCustomerSocket(SOCKET_URL);

  const scrollToBottom = useCallback(() => {
    if (messages?.length > 0) {
      listRef.current?.scrollToEnd?.({ animated: true });
    }
  }, [messages?.length]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `in-${Date.now()}-${prev.length}`,
        text: formatPayloadText(lastMessage),
        incoming: true,
      },
    ]);
  }, [lastMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length, scrollToBottom]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(showEvent, scrollToBottom);
    return () => subscription.remove();
  }, [scrollToBottom]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSend = useCallback(() => {
    const trimmed = draft?.trim?.() ?? '';
    if (!trimmed) {
      return;
    }
    const payload = {
      channel: Customer_CONSTANTS.SOCKET.CHANNEL,
      text: trimmed,
    };
    sendMessage(payload);
    setMessages((prev) => [
      ...prev,
      {
        id: `out-${Date.now()}-${prev.length}`,
        text: trimmed,
        incoming: false,
      },
    ]);
    setDraft('');
  }, [draft, sendMessage]);

  const handleInputFocus = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const renderMessage = useCallback(({ item }) => {
    const isIncoming = item?.incoming;
    return (
      <View
        style={[
          styles.bubbleRow,
          isIncoming ? styles.bubbleRowIncoming : styles.bubbleRowOutgoing,
        ]}>
        <View
          style={[
            styles.bubble,
            isIncoming ? styles.bubbleIncoming : styles.bubbleOutgoing,
          ]}>
          <Text
            style={[
              styles.bubbleText,
              isIncoming ? styles.bubbleTextIncoming : styles.bubbleTextOutgoing,
            ]}
            numberOfLines={0}>
            {item?.text}
          </Text>
        </View>
      </View>
    );
  }, []);

  const statusLabel = isConnected
    ? TITLES.CUSTOMER.CONNECTED
    : SOCKET_URL
      ? TITLES.CUSTOMER.CONNECTING
      : TITLES.CUSTOMER.DISCONNECTED;

  const canSend = Boolean(draft?.trim?.()) && isConnected;

  const composer = (
    <View style={[styles.composer, { paddingBottom: verticalScale(10, 0.9) }]}>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        onFocus={handleInputFocus}
        placeholder={TITLES.CUSTOMER.MESSAGE_PLACEHOLDER}
        multiline
        testID={TEST_IDS.CUSTOMER.MESSAGE_INPUT}
      />
      <TouchableOpacity
        style={[styles.sendButton, canSend ? null : styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={TITLES.CUSTOMER.SEND}
        testID={TEST_IDS.CUSTOMER.SEND_BUTTON}>
        <Text style={styles.sendText}>{TITLES.CUSTOMER.SEND}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseScreen edges={['top', 'left', 'right']}>
      <View style={styles.flex} testID={TEST_IDS.CUSTOMER.SCREEN}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={TITLES.CUSTOMER.BACK}>
            <Text style={styles.backText}>{TITLES.CUSTOMER.BACK}</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {TITLES.CUSTOMER.TITLE}
          </Text>
          <View
            style={[
              styles.statusBadge,
              isConnected ? styles.statusConnected : styles.statusDisconnected,
            ]}>
            <Text style={styles.statusText} numberOfLines={1}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <ChatKeyboardLayout footer={composer}>
          {(layoutInsets) => (
            <FlatList
              ref={listRef}
              style={styles.list}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: layoutInsets.listPaddingBottom },
              ]}
              data={messages}
              keyExtractor={(item) => item?.id}
              renderItem={renderMessage}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets={false}
              ListEmptyComponent={
                <Text style={styles.empty}>{TITLES.CUSTOMER.EMPTY}</Text>
              }
            />
          )}
        </ChatKeyboardLayout>
      </View>
    </BaseScreen>
  );
};

export default Customer;
