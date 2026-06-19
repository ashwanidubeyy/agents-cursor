export const ERROR_PAGES_TITLES = {
  CONNECTION_LOST: {
    TITLE: 'Connection Lost',
    MESSAGE: 'Please check your internet connection and try again.',
    RETRY: 'Try Again',
  },
  UNAUTHORIZED: {
    TITLE: 'Not Authorized',
    MESSAGE:
      'You do not have permission to access this page. Please sign in again.',
    GO_BACK: 'Go Back',
  },
} as const;

export const ERROR_PAGES_ROUTES = {
  UNAUTHORIZED: '/unauthorized',
  CONNECTION_LOST: '/connection-lost',
} as const;

export const ERROR_PAGES_TEST_IDS = {
  CONNECTION_LOST: 'connection-lost-screen',
  CONNECTION_LOST_RETRY: 'connection-lost-retry-button',
  UNAUTHORIZED: 'unauthorized-screen',
  UNAUTHORIZED_GO_BACK: 'unauthorized-go-back-button',
} as const;

export const ERROR_PAGES_ALERTS = {
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
} as const;
