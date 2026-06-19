'use client';

import { useAppSelector } from '@/store/hooks';
import ConnectionLost from '@/components/layouts/ConnectionLost';

interface NetworkGateProps {
  children: React.ReactNode;
}

const NetworkGate = ({ children }: NetworkGateProps) => {
  const isOnline = useAppSelector((state) => state?.common?.isOnline);

  if (isOnline === false) {
    return <ConnectionLost />;
  }

  return children;
};

export default NetworkGate;
