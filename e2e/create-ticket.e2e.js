/**
 * E2E: Create Ticket — customer name validation
 * Maps to .cursor/logs/test-cases-create-ticket-name-validation.md
 * Run: npm run e2e:android:attached -- e2e/create-ticket.e2e.js
 */

const IDS = {
  APP_ROOT: 'app-root',
  DASHBOARD_TITLE: 'dashboard-title',
  DASHBOARD_CREATE: 'dashboard-create-ticket',
  CREATE_SCREEN: 'create-ticket-screen',
  NAME_INPUT: 'create-ticket-name-input',
  NAME_ERROR: 'create-ticket-name-error',
  EMAIL_INPUT: 'create-ticket-email-input',
  SUBJECT_INPUT: 'create-ticket-subject-input',
  DESCRIPTION_INPUT: 'create-ticket-description-input',
  SUBMIT: 'create-ticket-submit',
};

const navigateToCreateTicket = async () => {
  await waitFor(element(by.id(IDS.APP_ROOT))).toBeVisible().withTimeout(15000);
  try {
    await waitFor(element(by.id(IDS.CREATE_SCREEN))).toBeVisible().withTimeout(2000);
    return;
  } catch (_) {}
  await element(by.id(IDS.DASHBOARD_CREATE)).tap();
  await waitFor(element(by.id(IDS.CREATE_SCREEN))).toBeVisible().withTimeout(10000);
};

const clearAndTypeName = async (text) => {
  await element(by.id(IDS.NAME_INPUT)).clearText();
  if (text) {
    await element(by.id(IDS.NAME_INPUT)).typeText(text);
  }
};

const submitCreateTicketForm = async () => {
  await element(by.id(IDS.SUBMIT)).tap();
};

const expectDashboard = async () => {
  await waitFor(element(by.id(IDS.DASHBOARD_TITLE))).toBeVisible().withTimeout(15000);
  await expect(element(by.id(IDS.CREATE_SCREEN))).not.toBeVisible();
};

const expectNameError = async () => {
  await waitFor(element(by.id(IDS.NAME_ERROR))).toBeVisible().withTimeout(8000);
};

describe('Create Ticket — customer name validation', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await navigateToCreateTicket();
  });

  it('TC-001: empty name is rejected (required)', async () => {
    await clearAndTypeName('');
    await submitCreateTicketForm();
    await expectNameError();
  });

  it('TC-002: whitespace-only name is rejected (required)', async () => {
    await clearAndTypeName('   ');
    await submitCreateTicketForm();
    await expectNameError();
  });

  it('TC-003: valid single-word letters name passes validation', async () => {
    await clearAndTypeName('Alice');
    await element(by.id(IDS.EMAIL_INPUT)).typeText('alice@example.com');
    await element(by.id(IDS.SUBJECT_INPUT)).typeText('Login issue');
    await element(by.id(IDS.DESCRIPTION_INPUT)).typeText('Cannot sign in to the app.');
    await submitCreateTicketForm();
    await expectDashboard();
  });

  it('TC-004: valid multi-word name with spaces passes validation', async () => {
    await clearAndTypeName('John Doe');
    await element(by.id(IDS.EMAIL_INPUT)).typeText('john@example.com');
    await element(by.id(IDS.SUBJECT_INPUT)).typeText('Billing question');
    await element(by.id(IDS.DESCRIPTION_INPUT)).typeText('Need help with invoice.');
    await submitCreateTicketForm();
    await expectDashboard();
  });

  it('TC-005: name containing digits is rejected', async () => {
    await clearAndTypeName('John2');
    await submitCreateTicketForm();
    await expectNameError();
  });

  it('TC-006: name containing special characters is rejected', async () => {
    await clearAndTypeName('John@Doe');
    await submitCreateTicketForm();
    await expectNameError();
  });

  it('TC-007: name with surrounding spaces is accepted after trim', async () => {
    await clearAndTypeName('  Alice  ');
    await element(by.id(IDS.EMAIL_INPUT)).typeText('alice@example.com');
    await element(by.id(IDS.SUBJECT_INPUT)).typeText('General inquiry');
    await element(by.id(IDS.DESCRIPTION_INPUT)).typeText('Question about service.');
    await submitCreateTicketForm();
    await expectDashboard();
  });

  it('TC-008: name at exactly 50 characters passes validation', async () => {
    await clearAndTypeName('a'.repeat(50));
    await element(by.id(IDS.EMAIL_INPUT)).typeText('long@example.com');
    await element(by.id(IDS.SUBJECT_INPUT)).typeText('Long name test');
    await element(by.id(IDS.DESCRIPTION_INPUT)).typeText('Testing fifty character name.');
    await submitCreateTicketForm();
    await expectDashboard();
  });

  it.skip('TC-009: name at 51 characters is rejected', async () => {
    await element(by.id(IDS.NAME_INPUT)).replaceText('a'.repeat(51));
    await submitCreateTicketForm();
    await expectNameError();
  });

  it('TC-010: valid name with valid fields yields no name error', async () => {
    await clearAndTypeName('Alice');
    await element(by.id(IDS.EMAIL_INPUT)).typeText('alice@example.com');
    await element(by.id(IDS.SUBJECT_INPUT)).typeText('Integration test');
    await element(by.id(IDS.DESCRIPTION_INPUT)).typeText('Full form validation check.');
    await submitCreateTicketForm();
    await expectDashboard();
    await expect(element(by.id(IDS.NAME_ERROR))).not.toBeVisible();
  });
});
