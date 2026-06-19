import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { setOnlineStatus } from '@store/Common/actions';

const resolveIsOnline = (state) =>
  state?.isConnected === true && state?.isInternetReachable !== false;

export const useNetworkStatus = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setOnlineStatus(resolveIsOnline(state)));
    });

    NetInfo.fetch().then((state) => {
      dispatch(setOnlineStatus(resolveIsOnline(state)));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return { setOnline: (isOnline) => dispatch(setOnlineStatus(isOnline)) };
};
