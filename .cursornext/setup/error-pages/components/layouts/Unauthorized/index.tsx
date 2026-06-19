'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/widgets/Button';
import { TITLES, TEST_IDS } from '@/constants';
import { UnauthorizedStyles } from './styles';

const Unauthorized = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  };

  return (
    <UnauthorizedStyles.Container data-testid={TEST_IDS.ERROR_PAGES.UNAUTHORIZED}>
      <UnauthorizedStyles.Title>
        {TITLES.ERROR_PAGES.UNAUTHORIZED.TITLE}
      </UnauthorizedStyles.Title>
      <UnauthorizedStyles.Message>
        {TITLES.ERROR_PAGES.UNAUTHORIZED.MESSAGE}
      </UnauthorizedStyles.Message>
      <Button
        title={TITLES.ERROR_PAGES.UNAUTHORIZED.GO_BACK}
        onClick={handleGoBack}
        testId={TEST_IDS.ERROR_PAGES.UNAUTHORIZED_GO_BACK}
      />
    </UnauthorizedStyles.Container>
  );
};

export default Unauthorized;
