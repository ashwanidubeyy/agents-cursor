import {
  FETCH_TICKETS_REQUEST,
  FETCH_TICKETS_SUCCESS,
  FETCH_TICKETS_FAILURE,
  FETCH_TICKETS_MORE_REQUEST,
  FETCH_TICKETS_MORE_SUCCESS,
  FETCH_TICKETS_MORE_FAILURE,
  SET_TICKET_QUERY,
  FETCH_TICKET_DETAILS_REQUEST,
  FETCH_TICKET_DETAILS_SUCCESS,
  FETCH_TICKET_DETAILS_FAILURE,
  CREATE_TICKET_OPTIMISTIC,
  CREATE_TICKET_SUCCESS,
  CREATE_TICKET_FAILURE,
  UPDATE_TICKET_OPTIMISTIC,
  UPDATE_TICKET_SUCCESS,
  UPDATE_TICKET_FAILURE,
  ADD_COMMENT_SUCCESS,
  FETCH_ANALYTICS_REQUEST,
  FETCH_ANALYTICS_SUCCESS,
  FETCH_ANALYTICS_FAILURE,
  FETCH_AGENTS_REQUEST,
  FETCH_AGENTS_SUCCESS,
  FETCH_AGENTS_FAILURE,
} from './actionTypes';
import { FILTER_ALL, SORT_ORDER } from '@constants/tickets';

const INITIAL_STATE = {
  list: {
    items: [],
    page: 1,
    totalPages: 1,
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    query: {
      search: '',
      statusFilter: FILTER_ALL,
      priorityFilter: FILTER_ALL,
      sortOrder: SORT_ORDER.NEWEST,
    },
  },
  detailsById: {},
  analytics: {
    openCount: 0,
    assignedToMe: 0,
    resolvedToday: 0,
    highPriority: 0,
    lastUpdated: null,
    isLoading: false,
    error: null,
  },
  agents: {
    items: [],
    isLoading: false,
    error: null,
  },
  optimistic: {
    rollbackData: null,
  },
  isSubmitting: false,
};

