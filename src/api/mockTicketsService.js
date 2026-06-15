import {
  TICKET_STATUS,
  TICKET_PRIORITY,
  FILTER_ALL,
  SORT_ORDER,
  PAGE_SIZE,
  CURRENT_AGENT_ID,
  TIMELINE_EVENT_TYPES,
  COMMENT_TYPES,
} from '@constants/tickets';

const AGENTS = [
  { id: 'agent-1', name: 'Alex Johnson' },
  { id: 'agent-2', name: 'Sam Rivera' },
  { id: 'agent-3', name: 'Jordan Lee' },
];

const createTimelineEvent = (type, description, createdAt) => ({
  id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  description,
  createdAt,
});

let tickets = [
  {
    id: 'TKT-1001',
    customerName: 'Emily Carter',
    customerEmail: 'emily.carter@email.com',
    subject: 'Unable to reset password',
    description: 'Customer cannot receive password reset email.',
    priority: TICKET_PRIORITY.HIGH,
    status: TICKET_STATUS.OPEN,
    assignedTo: null,
    createdAt: '2026-06-10T09:15:00Z',
    updatedAt: '2026-06-10T09:15:00Z',
    attachments: [{ id: 'att-1', name: 'screenshot.png', type: 'image/png', url: 'https://example.com/screenshot.png' }],
    conversation: [
      {
        id: 'cmt-1',
        type: COMMENT_TYPES.CUSTOMER_REPLY,
        author: 'Emily Carter',
        text: 'I tried twice but no email arrives.',
        createdAt: '2026-06-10T09:20:00Z',
      },
    ],
    timeline: [
      createTimelineEvent(TIMELINE_EVENT_TYPES.CREATED, 'Ticket created', '2026-06-10T09:15:00Z'),
      createTimelineEvent(TIMELINE_EVENT_TYPES.COMMENT_ADDED, 'Customer replied', '2026-06-10T09:20:00Z'),
    ],
  },
  {
    id: 'TKT-1002',
    customerName: 'Michael Brown',
    customerEmail: 'michael.b@email.com',
    subject: 'Billing discrepancy on invoice',
    description: 'Charged twice for the same subscription.',
    priority: TICKET_PRIORITY.MEDIUM,
    status: TICKET_STATUS.IN_PROGRESS,
    assignedTo: CURRENT_AGENT_ID,
    createdAt: '2026-06-09T14:30:00Z',
    updatedAt: '2026-06-11T10:00:00Z',
    attachments: [],
    conversation: [
      {
        id: 'cmt-2',
        type: COMMENT_TYPES.AGENT_REPLY,
        author: 'Alex Johnson',
        text: 'We are reviewing your invoice now.',
        createdAt: '2026-06-10T11:00:00Z',
      },
    ],
    timeline: [
      createTimelineEvent(TIMELINE_EVENT_TYPES.CREATED, 'Ticket created', '2026-06-09T14:30:00Z'),
      createTimelineEvent(TIMELINE_EVENT_TYPES.ASSIGNED, 'Assigned to Alex Johnson', '2026-06-10T08:00:00Z'),
      createTimelineEvent(TIMELINE_EVENT_TYPES.STATUS_CHANGED, 'Status changed to In Progress', '2026-06-10T08:05:00Z'),
    ],
  },
  {
    id: 'TKT-1003',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah.w@email.com',
    subject: 'Feature request: dark mode',
    description: 'Would love a dark mode option in the app.',
    priority: TICKET_PRIORITY.LOW,
    status: TICKET_STATUS.RESOLVED,
    assignedTo: 'agent-2',
    createdAt: '2026-06-08T16:45:00Z',
    updatedAt: '2026-06-12T08:00:00Z',
    attachments: [],
    conversation: [],
    timeline: [
      createTimelineEvent(TIMELINE_EVENT_TYPES.CREATED, 'Ticket created', '2026-06-08T16:45:00Z'),
      createTimelineEvent(TIMELINE_EVENT_TYPES.STATUS_CHANGED, 'Status changed to Resolved', '2026-06-12T08:00:00Z'),
    ],
  },
  {
    id: 'TKT-1004',
    customerName: 'David Kim',
    customerEmail: 'david.kim@email.com',
    subject: 'App crashes on startup',
    description: 'App closes immediately after launch on Android 14.',
    priority: TICKET_PRIORITY.HIGH,
    status: TICKET_STATUS.OPEN,
    assignedTo: null,
    createdAt: '2026-06-11T07:00:00Z',
    updatedAt: '2026-06-11T07:00:00Z',
    attachments: [{ id: 'att-2', name: 'crash-log.txt', type: 'text/plain', url: 'https://example.com/crash-log.txt' }],
    conversation: [],
    timeline: [createTimelineEvent(TIMELINE_EVENT_TYPES.CREATED, 'Ticket created', '2026-06-11T07:00:00Z')],
  },
  {
    id: 'TKT-1005',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.a@email.com',
    subject: 'Cannot update profile photo',
    description: 'Upload fails with unknown error.',
    priority: TICKET_PRIORITY.MEDIUM,
    status: TICKET_STATUS.OPEN,
    assignedTo: CURRENT_AGENT_ID,
    createdAt: '2026-06-12T06:30:00Z',
    updatedAt: '2026-06-12T06:30:00Z',
    attachments: [],
    conversation: [],
    timeline: [
      createTimelineEvent(TIMELINE_EVENT_TYPES.CREATED, 'Ticket created', '2026-06-12T06:30:00Z'),
      createTimelineEvent(TIMELINE_EVENT_TYPES.ASSIGNED, 'Assigned to Alex Johnson', '2026-06-12T06:35:00Z'),
    ],
  },
];

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const filterTickets = (items, params) => {
  let result = [...items];
  const search = params?.search?.toLowerCase()?.trim();
  if (search) {
    result = result.filter(
      (t) =>
        t?.customerName?.toLowerCase()?.includes(search) ||
        t?.subject?.toLowerCase()?.includes(search),
    );
  }
  if (params?.status && params.status !== FILTER_ALL) {
    result = result.filter((t) => t?.status === params.status);
  }
  if (params?.priority && params.priority !== FILTER_ALL) {
    result = result.filter((t) => t?.priority === params.priority);
  }
  const sortOrder = params?.sortOrder || SORT_ORDER.NEWEST;
  result.sort((a, b) => {
    const dateA = new Date(a?.createdAt).getTime();
    const dateB = new Date(b?.createdAt).getTime();
    return sortOrder === SORT_ORDER.NEWEST ? dateB - dateA : dateA - dateB;
  });
  return result;
};

