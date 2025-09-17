// src/context/socket.js
import { createContext } from 'react';
import { io } from 'socket.io-client';
import api from '@/config/api';

export const socket = io(`${api}`, {
  withCredentials: true,
  autoConnect: true
});

export const SocketContext = createContext(socket);
