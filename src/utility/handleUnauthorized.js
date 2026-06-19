import { navigate } from './navigationRef';
import { SCREEN_NAMES } from '@constants';

export const handleUnauthorized = () => {
  navigate(SCREEN_NAMES.UNAUTHORIZED);
};
