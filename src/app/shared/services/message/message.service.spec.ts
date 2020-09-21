import { createHttpFactory, SpectatorHttp, HttpMethod } from '@ngneat/spectator';
import { fakeAsync, tick } from '@angular/core/testing';

import * as Stomp from 'stompjs';

import { MessageService } from './message.service';
import { NotificationsService } from './../notifications/notifications.service';
import { UserService } from './../user/user.service';

import { Chat } from './../../model/chat';
import { Message } from './../../model/message';
import { User } from './../../model/user';
import { MessageStatus } from './../../model/types/message-status';
import { UserStatus } from './../../model/types/user-status';
import { Role } from './../../model/types/role';

import { apiUrlMessage, messagingUrl } from '../../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `MessageService`.
 *
 * @author Robert Ene
 */
describe('MessageService', () => {

    const createStompJsMock = () => {
        return {
            stompClient: {
                connected: false,
                heartbeat: {
                    outgoing: 0,
                    incoming: 0
                },
                debug: () => { },
                connect: (headers: {}, connectCallback: () => any, errorCallback: () => any) => {
                    stompJsMock.stompClient.connected = true;
                    stompJsMock.stompClient.headers = headers;
                    stompJsMock.stompClient.connectCallback = connectCallback;
                    stompJsMock.stompClient.errorCallback = errorCallback;
                },
                subscribe: (topic: string, callback: (message: Message) => any) => {
                    stompJsMock.stompClient.topic = topic;
                    stompJsMock.stompClient.subscribeCallback = callback;
                    return stompJsMock.subscription;
                },
                send: (destination: string, headers?: {}, body?: string) => {
                    stompJsMock.stompClient.destination = destination;
                    stompJsMock.stompClient.sendHeaders = headers;
                    stompJsMock.stompClient.body = body;
                },
                disconnect: () => {
                    stompJsMock.stompClient.connected = false;
                },
            },
            client: (url: string) => {
                stompJsMock.stompClient.url = url;
                return stompJsMock.stompClient;
            },
            subscription: {
                id: Math.floor(Math.random() * 1000),
                unsubscribe: () => { }
            }
        };
    };

    const createMessageService = createHttpFactory({
        service: MessageService,
        mocks: [
            NotificationsService,
            UserService
        ]
    });
    let spectator: SpectatorHttp<MessageService>;

    let stompJsMock: any;
    let token: string;
    let user: User;
    let chat: Chat;
    let messages: Message[];

    beforeAll(() => {
        user = {
            id: 66, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        const fromUser = {
            id: 77, email: 'from@email.com',
            password: 'from', role: Role.USER,
            status: UserStatus.ENABLED, phone: '610029505',
            firstName: 'From', lastName: 'User'
        } as User;

        chat = {
            id: 1, code: 'COD1',
            fromUser, toUser: user,
            unreadMessages: 0
        } as Chat;

        messages = [];
        messages.push({
            id: 5, code: 'CODE5',
            content: '¡Hola!', date: new Date(),
            status: MessageStatus.READ, fromUser,
            toUser: user, chat
        } as unknown as Message);
        messages.push({
            id: 6, code: 'CODE6',
            content: '¿Qué tal todo?', date: new Date(),
            status: MessageStatus.READ, fromUser,
            toUser: user, chat
        } as unknown as Message);
        messages.push({
            id: 7, code: 'CODE7',
            content: '¡Muy bien! ¿Y tu?', date: new Date(),
            status: MessageStatus.READ, fromUser: user,
            toUser: fromUser, chat
        } as unknown as Message);

        token = 'eyJhbGciOiJIUzI1NiJ9' +
            '.eyJzdWIiOiJqb3NlQGVtYWlsLmNvbSIsImV4cCI6MTY4NjEwMTg5NCwicm9sZSI6IlVTRVIifQ' +
            '.BdAf2obyEm0pZOE_IQkZ7B2afQPiTCpBTGZTl-wEp90';

    });

    beforeEach(() => {
        spectator = createMessageService();
        stompJsMock = createStompJsMock();

        spyOn(Stomp, 'client').and.callFake((url: string) => stompJsMock.client(url));
        spectator.inject(UserService).getToken.andReturn(`"Bearer ${token}"`);
        spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
    });

    it('debería instanciar el servicio', () => {
        expect(spectator).toBeTruthy();
    });

    it('debería instanciar la cola de mensajes con el chat no visible en pantalla', () => {
        expect(spectator.service.getChatIsVisible()).toBeFalsy();
        expect(spectator.service.getMessageSubject()).toBeDefined();
    });

    it('debería modificar la variable para el chat en pantalla (mostrar)', () => {
        expect(spectator.service.getChatIsVisible()).toBeFalsy();

        spectator.service.setChatIsVisible(true);

        expect(spectator.service.getChatIsVisible()).toBeTruthy();
        expect(spectator.service.getMessageSubject()).toBeDefined();
    });

    it('debería modificar la variable para el chat en pantalla (ocultar)', () => {
        expect(spectator.service.getChatIsVisible()).toBeFalsy();

        spectator.service.setChatIsVisible(false);

        expect(spectator.service.getChatIsVisible()).toBeFalsy();
        expect(spectator.service.getMessageSubject()).toBeDefined();
    });

    it('debería recuperar los mensajes pertenecientes a un determinado chat dado su código y el email del usuario', async () => {
        const chatMessagesPromise = spectator.service.getChatMessages(chat.code, user.email);

        const url = `${apiUrlMessage}/markAsRead/${chat.code}?userEmail=${user.email}`;
        const testRequest = spectator.expectOne(url, HttpMethod.GET);
        testRequest.flush(messages);

        expect(testRequest.request.params.get('userEmail')).toEqual(user.email);
        expect(testRequest.request.body).toBeNull();
        expect(await chatMessagesPromise).toEqual(messages);
    });

    it('debería recuperar los mensajes (vacío) pertenecientes a un determinado chat dado su código y el email del usuario', async () => {
        const chatMessagesPromise = spectator.service.getChatMessages(chat.code, user.email);

        const url = `${apiUrlMessage}/markAsRead/${chat.code}?userEmail=${user.email}`;
        const testRequest = spectator.expectOne(url, HttpMethod.GET);
        testRequest.flush([]);

        expect(testRequest.request.params.get('userEmail')).toEqual(user.email);
        expect(testRequest.request.body).toBeNull();
        expect(await chatMessagesPromise).toEqual([]);
    });

    it('debería iniciar y detener el servicio de mensajería basado en el protocolo STOMP', fakeAsync(() => {
        spectator.service.startMessagingConnection();
        stompJsMock.stompClient.debug();
        stompJsMock.stompClient.connectCallback();
        tick(1000);

        const stompClient = spectator.service.getStompClient() as any;
        expect(stompClient).toBeDefined();
        expect(stompClient.url).toEqual(messagingUrl);
        expect(stompClient.connected).toBeTruthy();
        expect(stompClient.heartbeat.outgoing).not.toEqual(0);
        expect(stompClient.heartbeat.incoming).not.toEqual(0);
        expect(stompClient.headers).toBeDefined();
        expect(stompClient.headers.Authorization).toEqual(`Bearer ${token}`);
        expect(stompClient.topic).toEqual(`/exchange/chatMessage/${user.email}`);
        expect((spectator.service as any).userTopicSubscription).toBeDefined();

        spectator.service.ngOnDestroy();
        stompJsMock.stompClient.disconnect();

        expect((spectator.service as any).userTopicSubscription).toBeDefined();
    }));

    it('debería iniciar, recibir mensajes y detener el servicio de mensajería basado en el protocolo STOMP', fakeAsync(() => {
        const stompMessage = {
            command: 'MESSAGE',
            headers: {
                Authorization: `"Bearer ${token}"`
            },
            body: JSON.stringify(messages[0])
        } as unknown as Stomp.Message;

        spectator.service.startMessagingConnection();
        stompJsMock.stompClient.connectCallback();
        tick(1000);
        stompJsMock.stompClient.subscribeCallback(stompMessage);

        const messageSubject = spectator.service.getMessageSubject();
        expect(spectator.service.getChatIsVisible()).toBeFalsy();
        expect(messageSubject).toBeDefined();
        messageSubject.subscribe(message => {
            expect(message).toEqual(message[0]);
        });

        tick(1000);
        spectator.service.ngOnDestroy();
        stompJsMock.stompClient.disconnect();

        expect((spectator.service as any).userTopicSubscription).toBeDefined();
    }));

    it('debería iniciar, enviar mensajes y detener el servicio de mensajería basado en el protocolo STOMP', fakeAsync(() => {
        spectator.service.startMessagingConnection();
        stompJsMock.stompClient.connectCallback();
        tick(1000);

        spectator.service.sendMessage(messages[0], user.email);

        const stompClient = spectator.service.getStompClient() as any;
        expect(stompClient.destination).toEqual(`/send/chatMessage/${user.email}`);
        expect(stompClient.sendHeaders).toEqual({});
        expect(stompClient.body).toEqual(JSON.stringify(messages[0]));

        spectator.service.ngOnDestroy();
        stompJsMock.stompClient.disconnect();

        expect((spectator.service as any).userTopicSubscription).toBeDefined();
    }));

    it(`debería mostrar si ocurre un error durante la conexión del servicio de
        mensajería basado en el protocolo STOMP e intentar reconectar`, fakeAsync(() => {
        const startMessagingConnectionSpy = spyOn(spectator.service, 'startMessagingConnection');
        startMessagingConnectionSpy.and.callThrough();

        spectator.service.startMessagingConnection();
        stompJsMock.stompClient.errorCallback();
        tick(1000);

        expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
        expect(startMessagingConnectionSpy).toHaveBeenCalledTimes(2);
    }));

    it(`debería mostrar si ocurre un error si no se proporciona la autenticación necesaria durante
        la conexión del servicio de mensajería basado en el protocolo STOMP e intentar reconectar`, fakeAsync(() => {
        spectator.inject(UserService).getToken.andReturn(undefined);
        const startMessagingConnectionSpy = spyOn(spectator.service, 'startMessagingConnection');
        startMessagingConnectionSpy.and.callThrough();

        spectator.service.startMessagingConnection();
        stompJsMock.stompClient.connectCallback();
        tick(1000);
        stompJsMock.stompClient.errorCallback();

        const stompClient = spectator.service.getStompClient() as any;
        expect(stompClient.headers).toBeDefined();
        expect(stompClient.headers.Authorization).toBeUndefined();
        expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
        expect(startMessagingConnectionSpy).toHaveBeenCalled();

        (spectator.service as any).stompClient = undefined;
        (spectator.service as any).userTopicSubscription = undefined;
        spectator.service.ngOnDestroy();
    }));

    afterEach(() => {
        spectator.controller.verify();
    });
});
