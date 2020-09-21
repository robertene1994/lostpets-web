import { createHttpFactory, SpectatorHttp, HttpMethod } from '@ngneat/spectator';

import { ChatService } from './chat.service';

import { Chat } from '../../model/chat';
import { User } from '../../model/user';
import { Role } from '../../model/types/role';
import { UserStatus } from '../../model/types/user-status';

import { apiUrlChat } from 'src/app/app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `ChatService`.
 *
 * @author Robert Ene
 */
describe('ChatService', () => {

    const createChatService = createHttpFactory(ChatService);
    let spectator: SpectatorHttp<ChatService>;

    let user: User;
    let chats: Chat[];

    beforeAll(() => {
        user = {
            id: 88, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        chats = [];
        chats.push({
            id: 1, code: 'COD1',
            fromUser: {
                id: 101, email: 'from@email.com',
                password: 'from', role: Role.USER,
                status: UserStatus.ENABLED, phone: '610029505',
                firstName: 'From', lastName: 'User'
            } as User,
            toUser: user, unreadMessages: 0
        } as Chat);
        chats.push({
            id: 2, code: 'COD2',
            fromUser: {
                id: 101, email: 'from@email.com',
                password: 'from', role: Role.USER,
                status: UserStatus.ENABLED, phone: '610029505',
                firstName: 'From', lastName: 'User'
            } as User,
            toUser: user, unreadMessages: 5
        } as Chat);
    });

    beforeEach(() => {
        spectator = createChatService();
    });

    it('debería instanciar el servicio', () => {
        expect(spectator.service).toBeTruthy();
    });

    it('debería recuperar los chats pertenecientes a un determinado usuario dado su id', async () => {
        const userChatsPromise = spectator.service.getUserChats(user.id);

        spectator.expectOne(`${apiUrlChat}/user/${user.id}`, HttpMethod.GET).flush(chats);
        expect(await userChatsPromise).toEqual(chats);
    });

    it('debería recuperar los chats (vacío) pertenecientes a un determinado usuario dado su id', async () => {
        const userChatsPromise = spectator.service.getUserChats(user.id);

        spectator.expectOne(`${apiUrlChat}/user/${user.id}`, HttpMethod.GET).flush([]);
        expect(await userChatsPromise).toEqual([]);
    });

    afterEach(() => {
        spectator.controller.verify();
    });
});
