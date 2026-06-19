import React from 'react';
import { useSelector } from 'react-redux';
import ConnectionLost from '@screens/ConnectionLost';

const NetworkGate = ({ children }) => {
  const isOnline = useSelector((state) => state?.common?.isOnline);

  if (isOnline === false) {
    return <ConnectionLost />;
  }

  return children;
};

export default NetworkGate;
