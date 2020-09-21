import { MessageStatus } from './types/message-status';
import { User } from 'src/app/shared/model/user';
import { Chat } from './chat';

export class Message {
    id: number;
    code: string;
    content: string;
    date: number;
    messageStatus: MessageStatus;
    fromUser: User;
    toUser: User;
    chat: Chat;
}
