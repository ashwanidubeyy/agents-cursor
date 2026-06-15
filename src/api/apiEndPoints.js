export const BASE_URL = 'https://api.example.com';

export const apiEndPoints = {
  HEALTH: '/health',
  TICKETS: '/tickets',
  TICKET_ANALYTICS: '/tickets/analytics',
  AGENTS: '/agents',
  ticketById: (id) => `/tickets/${id}`,
  ticketComments: (id) => `/tickets/${id}/comments`,
};