const ticketsReducer = (state = INITIAL_STATE, action = {}) => {
  switch (action?.type) {
    case SET_TICKET_QUERY:
      return {
        ...state,
        list: {
          ...state.list,
          query: { ...state.list.query, ...action?.payload },
        },
      };
    case FETCH_TICKETS_REQUEST:
      return {
        ...state,
        list: {
          ...state.list,
          isLoading: !action?.payload?.isRefresh,
          isRefreshing: !!action?.payload?.isRefresh,
          error: null,
        },
      };
    case FETCH_TICKETS_SUCCESS: {
      const { items, page, totalPages } = action?.payload || {};
      return {
        ...state,
        list: {
          ...state.list,
          items: items || [],
          page: page || 1,
          totalPages: totalPages || 1,
          isLoading: false,
          isRefreshing: false,
          error: null,
        },
      };
    }
    case FETCH_TICKETS_FAILURE:
      return {
        ...state,
        list: {
          ...state.list,
          isLoading: false,
          isRefreshing: false,
          error: action?.payload,
        },
      };
    case FETCH_TICKETS_MORE_REQUEST:
      return { ...state, list: { ...state.list, isLoadingMore: true } };
    case FETCH_TICKETS_MORE_SUCCESS: {
      const { items, page, totalPages } = action?.payload || {};
      return {
        ...state,
        list: {
          ...state.list,
          items: [...(state.list.items || []), ...(items || [])],
          page: page || state.list.page,
          totalPages: totalPages || state.list.totalPages,
          isLoadingMore: false,
        },
      };
    }
    case FETCH_TICKETS_MORE_FAILURE:
      return { ...state, list: { ...state.list, isLoadingMore: false } };
    case FETCH_TICKET_DETAILS_REQUEST: {
      const ticketId = action?.payload;
      return {
        ...state,
        detailsById: {
          ...state.detailsById,
          [ticketId]: {
            ...(state.detailsById?.[ticketId] || {}),
            isLoading: true,
            error: null,
          },
        },
      };
    }
    case FETCH_TICKET_DETAILS_SUCCESS: {
      const { ticketId, data } = action?.payload || {};
      return {
        ...state,
        detailsById: {
          ...state.detailsById,
          [ticketId]: { data, isLoading: false, error: null },
        },
      };
    }
    case FETCH_TICKET_DETAILS_FAILURE: {
      const { ticketId, error } = action?.payload || {};
      return {
        ...state,
        detailsById: {
          ...state.detailsById,
          [ticketId]: {
            ...(state.detailsById?.[ticketId] || {}),
            isLoading: false,
            error,
          },
        },
      };
    }
    case CREATE_TICKET_OPTIMISTIC:
      return {
        ...state,
        isSubmitting: true,
        list: {
          ...state.list,
          items: [action?.payload, ...(state.list.items || [])],
        },
      };
    case CREATE_TICKET_SUCCESS: {
      const { tempId, ticket } = action?.payload || {};
      const items = (state.list.items || []).map((item) =>
        item?.id === tempId ? ticket : item,
      );
      return { ...state, isSubmitting: false, list: { ...state.list, items } };
    }
    case CREATE_TICKET_FAILURE: {
      const { tempId } = action?.payload || {};
      const items = (state.list.items || []).filter((item) => item?.id !== tempId);
      return { ...state, isSubmitting: false, list: { ...state.list, items } };
    }
    case UPDATE_TICKET_OPTIMISTIC: {
      const { ticketId, updates, previousData } = action?.payload || {};
      const updatedItems = (state.list.items || []).map((item) =>
        item?.id === ticketId ? { ...item, ...updates } : item,
      );
      const existingDetail = state.detailsById?.[ticketId]?.data;
      return {
        ...state,
        optimistic: { rollbackData: { ticketId, previousData } },
        list: { ...state.list, items: updatedItems },
        detailsById: existingDetail
          ? {
              ...state.detailsById,
              [ticketId]: {
                ...state.detailsById[ticketId],
                data: { ...existingDetail, ...updates },
              },
            }
          : state.detailsById,
      };
    }
    case UPDATE_TICKET_SUCCESS: {
      const { ticket } = action?.payload || {};
      const ticketId = ticket?.id;
      const updatedItems = (state.list.items || []).map((item) =>
        item?.id === ticketId ? ticket : item,
      );
      return {
        ...state,
        optimistic: { rollbackData: null },
        list: { ...state.list, items: updatedItems },
        detailsById: {
          ...state.detailsById,
          [ticketId]: {
            ...(state.detailsById?.[ticketId] || {}),
            data: ticket,
          },
        },
      };
    }
    case UPDATE_TICKET_FAILURE: {
      const { ticketId, previousData } = action?.payload || {};
      const updatedItems = (state.list.items || []).map((item) =>
        item?.id === ticketId ? previousData : item,
      );
      return {
        ...state,
        optimistic: { rollbackData: null },
        list: { ...state.list, items: updatedItems },
        detailsById: previousData
          ? {
              ...state.detailsById,
              [ticketId]: {
                ...(state.detailsById?.[ticketId] || {}),
                data: previousData,
              },
            }
          : state.detailsById,
      };
    }
    case ADD_COMMENT_SUCCESS: {
      const { ticket } = action?.payload || {};
      const ticketId = ticket?.id;
      return {
        ...state,
        detailsById: {
          ...state.detailsById,
          [ticketId]: {
            ...(state.detailsById?.[ticketId] || {}),
            data: ticket,
          },
        },
      };
    }
    case FETCH_ANALYTICS_REQUEST:
      return {
        ...state,
        analytics: { ...state.analytics, isLoading: !state.analytics.lastUpdated, error: null },
      };
    case FETCH_ANALYTICS_SUCCESS:
      return {
        ...state,
        analytics: { ...action?.payload, isLoading: false, error: null },
      };
    case FETCH_ANALYTICS_FAILURE:
      return {
        ...state,
        analytics: { ...state.analytics, isLoading: false, error: action?.payload },
      };
    case FETCH_AGENTS_REQUEST:
      return { ...state, agents: { ...state.agents, isLoading: true, error: null } };
    case FETCH_AGENTS_SUCCESS:
      return {
        ...state,
        agents: { items: action?.payload || [], isLoading: false, error: null },
      };
    case FETCH_AGENTS_FAILURE:
      return {
        ...state,
        agents: { ...state.agents, isLoading: false, error: action?.payload },
      };
    default:
      return state;
  }
};

export default ticketsReducer;
