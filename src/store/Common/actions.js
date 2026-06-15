import {
  SET_APP_READY,
  SET_ONLINE_STATUS,
  SET_PENDING_REPLY,
  CLEAR_PENDING_REPLY,
  SHOW_TOAST,
  HIDE_TOAST,
} from './actionTypes';

export const setAppReady = (isReady) => ({
  type: SET_APP_READY,
  payload: isReady,
});

export const setOnlineStatus = (isOnline) => ({
  type: SET_ONLINE_STATUS,
  payload: isOnline,
});

export const setPendingReply = (ticketId, text) => ({
  type: SET_PENDING_REPLY,
  payload: { ticketId, text },
});

export const clearPendingReply = () => ({
  type: CLEAR_PENDING_REPLY,
});

export const showToast = (message, toastType = 'error') => ({
  type: SHOW_TOAST,
  payload: { message, toastType },
});

export const hideToast = () => ({
  type: HIDE_TOAST,
});
