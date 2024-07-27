import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',
})
// implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
export class ChatsGateway implements OnGatewayConnection {
  async handleConnection(socket: Socket) {
    console.log(`on connect called : ${socket.id}`);
  }

  @SubscribeMessage('send_message')
  sendMessage(@MessageBody() message: string) {
    console.log(message);
  }
}
