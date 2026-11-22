export const routes = {
  home: '/',
  login: '/login',
  applications: '/applications',
  application: (applicationId: string) => `/applications/${encodeURIComponent(applicationId)}`,
  applicationDetailPattern: '/applications/:id',
  review: '/review',
  account: '/account',
} as const;
