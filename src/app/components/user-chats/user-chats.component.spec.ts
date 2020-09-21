import { MessageStatus } from './../../shared/model/types/message-status';
import { Message } from './../../shared/model/message';
import { Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { UserChatsComponent } from './user-chats.component';

import { SpinnerService } from './../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from './../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';
import { UserService } from './../../shared/services/user/user.service';
import { ChatService } from './../../shared/services/chat/chat.service';
import { MessageService } from './../../shared/services/message/message.service';

import { User } from './../../shared/model/user';
import { Chat } from './../../shared/model/chat';
import { ExceptionResponse } from './../../shared/model/exception-response';
import { Role } from './../../shared/model/types/role';
import { UserStatus } from './../../shared/model/types/user-status';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el componente `UserChatsComponent`.
 *
 * @author Robert Ene
 */
describe('UserChatsComponent', () => {

    let activatedRouteMock: any;

    const createUserChatsComponent = createComponentFactory({
        component: UserChatsComponent,
        imports: [
            RouterTestingModule
        ],
        providers: [
            SpinnerService
        ],
        mocks: [
            ErrorHandlerService,
            NotificationsService,
            UserService,
            ChatService,
            MessageService
        ],
        schemas: [NO_ERRORS_SCHEMA]
    });
    let spectator: Spectator<UserChatsComponent>;

    let messageSubject: Subject<Message>;
    let user: User;
    let userChats: Chat[];
    let messages: Message[];

    beforeAll(() => {
        user = {
            id: 44, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        userChats = [];
        userChats.push({
            id: 1, code: 'COD1',
            fromUser: {
                id: 109, email: 'from@email.com',
                password: 'from', role: Role.USER,
                status: UserStatus.ENABLED, phone: '610029505',
                firstName: 'From', lastName: 'User'
            } as User,
            toUser: user, unreadMessages: 0
        } as Chat);
        userChats.push({
            id: 2, code: 'COD2',
            fromUser: {
                id: 101, email: 'from@email.com',
                password: 'from', role: Role.USER,
                status: UserStatus.ENABLED, phone: '610029505',
                firstName: 'From', lastName: 'User'
            } as User,
            toUser: user, unreadMessages: 5
        } as Chat);

        messages = [];
        messages.push({
            id: 5, code: 'CODE5',
            content: '¡Hola!', date: new Date(),
            status: MessageStatus.READ,
            formUser: userChats[0].fromUser,
            toUser: user, chat: userChats[0]
        } as unknown as Message);
        messages.push({
            id: 6, code: 'CODE6',
            content: '¿Qué tal todo?', date: new Date(),
            status: MessageStatus.READ,
            formUser: userChats[0].fromUser,
            toUser: user, chat: userChats[0]
        } as unknown as Message);
        messages.push({
            id: 7, code: 'CODE7',
            content: '¡Muy bien! ¿Y tu?', date: new Date(),
            status: MessageStatus.READ, fromUser: user,
            toUser: userChats[0].toUser, chat: userChats[0]
        } as unknown as Message);
    });

    beforeEach(() => {
        spectator = createUserChatsComponent();

        activatedRouteMock = {
            snapshot: {
                params: {
                    id: userChats[0].fromUser.id
                }
            }
        };

        messageSubject = new Subject();

        spyOn((spectator.component as any).spinnerService, 'showSpinner');
        spyOn((spectator.component as any).spinnerService, 'hideSpinner');
    });

    it(`debería instanciar el componente (título 'LostPets: Chats')`, async () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Chats');
    });


    describe('recuperación de los chats del usuario en sesión', () => {

        it(`debería recuperar los chats del usuario en sesión (chats no abiertos, nuevo mensaje
            inicializado, servicio de mensajería inicializado)`, async () => {
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(ChatService).getUserChats.andReturn(Promise.resolve(userChats));
                spectator.inject(MessageService).getMessageSubject.andReturn(messageSubject);

                await spectator.component.ngOnInit();

                const componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.user).toEqual(user);
                expect(componentSpy.userChats).toEqual(userChats);
                expect(componentSpy.message).toBeDefined();
                expect(componentSpy.message.fromUser).toEqual(user);
                expect(componentSpy.selectedChat).toBeUndefined();
                expect(componentSpy.messages).toBeUndefined();
                expect(componentSpy.messageSubscription).toBeDefined();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });


        it(`debería recuperar los chats (vacío) del usuario en sesión (chats no abiertos, nuevo
            mensaje inicializado, servicio de mensajería inicializado)`, async () => {
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(ChatService).getUserChats.andReturn(Promise.resolve([]));
                spectator.inject(MessageService).getMessageSubject.andReturn(messageSubject);

                await spectator.component.ngOnInit();

                const componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.user).toEqual(user);
                expect(componentSpy.userChats).toEqual([]);
                expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();
                expect(componentSpy.message).toBeDefined();
                expect(componentSpy.message.fromUser).toEqual(user);
                expect(componentSpy.selectedChat).toBeUndefined();
                expect(componentSpy.messages).toBeUndefined();
                expect(componentSpy.messageSubscription).toBeDefined();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no recuperar los chats del usuario en sesión (error producido en el servidor)`, async () => {
            const serverError = {
                error: {
                    field: 'campo',
                    code: '400',
                    exception: 'Exception',
                    message: 'Error producido en el servidor'
                } as ExceptionResponse,
                status: 400,
                statusText: 'Bad Request'
            };
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(ChatService).getUserChats.andReturn(Promise.reject(serverError));

            await spectator.component.ngOnInit();

            const componentSpy = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(componentSpy.user).toEqual(user);
            expect(componentSpy.userChats).toBeUndefined();
            expect(componentSpy.message).toBeDefined();
            expect(componentSpy.message.fromUser).toEqual(user);
            expect(componentSpy.selectedChat).toBeUndefined();
            expect(componentSpy.messages).toBeUndefined();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });
    });


    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
