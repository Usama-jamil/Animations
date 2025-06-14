import {io} from 'socket.io-client';

let socket = null;
// const SOCKET_HOST_URL = `wss://timezzi.com`;
const SOCKET_HOST_URL = `ws://13.55.207.172`;

export const connectSocket = async (user, setSocket) => {
  try {
    const token = await user?.accesstoken;
    if (token !== null) {
      const newSocket = io(`${SOCKET_HOST_URL}?user_id=${user?._id}`);
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setSocket(newSocket);
      });
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket = newSocket;
    }
  } catch (error) {
    console.error('Error retrieving token from user:', error);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket disconnected manually');
  }
};
