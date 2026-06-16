import styled from "styled-components";

/**
 * Template styles. Swap the literal values for your `@/theme` tokens
 * (COLORS / TYPOGRAPHY / spacing) once the theme is set up.
 */

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 28rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const Error = styled.span`
  font-size: 0.75rem;
  color: #dc2626;
  min-height: 0.9rem;
`;

const Submit = styled.button`
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: #6366f1;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ExampleFormStyles = {
  Form,
  Field,
  Label,
  Input,
  Error,
  Submit,
};
