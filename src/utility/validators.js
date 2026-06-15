import { ALERTS } from '@constants/alerts';
import { NAME_MAX, SUBJECT_MAX, DESCRIPTION_MAX } from '@constants/tickets';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z ]+$/;

export const isRequired = (value) => {
  const trimmed = value?.trim?.() ?? '';
  return trimmed.length > 0 ? null : ALERTS.VALIDATION.REQUIRED;
};

export const isValidEmail = (value) => {
  const trimmed = value?.trim?.() ?? '';
  if (!trimmed) {
    return ALERTS.VALIDATION.REQUIRED;
  }
  return EMAIL_REGEX.test(trimmed) ? null : ALERTS.VALIDATION.EMAIL_INVALID;
};

export const isMaxLength = (value, max, message) => {
  const length = value?.length ?? 0;
  return length <= max ? null : message;
};

export const isValidName = (value) => {
  const trimmed = value?.trim?.() ?? '';
  if (!trimmed) {
    return ALERTS.VALIDATION.REQUIRED;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return ALERTS.VALIDATION.NAME_INVALID;
  }
  return trimmed.length <= NAME_MAX ? null : ALERTS.VALIDATION.NAME_MAX;
};

export const validateCreateTicketForm = (form) => {
  const errors = {};
  const nameError = isValidName(form?.customerName);
  if (nameError) {
    errors.customerName = nameError;
  }
  const emailError = isValidEmail(form?.customerEmail);
  if (emailError) {
    errors.customerEmail = emailError;
  }
  const subjectError = isRequired(form?.subject) || isMaxLength(form?.subject, SUBJECT_MAX, ALERTS.VALIDATION.SUBJECT_MAX);
  if (subjectError) {
    errors.subject = subjectError;
  }
  const descError = isRequired(form?.description) || isMaxLength(form?.description, DESCRIPTION_MAX, ALERTS.VALIDATION.DESCRIPTION_MAX);
  if (descError) {
    errors.description = descError;
  }
  return errors;
};

export const validateReply = (text) => {
  const trimmed = text?.trim?.() ?? '';
  return trimmed.length > 0 ? null : ALERTS.VALIDATION.REPLY_REQUIRED;
};

export const validateNote = (text) => {
  const trimmed = text?.trim?.() ?? '';
  return trimmed.length > 0 ? null : ALERTS.VALIDATION.NOTE_REQUIRED;
};
