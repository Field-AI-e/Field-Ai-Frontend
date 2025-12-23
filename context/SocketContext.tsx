'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/types/contstants';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastDataEvent: any;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastDataEvent: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastDataEvent, setLastDataEvent] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
    });

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleDataReceived = (data: any) => {
      setLastDataEvent(data);
    };

    const handleError = (error: unknown) => {
      console.error('[socket] error', error);
    };

    setSocket(newSocket);
    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('data-received', handleDataReceived);
    newSocket.on('connect_error', handleError);
    newSocket.on('error', handleError);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('data-received', handleDataReceived);
      newSocket.off('connect_error', handleError);
      newSocket.off('error', handleError);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setLastDataEvent(null);
    };
  }, []);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      lastDataEvent,
    }),
    [socket, isConnected, lastDataEvent],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
