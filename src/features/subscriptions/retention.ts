export const RETENTION_RESOURCE = [
  "activities",
  "messages",
] as const;

export type RetentionResource =
  typeof RETENTION_RESOURCE[number];

export const RETENTION_LIMITS = {
  Free: {
    activities: 3,
    messages: 3,
  },

  Starter: {
    activities: 12,
    messages: 12,
  },

  Team: {
    activities: 36,
    messages: 36,
  },

  Business: {
    activities: 60,
    messages: 60,
  },

  Enterprise: {
    activities: null,
    messages: null,
  },
} as const;
