import { getApi, postApi, patchApi } from './commonApi';
import { apiEndPoints } from './apiEndPoints';
import { mockTicketsService } from './mockTicketsService';
import { USE_MOCK_API } from '@constants/tickets';

export const fetchTicketsAPI = (params = {}) => {
  if (USE_MOCK_API) {
    return mockTicketsService.getTickets(params);
  }
  return getApi(apiEndPoints.TICKETS, {}, params);
};

export const fetchTicketByIdAPI = (id) => {
  if (USE_MOCK_API) {
    return mockTicketsService.getTicketById(id);
  }
  return getApi(apiEndPoints.ticketById(id));
};

export const createTicketAPI = (payload) => {
  if (USE_MOCK_API) {
    return mockTicketsService.createTicket(payload);
  }
  return postApi(apiEndPoints.TICKETS, payload);
};

export const updateTicketAPI = (id, payload) => {
  if (USE_MOCK_API) {
    return mockTicketsService.updateTicket(id, payload);
  }
  return patchApi(apiEndPoints.ticketById(id), payload);
};

export const addCommentAPI = (id, payload) => {
  if (USE_MOCK_API) {
    return mockTicketsService.addComment(id, payload);
  }
  return postApi(apiEndPoints.ticketComments(id), payload);
};

export const fetchAgentsAPI = () => {
  if (USE_MOCK_API) {
    return mockTicketsService.getAgents();
  }
  return getApi(apiEndPoints.AGENTS);
};

export const fetchAnalyticsAPI = () => {
  if (USE_MOCK_API) {
    return mockTicketsService.getAnalytics();
  }
  return getApi(apiEndPoints.TICKET_ANALYTICS);
};
