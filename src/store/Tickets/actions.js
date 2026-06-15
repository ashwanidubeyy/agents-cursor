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
import {
  fetchTicketsAPI,
  fetchTicketByIdAPI,
  createTicketAPI,
  updateTicketAPI,
  addCommentAPI,
  fetchAgentsAPI,
  fetchAnalyticsAPI,
} from '@api/ticketsApi';
import { showToast, setOnlineStatus, clearPendingReply } from '@store/Common/actions';
import { ALERTS } from '@constants/alerts';
import { getAgentNameById } from '@utility/ticketSelectors';
import { FILTER_ALL, PAGE_SIZE, TICKET_STATUS, COMMENT_TYPES } from '@constants/tickets';

const buildQueryParams = (query, page) => ({
  page,
  limit: PAGE_SIZE,
  search: query?.search || '',
  status: query?.statusFilter === FILTER_ALL ? '' : query?.statusFilter,
  priority: query?.priorityFilter === FILTER_ALL ? '' : query?.priorityFilter,
  sortOrder: query?.sortOrder,
});

export const setTicketQuery = (queryUpdates) => ({
  type: SET_TICKET_QUERY,
  payload: queryUpdates,
});

export const fetchTickets = (isRefresh = false) => (dispatch, getState) => {
  dispatch({ type: FETCH_TICKETS_REQUEST, payload: { isRefresh } });
  const query = getState()?.tickets?.list?.query;

  return fetchTicketsAPI(buildQueryParams(query, 1))
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({
        type: FETCH_TICKETS_SUCCESS,
        payload: {
          items: res?.data?.items || [],
          page: res?.data?.page || 1,
          totalPages: res?.data?.totalPages || 1,
        },
      });
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch({ type: FETCH_TICKETS_FAILURE, payload: ALERTS.GENERIC_ERROR });
      dispatch(showToast(ALERTS.GENERIC_ERROR));
    });
};

export const fetchMoreTickets = () => (dispatch, getState) => {
  const { list } = getState()?.tickets || {};
  const nextPage = (list?.page || 1) + 1;
  if (nextPage > (list?.totalPages || 1) || list?.isLoadingMore) {
    return Promise.resolve();
  }

  dispatch({ type: FETCH_TICKETS_MORE_REQUEST });
  const query = list?.query;

  return fetchTicketsAPI(buildQueryParams(query, nextPage))
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({
        type: FETCH_TICKETS_MORE_SUCCESS,
        payload: {
          items: res?.data?.items || [],
          page: res?.data?.page || nextPage,
          totalPages: res?.data?.totalPages || list?.totalPages,
        },
      });
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch({ type: FETCH_TICKETS_MORE_FAILURE });
      dispatch(showToast(ALERTS.GENERIC_ERROR));
    });
};

export const fetchTicketDetails = (ticketId) => (dispatch) => {
  dispatch({ type: FETCH_TICKET_DETAILS_REQUEST, payload: ticketId });

  return fetchTicketByIdAPI(ticketId)
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({
        type: FETCH_TICKET_DETAILS_SUCCESS,
        payload: { ticketId, data: res?.data },
      });
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch({
        type: FETCH_TICKET_DETAILS_FAILURE,
        payload: { ticketId, error: ALERTS.GENERIC_ERROR },
      });
    });
};

export const createTicket = (formData, onSuccess) => (dispatch, getState) => {
  if (getState()?.tickets?.isSubmitting) {
    return Promise.resolve();
  }

  const tempId = `temp-${Date.now()}`;
  const optimisticTicket = {
    id: tempId,
    customerName: formData?.customerName,
    customerEmail: formData?.customerEmail,
    subject: formData?.subject,
    description: formData?.description,
    priority: formData?.priority,
    status: TICKET_STATUS.OPEN,
    createdAt: new Date().toISOString(),
    isOptimistic: true,
  };

  dispatch({ type: CREATE_TICKET_OPTIMISTIC, payload: optimisticTicket });

  return createTicketAPI(formData)
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({
        type: CREATE_TICKET_SUCCESS,
        payload: { tempId, ticket: res?.data },
      });
      dispatch(showToast(ALERTS.CREATE_SUCCESS, 'success'));
      dispatch(fetchAnalytics());
      if (onSuccess) {
        onSuccess();
      }
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch({ type: CREATE_TICKET_FAILURE, payload: { tempId } });
      dispatch(showToast(ALERTS.CREATE_FAILED));
    });
};

