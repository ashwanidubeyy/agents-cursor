import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { fetchAnalytics } from '@store/Tickets/actions';
import { ANALYTICS_REFRESH_MS } from '@constants/tickets';

export const useAnalyticsPolling = () => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isFocused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    dispatch(fetchAnalytics());
    intervalRef.current = setInterval(() => {
      dispatch(fetchAnalytics());
    }, ANALYTICS_REFRESH_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, isFocused]);
};
