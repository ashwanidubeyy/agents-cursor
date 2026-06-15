import { TITLES } from '@constants/titles';
import { TICKET_STATUS, TICKET_PRIORITY } from '@constants/tickets';

export const getStatusLabel = (status) => {
  const map = {
    [TICKET_STATUS.OPEN]: TITLES.STATUS.OPEN,
    [TICKET_STATUS.IN_PROGRESS]: TITLES.STATUS.IN_PROGRESS,
    [TICKET_STATUS.RESOLVED]: TITLES.STATUS.RESOLVED,
  };
  return map[status] || status;
};

export const getPriorityLabel = (priority) => {
  const map = {
    [TICKET_PRIORITY.LOW]: TITLES.PRIORITY.LOW,
    [TICKET_PRIORITY.MEDIUM]: TITLES.PRIORITY.MEDIUM,
    [TICKET_PRIORITY.HIGH]: TITLES.PRIORITY.HIGH,
  };
  return map[priority] || priority;
};

export const getAgentNameById = (agents, agentId) => {
  const agent = agents?.find?.((a) => a?.id === agentId);
  return agent?.name || TITLES.LABELS.UNASSIGNED;
};
