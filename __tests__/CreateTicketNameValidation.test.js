import { validateCreateTicketForm } from '@utility/validators';

const baseForm = {
  customerName: 'Alice',
  customerEmail: 'alice@example.com',
  subject: 'Cannot log in',
  description: 'Login button does nothing on tap.',
};

const buildForm = (customerName) => ({ ...baseForm, customerName });

const nameError = (customerName) =>
  validateCreateTicketForm(buildForm(customerName))?.customerName;

describe('Create Ticket — customer name validation (letters only, max 50)', () => {
  it('TC-001: empty name is rejected (required)', () => {
    expect(nameError('')).toBeTruthy();
  });

  it('TC-002: whitespace-only name is rejected (required)', () => {
    expect(nameError('   ')).toBeTruthy();
  });

  it('TC-003: valid single-word letters name passes', () => {
    expect(nameError('Alice')).toBeFalsy();
  });

  it('TC-004: valid multi-word name with spaces passes', () => {
    expect(nameError('John Doe')).toBeFalsy();
  });

  it('TC-005: name containing digits is rejected', () => {
    expect(nameError('John2')).toBeTruthy();
  });

  it('TC-006: name containing special characters is rejected', () => {
    expect(nameError('John@Doe')).toBeTruthy();
  });

  it('TC-007: name with surrounding spaces is accepted after trim', () => {
    expect(nameError('  Alice  ')).toBeFalsy();
  });

  it('TC-008: name at exactly 50 characters passes', () => {
    expect(nameError('a'.repeat(50))).toBeFalsy();
  });

  it('TC-009: name at 51 characters is rejected', () => {
    expect(nameError('a'.repeat(51))).toBeTruthy();
  });

  it('TC-010: valid name with valid fields yields no name error', () => {
    expect(validateCreateTicketForm(baseForm)?.customerName).toBeFalsy();
  });
});
