'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setOnlineStatus } from '@/store/slices/commonSlice';

const resolveIsOnline = () =>
  typeof navigator !== 'undefined' ? navigator.onLine === true : true;

export const useNetworkStatus = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const syncOnlineStatus = () => {
      dispatch(setOnlineStatus(resolveIsOnline()));
    };

    syncOnlineStatus();
    window.addEventListener('online', syncOnlineStatus);
    window.addEventListener('offline', syncOnlineStatus);

    return () => {
      window.removeEventListener('online', syncOnlineStatus);
      window.removeEventListener('offline', syncOnlineStatus);
    };
  }, [dispatch]);

  return { setOnline: (isOnline: boolean) => dispatch(setOnlineStatus(isOnline)) };
};
