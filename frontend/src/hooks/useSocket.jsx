import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { initializeSocket, disconnectSocket } from '@/services/socket';
import { useUser } from './useUser';
import { useAuth0 } from '@auth0/auth0-react';

const SocketContext = createContext(undefined);

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth0();
  const { user , setUser } = useUser();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);


  // Initialize socket when user changes
  useEffect(() => {
    if (!user?.username || !isAuthenticated) return;
    let newSocket;
    try {
      newSocket = initializeSocket(user.username);
      setSocket(newSocket);
    } catch (error) {
      console.error('Socket initialization error:', error);
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      if (newSocket) {
        newSocket.off(); // Remove all listeners
        disconnectSocket();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [ isAuthenticated]);

  // Handle socket events
  useEffect(() => {
    
    if (!socket) return;

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
      setIsConnected(false);
    };

    const handleOnlineStatusChange = (username , statusTo) => {
      console.log('Online status change:', username, statusTo);
      const friendIndex = user.friends.findIndex(friend => friend.username === username);
      if (friendIndex === -1) return;
      setUser(prevUser => {
        prevUser.friends[friendIndex].onlineStatus = statusTo;
        return { ...prevUser };
      })
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on('onlineStatusChange', handleOnlineStatusChange);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      socket.off('onlineStatusChange', handleOnlineStatusChange);
    };
  }, [socket]);

  // Provide context value
  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    subscribe: (event, callback) => {
      if (!socket) return () => {};
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};