const getAgentName = (agentId) => {
  const agent = AGENTS.find((a) => a?.id === agentId);
  return agent?.name || 'Unknown Agent';
};

export const mockTicketsService = {
  getTickets: (params = {}) =>
    delay().then(() => {
      const filtered = filterTickets(tickets, params);
      const page = Number(params?.page) || 1;
      const limit = Number(params?.limit) || PAGE_SIZE;
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);
      return { data: { items, page, totalPages, total } };
    }),

  getTicketById: (id) =>
    delay().then(() => {
      const ticket = tickets.find((t) => t?.id === id);
      if (!ticket) {
        return Promise.reject({ message: 'Ticket not found' });
      }
      return { data: ticket };
    }),

  createTicket: (payload) =>
    delay().then(() => {
      const id = `TKT-${Date.now()}`;
      const now = new Date().toISOString();
      const ticket = {
        id,
        customerName: payload?.customerName,
        customerEmail: payload?.customerEmail,
        subject: payload?.subject,
        description: payload?.description,
        priority: payload?.priority || TICKET_PRIORITY.MEDIUM,
        status: TICKET_STATUS.OPEN,
        assignedTo: null,
        createdAt: now,
        updatedAt: now,
        attachments: [],
        conversation: [],
        timeline: [createTimelineEvent(TIMELINE_EVENT_TYPES.CREATED, 'Ticket created', now)],
      };
      tickets = [ticket, ...tickets];
      return { data: ticket };
    }),

  updateTicket: (id, updates) =>
    delay().then(() => {
      const index = tickets.findIndex((t) => t?.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Ticket not found' });
      }
      const existing = tickets[index];
      const now = new Date().toISOString();
      const timeline = [...(existing?.timeline || [])];
      if (updates?.status && updates.status !== existing?.status) {
        timeline.push(
          createTimelineEvent(
            TIMELINE_EVENT_TYPES.STATUS_CHANGED,
            `Status changed to ${updates.status}`,
            now,
          ),
        );
      }
      if (updates?.priority && updates.priority !== existing?.priority) {
        timeline.push(
          createTimelineEvent(
            TIMELINE_EVENT_TYPES.PRIORITY_CHANGED,
            `Priority changed to ${updates.priority}`,
            now,
          ),
        );
      }
      if (updates?.assignedTo !== undefined && updates.assignedTo !== existing?.assignedTo) {
        const assignLabel = updates.assignedTo
          ? `Assigned to ${getAgentName(updates.assignedTo)}`
          : 'Ticket unassigned';
        timeline.push(createTimelineEvent(TIMELINE_EVENT_TYPES.ASSIGNED, assignLabel, now));
      }
      const updated = {
        ...existing,
        ...updates,
        updatedAt: now,
        timeline,
      };
      tickets[index] = updated;
      return { data: updated };
    }),

  addComment: (id, payload) =>
    delay().then(() => {
      const index = tickets.findIndex((t) => t?.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Ticket not found' });
      }
      const existing = tickets[index];
      const now = new Date().toISOString();
      const comment = {
        id: `cmt-${Date.now()}`,
        type: payload?.type,
        author: payload?.author,
        text: payload?.text,
        createdAt: now,
      };
      const timeline = [
        ...(existing?.timeline || []),
        createTimelineEvent(TIMELINE_EVENT_TYPES.COMMENT_ADDED, 'Comment added', now),
      ];
      const updated = {
        ...existing,
        conversation: [...(existing?.conversation || []), comment],
        timeline,
        updatedAt: now,
      };
      tickets[index] = updated;
      return { data: { ticket: updated, comment } };
    }),

  getAgents: () => delay().then(() => ({ data: { items: AGENTS } })),

  getAnalytics: () =>
    delay().then(() => {
      const today = new Date().toISOString().split('T')[0];
      const openCount = tickets.filter((t) => t?.status === TICKET_STATUS.OPEN).length;
      const assignedToMe = tickets.filter(
        (t) => t?.assignedTo === CURRENT_AGENT_ID && t?.status !== TICKET_STATUS.RESOLVED,
      ).length;
      const resolvedToday = tickets.filter(
        (t) =>
          t?.status === TICKET_STATUS.RESOLVED &&
          t?.updatedAt?.startsWith(today),
      ).length;
      const highPriority = tickets.filter(
        (t) => t?.priority === TICKET_PRIORITY.HIGH && t?.status !== TICKET_STATUS.RESOLVED,
      ).length;
      return {
        data: { openCount, assignedToMe, resolvedToday, highPriority, lastUpdated: new Date().toISOString() },
      };
    }),
};
