import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BaseScreen from '@layouts/BaseScreen';
import OfflineBanner from '@layouts/OfflineBanner';
import CustomInput from '@widgets/CustomInput';
import CustomButton from '@widgets/CustomButton';
import FilterChips from '@widgets/FilterChips';
import {
  TITLES,
  TICKET_PRIORITY,
  NAME_MAX,
  SUBJECT_MAX,
  DESCRIPTION_MAX,
  ALERTS,
  TEST_IDS,
} from '@constants';
import { useTicketForm } from '@hooks/useTicketForm';
import { createTicket } from '@store/Tickets/actions';
import { showToast } from '@store/Common/actions';
import styles from './style';

const PRIORITY_OPTIONS = [
  { label: TITLES.PRIORITY.LOW, value: TICKET_PRIORITY.LOW },
  { label: TITLES.PRIORITY.MEDIUM, value: TICKET_PRIORITY.MEDIUM },
  { label: TITLES.PRIORITY.HIGH, value: TICKET_PRIORITY.HIGH },
];

const CreateTicket = ({ navigation }) => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state) => state?.common?.isOnline);
  const isSubmitting = useSelector((state) => state?.tickets?.isSubmitting);
  const { form, errors, updateField, validate } = useTicketForm();
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!isOnline) {
      dispatch(showToast(ALERTS.OFFLINE_ACTION));
      return;
    }
    if (!validate() || isSubmitting || isLocalSubmitting) {
      return;
    }
    setIsLocalSubmitting(true);
    dispatch(
      createTicket(form, () => {
        setIsLocalSubmitting(false);
        navigation.goBack();
      }),
    ).then(() => {
      setIsLocalSubmitting(false);
    });
  }, [dispatch, form, validate, isOnline, isSubmitting, isLocalSubmitting, navigation]);

  return (
    <BaseScreen>
      <OfflineBanner />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        testID={TEST_IDS.CREATE_TICKET.SCREEN}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{TITLES.CREATE_TICKET.TITLE}</Text>
          <CustomInput
            label={TITLES.CREATE_TICKET.CUSTOMER_NAME}
            value={form.customerName}
            onChangeText={(v) => updateField('customerName', v)}
            error={errors.customerName}
            maxLength={NAME_MAX}
            testID={TEST_IDS.CREATE_TICKET.NAME_INPUT}
            errorTestID={TEST_IDS.CREATE_TICKET.NAME_ERROR}
          />
          <CustomInput
            label={TITLES.CREATE_TICKET.EMAIL}
            value={form.customerEmail}
            onChangeText={(v) => updateField('customerEmail', v)}
            error={errors.customerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            testID={TEST_IDS.CREATE_TICKET.EMAIL_INPUT}
          />
          <CustomInput
            label={TITLES.CREATE_TICKET.SUBJECT}
            value={form.subject}
            onChangeText={(v) => updateField('subject', v)}
            error={errors.subject}
            maxLength={SUBJECT_MAX}
            testID={TEST_IDS.CREATE_TICKET.SUBJECT_INPUT}
          />
          <CustomInput
            label={TITLES.CREATE_TICKET.DESCRIPTION}
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            error={errors.description}
            maxLength={DESCRIPTION_MAX}
            multiline
            testID={TEST_IDS.CREATE_TICKET.DESCRIPTION_INPUT}
          />
          <Text style={styles.label}>{TITLES.CREATE_TICKET.PRIORITY}</Text>
          <FilterChips
            options={PRIORITY_OPTIONS}
            selectedValue={form.priority}
            onSelect={(v) => updateField('priority', v)}
          />
          <View style={styles.spacer} />
          <CustomButton
            title={TITLES.CREATE_TICKET.SUBMIT}
            onPress={handleSubmit}
            disabled={!isOnline || isSubmitting || isLocalSubmitting}
            testID={TEST_IDS.CREATE_TICKET.SUBMIT}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};

export default CreateTicket;
