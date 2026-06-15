import {
  SET_APP_READY,
  SET_ONLINE_STATUS,
  SET_PENDING_REPLY,
  CLEAR_PENDING_REPLY,
  SHOW_TOAST,
  HIDE_TOAST,
} from './actionTypes';
import { CURRENT_AGENT_ID } from '@constants/tickets';

const INITIAL_STATE = {
  isAppReady: false,
  isOnline: true,
  currentAgentId: CURRENT_AGENT_ID,
  pendingReply: { ticketId: null, text: '' },
  toast: { message: null, toastType: null },
};

const commonReducer = (state = INITIAL_STATE, action = {}) => {
  switch (action?.type) {
    case SET_APP_READY:
      return { ...state, isAppReady: action?.payload };
    case SET_ONLINE_STATUS:
      return { ...state, isOnline: action?.payload };
    case SET_PENDING_REPLY:
      return { ...state, pendingReply: action?.payload };
    case CLEAR_PENDING_REPLY:
      return { ...state, pendingReply: { ticketId: null, text: '' } };
    case SHOW_TOAST:
      return { ...state, toast: action?.payload };
    case HIDE_TOAST:
      return { ...state, toast: { message: null, toastType: null } };
    default:
      return state;
  }
};

export default commonReducer;
