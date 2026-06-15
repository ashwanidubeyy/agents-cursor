import { useState, useCallback } from 'react';
import { TICKET_PRIORITY } from '@constants/tickets';
import { validateCreateTicketForm } from '@utility/validators';

const INITIAL_FORM = {
  customerName: '',
  customerEmail: '',
  subject: '',
  description: '',
  priority: TICKET_PRIORITY.MEDIUM,
};

export const useTicketForm = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const validate = useCallback(() => {
    const validationErrors = validateCreateTicketForm(form);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [form]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
  }, []);

  const isValid = Object.keys(validateCreateTicketForm(form)).length === 0;

  return { form, errors, updateField, validate, resetForm, isValid };
};
