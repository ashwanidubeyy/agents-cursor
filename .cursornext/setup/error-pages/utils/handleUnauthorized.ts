import { ROUTES } from '@/constants/routes';

export const handleUnauthorized = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.href = ROUTES.UNAUTHORIZED;
};
