import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from '@store/Common/actions';

export const useNetworkStatus = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setOnlineStatus(true));
  }, [dispatch]);

  return { setOnline: (isOnline) => dispatch(setOnlineStatus(isOnline)) };
};
