export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  authApiUrl: import.meta.env.VITE_API_AUTH_URL ?? '/api',
} as const;
