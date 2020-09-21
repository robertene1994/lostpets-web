import { User } from './user';
import { Message } from './message';

export class Chat {
    id: number;
    code: string;
    fromUser: User;
    toUser: User;
    lastMessage: Message;
    unreadMessages: number;
}
