import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockPlatformLocation } from '@angular/common/testing';
import { NO_ERRORS_SCHEMA, } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { RouterEvent, NavigationEnd, Params, ActivatedRoute } from '@angular/router';
import { Subject, } from 'rxjs';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { SpinnerService } from './shared/services/spinner/spinner.service';
import { NotificationsService } from './shared/services/notifications/notifications.service';
import { UserService } from './shared/services/user/user.service';
import { MessageService } from './shared/services/message/message.service';

import { AppComponent } from './app.component';

import { User } from './shared/model/user';
import { Chat } from './shared/model/chat';
import { Message } from './shared/model/message';
import { Role } from './shared/model/types/role';
import { UserStatus } from './shared/model/types/user-status';
import { MessageStatus } from './shared/model/types/message-status';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el componente `AppComponent`.
 *
 * @author Robert Ene
 */
describe('AppComponent', () => {

    const eventsMock = new Subject<RouterEvent>();
    const queryParamsMock = new Subject<Params>();
    const activatedRouteMock = {
        queryParams: queryParamsMock.asObservable()
    };

    const createAppComponent = createComponentFactory({
        component: AppComponent,
        imports: [
            RouterTestingModule
        ],
        mocks: [
            SpinnerService,
            NotificationsService,
            UserService,
            MessageService,
        ],
        providers: [
            { provide: PlatformLocation, useClass: MockPlatformLocation },
            { provide: ActivatedRoute, useValue: activatedRouteMock }
        ],
        schemas: [NO_ERRORS_SCHEMA]
    });

    let spectator: Spectator<AppComponent>;

    let user: User;
    let fromUser: User;
    let messageSubject: Subject<Message>;
    let message: Message;

    beforeAll(() => {
        user = {
            id: 88, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        fromUser = {
            id: 101, email: 'from@email.com',
            password: 'from', role: Role.USER,
            status: UserStatus.ENABLED, phone: '610029505',
            firstName: 'From', lastName: 'User'
        } as User;

        const chat = {
            id: 1, code: 'COD1',
            fromUser, toUser: user,
            unreadMessages: 12
        } as Chat;

        message = {
            id: 3, code: 'CODE3',
            content: '¡Hola!', date: new Date(),
            status: MessageStatus.SENT, fromUser,
            toUser: user, chat
        } as unknown as Message;
    });

    beforeEach(() => {
        spectator = createAppComponent();

        const routerEvents = (spectator.component as any).router.events;
        routerEvents.events = eventsMock.asObservable();
        eventsMock.observers = routerEvents.observers;

        messageSubject = new Subject();
        spyOn((spectator.component as any).router, 'navigate');
    });

    it('debería instanciar el componente', () => {
        expect(spectator.component).toBeTruthy();
    });


    describe('creación de barra de navegación superior', () => {

        it('debería crear la barra de navegación superior (sesión no iniciada)', () => {
            spectator.inject(UserService).isUserLoggedIn.andReturn(false);
            spectator.detectChanges();

            const navbarLinks = spectator.queryAll('.btn.btn-navbar')
                .map(link => link.getAttribute('routerLink'));

            const expectedRouterLinks = ['/login', '/signup'];
            expect(navbarLinks).toEqual(expectedRouterLinks);
            expect(spectator.query('#navbar')).toBeDefined();
        });

        it('debería crear la barra de navegación superior (sesión iniciada - usuario)', () => {
            spectator.inject(UserService).isUserLoggedIn.andReturn(true);
            spectator.inject(UserService).getLoggedUserSync.andReturn(user);
            spectator.detectChanges();

            const navbarLinks = spectator.queryAll('.btn.btn-navbar');

            const expectedRouterLinks = [
                '/ads', '/user-ads', 'fa-plus', '/user-chats',
                'fa-user-circle', 'fa-sign-out'
            ];
            for (let i = 0; i < navbarLinks.length; i++) {
                if (navbarLinks[i].getAttribute('routerLink') != null) {
                    expect(navbarLinks[i].getAttribute('routerLink')).toEqual(expectedRouterLinks[i]);
                } else {
                    expect(navbarLinks[i].getElementsByClassName(expectedRouterLinks[i])).toBeTruthy();
                }
            }
            expect(spectator.query('#navbar')).toBeDefined();
        });

        it('debería crear la barra de navegación superior (sesión iniciada - administrador)', () => {
            spectator.inject(UserService).isUserLoggedIn.andReturn(true);
            user.role = Role.ADMIN;
            spectator.inject(UserService).getLoggedUserSync.andReturn(user);
            spectator.detectChanges();

            const navbarLinks = spectator.queryAll('.btn.btn-navbar');
            const expectedRouterLinks = [
                '/ads', '/users', '/user-chats',
                'fa-user-circle', 'fa-sign-out'
            ];
            for (let i = 0; i < navbarLinks.length; i++) {
                if (navbarLinks[i].getAttribute('routerLink') != null) {
                    expect(navbarLinks[i].getAttribute('routerLink')).toEqual(expectedRouterLinks[i]);
                } else {
                    expect(navbarLinks[i].getElementsByClassName(expectedRouterLinks[i])).toBeTruthy();
                }
            }
            expect(spectator.query('#navbar')).toBeDefined();
        });
    });


    describe('navegación a la pantalla que permite publicar un nuevo anuncio', () => {

        it('debería navegar a la pantalla que permite publicar un nuevo anuncio (sesión iniciada - usuario)', () => {
            spectator.inject(UserService).isUserLoggedIn.andReturn(true);
            user.role = Role.USER;
            spectator.inject(UserService).getLoggedUserSync.andReturn(user);
            eventsMock.next(new NavigationEnd(1, '/ads', '/ads'));
            spectator.detectChanges();

            const addAd = spectator.queryAll('.btn.btn-navbar')
                .map(link => link.getElementsByClassName('fa-plus')[0])
                .filter(link => link)[0];
            spectator.click(addAd);

            const actualRoute = (spectator.component as any).actualRoute;
            expect(actualRoute).toEqual('/ads');
            expect((spectator.component as any).router.navigate)
                .toHaveBeenCalledWith(['/add-ad'], { queryParams: { from: actualRoute } });
        });

        it(`debería no navegar desde la pantalla que permite publicar un
            nuevo anuncio a la misma pantalla (sesión iniciada - usuario)`, () => {
                spectator.inject(UserService).isUserLoggedIn.andReturn(true);
                user.role = Role.USER;
                spectator.inject(UserService).getLoggedUserSync.andReturn(user);
                eventsMock.next(new NavigationEnd(1, '/add-ad', '/add-ad'));
                spectator.detectChanges();

                const addAd = spectator.queryAll('.btn.btn-navbar')
                    .map(link => link.getElementsByClassName('fa-plus')[0])
                    .filter(link => link)[0];
                spectator.click(addAd);

                expect((spectator.component as any).actualRoute).toEqual('/add-ad');
                expect((spectator.component as any).router.navigate).not.toHaveBeenCalled();
            });
    });


    describe('navegación a la pantalla que permite modificar los datos del usuario', () => {

        it('debería navegar a la pantalla que permite modificar los datos del usuario (sesión iniciada - administrador)', () => {
            spectator.inject(UserService).isUserLoggedIn.andReturn(true);
            user.role = Role.ADMIN;
            spectator.inject(UserService).getLoggedUserSync.andReturn(user);
            eventsMock.next(new NavigationEnd(1, '/ads', '/ads'));
            spectator.detectChanges();

            const userProfile = spectator.queryAll('.btn.btn-navbar')
                .map(link => link.getElementsByClassName('fa-user-circle')[0])
                .filter(link => link)[0];
            spectator.click(userProfile);

            const actualRoute = (spectator.component as any).actualRoute;
            expect(actualRoute).toEqual('/ads');
            expect((spectator.component as any).router.navigate)
                .toHaveBeenCalledWith(['/user-profile'], { queryParams: { from: actualRoute } });
        });

        it(`debería no navegar desde la pantalla que permite modificar los datos del
        usuario a la misma pantalla (sesión iniciada - administrador)`, () => {
                spectator.inject(UserService).isUserLoggedIn.andReturn(true);
                user.role = Role.USER;
                spectator.inject(UserService).getLoggedUserSync.andReturn(user);
                eventsMock.next(new NavigationEnd(1, '/user-profile', '/user-profile'));
                spectator.detectChanges();

                const userProfile = spectator.queryAll('.btn.btn-navbar')
                    .map(link => link.getElementsByClassName('fa-user-circle')[0])
                    .filter(link => link)[0];
                spectator.click(userProfile);

                expect((spectator.component as any).actualRoute).toEqual('/user-profile');
                expect((spectator.component as any).router.navigate).not.toHaveBeenCalled();
            });
    });


    describe('cierre de la sesión del usuario', () => {

        it('debería navegar a la página de inicio (home), cerrar la sesión del usuario y detener el servicio de mensajería', () => {
            spectator.inject(UserService).isUserLoggedIn.andReturn(true);
            spectator.inject(UserService).getLoggedUserSync.andReturn(user);
            spectator.detectChanges();

            const logout = spectator.queryAll('.btn.btn-navbar.btn-logout')[0];
            spectator.click(logout);

            expect(spectator.inject(MessageService).stopMessagingConnection).toHaveBeenCalled();
            expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
            expect((spectator.component as any).router.navigate).toHaveBeenCalledWith(['/']);
        });
    });


    describe('establecimiento de la ruta actual de la navegación', () => {

        it('debería no establecer la ruta actual (ruta anterior inválida)', () => {
            eventsMock.next(new NavigationEnd(1, undefined, undefined));

            expect((spectator.component as any).actualRoute).toBeUndefined();
        });

        it('debería establecer la ruta actual (ruta anterior válida)', () => {
            eventsMock.next(new NavigationEnd(1, '/add-ad', '/add-ad'));

            expect((spectator.component as any).actualRoute).toEqual('/add-ad');
        });

        it('debería establecer la ruta actual (ruta anterior con parámetros y válida)', () => {
            eventsMock.next(new NavigationEnd(1, '/add-ad?savedAd=true', '/add-ad?savedAd=true'));

            expect((spectator.component as any).actualRoute).toEqual('/add-ad');
        });
    });


    describe('notificación de las operaciones realizadas por el usuario', () => {

        it('debería mostrar una notificación de que un determinado anuncio ha sido modificado correctamente', () => {
            queryParamsMock.next({ updatedAd: 'true' });

            expect(spectator.inject(NotificationsService).showSuccess).toHaveBeenCalled();
        });

        it('debería mostrar una notificación de que un determinado anuncio ha sido publicado correctamente', () => {
            queryParamsMock.next({ savedAd: 'true' });

            expect(spectator.inject(NotificationsService).showSuccess).toHaveBeenCalled();
        });

        it('debería mostrar una notificación de que los datos de la cuenta del usuario han sido modificados correctamente', () => {
            queryParamsMock.next({ updatedUserProfile: 'true' });

            expect(spectator.inject(NotificationsService).showSuccess).toHaveBeenCalled();
        });
    });


    describe('cierre de la sesión durante la navegación mediante los botones del navegador', () => {

        it(`debería cerrar la sesión del usuario si se pulsa el botón 'atrás' del navegador (pantallas 'login' y 'signup')`, () => {
            const location = (spectator.component as any).location as MockPlatformLocation;
            location.pushState('signup', 'Lostpets: Registrarse', '/signup');
            location.pushState('login', 'Lostpets: Iniciar Sesión', '/login');
            spectator.detectChanges();

            location.back();
            (spectator.component as any).checkLocation();

            expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
        });

        it(`debería no cerrar la sesión del usuario si se pulsa el botón 'atrás' del navegador (resto de pantallas)`, () => {
            const location = (spectator.component as any).location as MockPlatformLocation;
            location.pushState('add-ad', 'Lostpets: Nuevo Anuncio', '/add-ad');
            spectator.detectChanges();

            location.back();
            (spectator.component as any).checkLocation();

            expect(spectator.inject(UserService).logOut).not.toHaveBeenCalled();
        });
    });


    describe('inicialización del servicio de mensajería', () => {

        it('debería inicializar el servicio de mensajería (chat no visible en pantalla) y mostrar los mensajes entrantes', fakeAsync(() => {
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(MessageService).getMessageSubject.andReturn(messageSubject);
            spectator.inject(MessageService).getChatIsVisible.andReturn(false);

            spectator.component.ngOnInit();
            tick(500);
            messageSubject.next(message);
            expect(spectator.inject(MessageService).startMessagingConnection).toHaveBeenCalled();
            message.messageStatus = MessageStatus.DELIVERED;
            expect(spectator.inject(MessageService).sendMessage).toHaveBeenCalledWith(message, fromUser.email);
            expect(spectator.inject(NotificationsService).showMessage)
                .toHaveBeenCalledWith(`${fromUser.lastName} ${fromUser.firstName}`, message.content);
        }));

        it('debería inicializar el servicio de mensajería (chat visible en pantalla) y no mostrar los mensajes entrantes', fakeAsync(() => {
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(MessageService).getMessageSubject.andReturn(messageSubject);
            spectator.inject(MessageService).getChatIsVisible.andReturn(true);

            spectator.component.ngOnInit();
            tick(500);
            messageSubject.next(message);

            expect(spectator.inject(MessageService).startMessagingConnection).toHaveBeenCalled();
            expect(spectator.inject(MessageService).sendMessage).not.toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showMessage).not.toHaveBeenCalled();
        }));

        it('debería inicializar el servicio de mensajería y no resolver los mensajes entrantes', fakeAsync(() => {
            spectator.inject(UserService).getLoggedUser.andReturn(user);
            spectator.detectChanges();

            spectator.component.ngOnInit();
            tick(500);
            messageSubject.next(message);

            expect(spectator.inject(MessageService).startMessagingConnection).toHaveBeenCalled();
            expect(spectator.inject(MessageService).sendMessage).not.toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showMessage).not.toHaveBeenCalled();
        }));
    });

    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
