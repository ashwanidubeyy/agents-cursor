'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NetworkGate from '@/components/layouts/NetworkGate';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  useNetworkStatus();
  return <NetworkGate>{children}</NetworkGate>;
};

export default AppShell;