export const updateTicket = (ticketId, updates) => (dispatch, getState) => {
  const state = getState();
  const previousData =
    state?.tickets?.detailsById?.[ticketId]?.data ||
    state?.tickets?.list?.items?.find?.((t) => t?.id === ticketId);

  dispatch({
    type: UPDATE_TICKET_OPTIMISTIC,
    payload: { ticketId, updates, previousData },
  });

  return updateTicketAPI(ticketId, updates)
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({ type: UPDATE_TICKET_SUCCESS, payload: { ticket: res?.data } });
      dispatch(showToast(ALERTS.UPDATE_SUCCESS, 'success'));
      dispatch(fetchAnalytics());
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch({
        type: UPDATE_TICKET_FAILURE,
        payload: { ticketId, previousData },
      });
      dispatch(showToast(ALERTS.UPDATE_FAILED));
    });
};

export const addComment = (ticketId, payload, onSuccess) => (dispatch) => {
  return addCommentAPI(ticketId, payload)
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({
        type: ADD_COMMENT_SUCCESS,
        payload: { ticket: res?.data?.ticket },
      });
      dispatch(showToast(
        payload?.type === COMMENT_TYPES.INTERNAL_NOTE ? ALERTS.NOTE_SUCCESS : ALERTS.REPLY_SUCCESS,
        'success',
      ));
      if (onSuccess) {
        onSuccess();
      }
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch(showToast(
        payload?.type === COMMENT_TYPES.INTERNAL_NOTE ? ALERTS.NOTE_FAILED : ALERTS.REPLY_FAILED,
      ));
    });
};

export const sendReply = (ticketId, text, author) => (dispatch, getState) => {
  const isOnline = getState()?.common?.isOnline;
  if (!isOnline) {
    dispatch(showToast(ALERTS.OFFLINE_ACTION));
    return Promise.resolve();
  }

  return dispatch(
    addComment(ticketId, {
      type: COMMENT_TYPES.AGENT_REPLY,
      author,
      text,
    }, () => {
      dispatch(clearPendingReply());
    }),
  );
};

export const retryPendingReply = () => (dispatch, getState) => {
  const state = getState();
  const { pendingReply } = state?.common || {};
  const currentAgentId = state?.common?.currentAgentId;
  const agents = state?.tickets?.agents?.items;
  if (!pendingReply?.ticketId || !pendingReply?.text) {
    return Promise.resolve();
  }
  const agentName = getAgentNameById(agents, currentAgentId);
  return dispatch(sendReply(pendingReply.ticketId, pendingReply.text, agentName));
};

export const fetchAnalytics = () => (dispatch) => {
  dispatch({ type: FETCH_ANALYTICS_REQUEST });

  return fetchAnalyticsAPI()
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({ type: FETCH_ANALYTICS_SUCCESS, payload: res?.data });
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch({ type: FETCH_ANALYTICS_FAILURE, payload: ALERTS.GENERIC_ERROR });
    });
};

export const fetchAgents = () => (dispatch) => {
  dispatch({ type: FETCH_AGENTS_REQUEST });

  return fetchAgentsAPI()
    .then((res) => {
      dispatch(setOnlineStatus(true));
      dispatch({
        type: FETCH_AGENTS_SUCCESS,
        payload: res?.data?.items || [],
      });
    })
    .catch(() => {
      dispatch(setOnlineStatus(false));
      dispatch({ type: FETCH_AGENTS_FAILURE, payload: ALERTS.GENERIC_ERROR });
    });
};
