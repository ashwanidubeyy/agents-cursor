'use client';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/widgets/Button';
import { TITLES, TEST_IDS } from '@/constants';
import { setOnlineStatus } from '@/store/slices/commonSlice';
import { ConnectionLostStyles } from './styles';

const ConnectionLost = () => {
  const dispatch = useDispatch();

  const handleRetry = useCallback(() => {
    const isOnline =
      typeof navigator !== 'undefined' ? navigator.onLine === true : true;
    dispatch(setOnlineStatus(isOnline));
  }, [dispatch]);

  return (
    <ConnectionLostStyles.Container data-testid={TEST_IDS.ERROR_PAGES.CONNECTION_LOST}>
      <ConnectionLostStyles.Title>
        {TITLES.ERROR_PAGES.CONNECTION_LOST.TITLE}
      </ConnectionLostStyles.Title>
      <ConnectionLostStyles.Message>
        {TITLES.ERROR_PAGES.CONNECTION_LOST.MESSAGE}
      </ConnectionLostStyles.Message>
      <Button
        title={TITLES.ERROR_PAGES.CONNECTION_LOST.RETRY}
        onClick={handleRetry}
        testId={TEST_IDS.ERROR_PAGES.CONNECTION_LOST_RETRY}
      />
    </ConnectionLostStyles.Container>
  );
};

export default ConnectionLost;
