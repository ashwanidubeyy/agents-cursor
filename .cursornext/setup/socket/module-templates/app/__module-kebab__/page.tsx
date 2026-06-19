'use client';

import { __MODULE___CONSTANTS } from '@/features/__module__/constants/__module__.constants';
import { use__MODULE__Socket } from '@/features/__module__/hooks/use__MODULE__Socket';
import { __MODULE__PageStyles } from './styles';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

export default function __MODULE__Page() {
  const { isConnected, lastMessage, connect, disconnect } = use__MODULE__Socket(SOCKET_URL);

  return (
    <__MODULE__PageStyles.Main>
      <__MODULE__PageStyles.Title>{__MODULE___CONSTANTS.PAGE.TITLE}</__MODULE__PageStyles.Title>
      <__MODULE__PageStyles.Status data-testid="__module__-connection-status">
        {isConnected ? 'Connected' : 'Disconnected'}
      </__MODULE__PageStyles.Status>
      <__MODULE__PageStyles.Actions>
        <button type="button" onClick={() => connect()}>
          {__MODULE___CONSTANTS.ACTIONS.CONNECT}
        </button>
        <button type="button" onClick={() => disconnect()}>
          {__MODULE___CONSTANTS.ACTIONS.DISCONNECT}
        </button>
      </__MODULE__PageStyles.Actions>
      {lastMessage ? (
        <__MODULE__PageStyles.Message data-testid="__module__-last-message">
          {JSON.stringify(lastMessage)}
        </__MODULE__PageStyles.Message>
      ) : null}
    </__MODULE__PageStyles.Main>
  );
}
