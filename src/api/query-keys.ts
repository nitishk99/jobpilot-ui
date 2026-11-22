export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: (page: number, limit: number, options: { search: string; sortBy: string; order: string }) =>
      ['applications', 'list', { page, limit, ...options }] as const,
    timeline: (applicationId: string) => ['applications', applicationId, 'timeline'] as const,
  },
  emails: {
    review: ['emails', 'review'] as const,
    reviewList: (page: number, limit: number) => ['emails', 'review', { page, limit }] as const,
    original: (emailId: string) => ['emails', emailId] as const,
  },
} as const;
