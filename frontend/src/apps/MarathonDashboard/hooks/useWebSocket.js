import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useWebSocket(marathonId) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setConnected(true);
      newSocket.emit('joinMarathon', marathonId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setConnected(false);
    });

    newSocket.on('newReading', (data) => {
      console.log('📨 Nova leitura recebida:', data);
      setLastMessage(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [marathonId]);

  const sendMessage = useCallback((event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  }, [socket, connected]);

  return {
    socket,
    connected,
    lastMessage,
    sendMessage
  };
}