import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected');
  console.log('Socket ID:', socket.id);

  // Join room
  socket.emit('joinRoom', { room: 'developers' }, (response: any) => {
    console.log('Join response:', response);
  });

  // Send message
  socket.emit(
    'sendMessage',
    {
      room: 'developers',
      message: 'message can see only a developers room.',
    },
    (response: any) => {
      console.log('Send response:', response);
    },
  );
});

// Receive message
socket.on('newMessage', (data) => {
  console.log('New message:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
