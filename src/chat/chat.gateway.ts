import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // 1. Join Room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    console.log('Client connected:', client.id);
    void client.join(payload.room);
    return {
      success: true,
      message: `Joined room: ${payload.room}`,
    };
  }

  // 2. Send Message to Room
  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      room: string;
      message: string;
    },
  ) {
    this.server.to(payload.room).emit('newMessage', {
      socketId: client.id,
      room: payload.room,
      message: payload.message,
    });

    return {
      success: true,
      message: 'Message sent',
    };
  }
}
