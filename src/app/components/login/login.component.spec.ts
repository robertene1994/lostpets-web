import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Params, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { LoginComponent } from './login.component';

import { SpinnerService } from './../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from './../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';
import { UserService } from './../../shared/services/user/user.service';
import { MessageService } from './../../shared/services/message/message.service';

import { User } from './../../shared/model/user';
import { AccountCredentials } from './../../shared/model/account-credentials';
import { ExceptionResponse } from './../../shared/model/exception-response';
import { UserStatus } from './../../shared/model/types/user-status';
import { Role } from './../../shared/model/types/role';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el componente `LoginComponent`.
 *
 * @author Robert Ene
 */
describe('LoginComponent', () => {

    const queryParamsMock = new Subject<Params>();
    const activatedRouteMock = {
        queryParams: queryParamsMock.asObservable()
    };
    let routerNavigateSpy: jasmine.Spy<jasmine.Func>;

    const createLoginComponent = createComponentFactory({
        component: LoginComponent,
        imports: [
            RouterTestingModule
        ],
        mocks: [
            SpinnerService,
            ErrorHandlerService,
            NotificationsService,
            UserService,
            MessageService,
        ],
        providers: [
            { provide: ActivatedRoute, useValue: activatedRouteMock }
        ],
        schemas: [NO_ERRORS_SCHEMA]
    });
    let spectator: Spectator<LoginComponent>;

    let user: User;
    let account: AccountCredentials;

    beforeAll(() => {
        user = {
            id: 88, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        account = {
            email: user.email,
            password: user.password
        } as AccountCredentials;
    });

    beforeEach(() => {
        spectator = createLoginComponent();

        routerNavigateSpy = spyOn((spectator.component as any).router, 'navigate');
    });

    it(`debería instanciar el componente (título 'LostPets: Iniciar Sesión')`, () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Iniciar Sesión');
    });


    describe('sesión existente del usuario', () => {

        it(`debería comprobar la sesión del usuario (cuenta habilitada), inicializar el servicio de
            mensajería y redirigirlo a la pantalla de anuncios de mascotas perdidas`, fakeAsync(() => {
            user.status = UserStatus.ENABLED;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.detectChanges();

            spectator.component.ngOnInit();
            tick(500);

            expect(spectator.inject(ErrorHandlerService).handleError).not.toHaveBeenCalled();
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/ads']);
            expect(spectator.inject(MessageService).startMessagingConnection).toHaveBeenCalled();
        }));

        it(`debería comprobar la sesión del usuario (cuenta inhabilitada), no inicializar el servicio de
            mensajería y mostrar la notificación asociada`, fakeAsync(() => {
            user.status = UserStatus.DISABLED;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.detectChanges();

            spectator.component.ngOnInit();
            tick(500);

            expect(spectator.inject(ErrorHandlerService).handleError).not.toHaveBeenCalled();
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { userStatus: true } });
            expect(spectator.inject(MessageService).startMessagingConnection).not.toHaveBeenCalled();
        }));
    });


    describe('notificación de las operaciones realizadas por el usuario', () => {

        it('debería mostrar una notificación de que el usuario ha sido registrado en el sistema correctamente', () => {
            queryParamsMock.next({ registered: 'true' });

            expect(spectator.inject(NotificationsService).showSuccess).toHaveBeenCalled();
        });

        it(`debería mostrar una notificación de que la cuenta del usuario ha sido
            desactivada por el administrador (y cerrar la sesión iniciada)`, () => {
                queryParamsMock.next({ userStatus: 'true' });

                expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showWarn).toHaveBeenCalled();
            });

        it(`debería mostrar una notificación de que la cuenta del usuario no tiene el rol
            necesario para acceder a una determinada página (y cerrar la sesión iniciada)`, () => {
                queryParamsMock.next({ roleNotAllowed: 'true' });

                expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showWarn).toHaveBeenCalled();
            });
    });


    describe('inicio de la sesión (autenticación del usuario)', () => {

        it(`debería permitir iniciar sesión en el sistema (credenciales válidas,
            cuenta habilitada, inicialización del servicio de mensajería)`, async () => {
                user.status = UserStatus.ENABLED;
                spectator.inject(UserService).logIn.andReturn(Promise.resolve());
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.detectChanges();

                let accountSpy = (spectator.component as any).account;
                expect((spectator.component as any).emailRegExp).toBeDefined();
                expect(accountSpy).toBeDefined();
                expect(accountSpy.email).toBeUndefined();
                expect(accountSpy.password).toBeUndefined();
                expect((spectator.component as any).checkValidCredentials()).toBeFalsy();
                expect(spectator.component.logInButtonState()).toBeTruthy();

                (spectator.component as any).account = account;
                spectator.detectChanges();

                accountSpy = (spectator.component as any).account;
                expect(accountSpy).toBeDefined();
                expect(accountSpy.email).toEqual(account.email);
                expect(accountSpy.password).toEqual(account.password);
                expect((spectator.component as any).checkValidCredentials()).toBeTruthy();
                expect(spectator.component.logInButtonState()).toBeFalsy();

                await spectator.component.logIn();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(MessageService).startMessagingConnection).toHaveBeenCalled();
                expect(routerNavigateSpy).toHaveBeenCalledWith(['/ads']);
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it('debería no permitir iniciar sesión en el sistema (credenciales inválidas)', async () => {
            const accountSpy = (spectator.component as any).account;
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect(accountSpy).toBeDefined();
            expect(accountSpy.email).toBeUndefined();
            expect(accountSpy.password).toBeUndefined();
            expect((spectator.component as any).checkValidCredentials()).toBeFalsy();
            expect(spectator.component.logInButtonState()).toBeTruthy();

            await spectator.component.logIn();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
            expect(spectator.inject(MessageService).startMessagingConnection).not.toHaveBeenCalled();
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it('debería no permitir iniciar sesión en el sistema (cuenta inhabilitada)', async () => {
            user.status = UserStatus.DISABLED;
            spectator.inject(UserService).logIn.andReturn(Promise.resolve());
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.detectChanges();

            let accountSpy = (spectator.component as any).account;
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect(accountSpy).toBeDefined();
            expect(accountSpy.email).toBeUndefined();
            expect(accountSpy.password).toBeUndefined();
            expect((spectator.component as any).checkValidCredentials()).toBeFalsy();
            expect(spectator.component.logInButtonState()).toBeTruthy();

            (spectator.component as any).account = account;
            spectator.detectChanges();

            accountSpy = (spectator.component as any).account;
            expect(accountSpy).toBeDefined();
            expect(accountSpy.email).toEqual(account.email);
            expect(accountSpy.password).toEqual(account.password);
            expect((spectator.component as any).checkValidCredentials()).toBeTruthy();
            expect(spectator.component.logInButtonState()).toBeFalsy();

            await spectator.component.logIn();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(MessageService).startMessagingConnection).not.toHaveBeenCalled();
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showWarn).toHaveBeenCalled();
            expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it('debería no permitir iniciar sesión en el sistema (error producido en el servidor)', async () => {
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

            spectator.inject(UserService).logIn.andReturn(Promise.reject(serverError));
            spectator.detectChanges();

            let accountSpy = (spectator.component as any).account;
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect(accountSpy).toBeDefined();
            expect(accountSpy.email).toBeUndefined();
            expect(accountSpy.password).toBeUndefined();
            expect((spectator.component as any).checkValidCredentials()).toBeFalsy();
            expect(spectator.component.logInButtonState()).toBeTruthy();

            (spectator.component as any).account = account;
            spectator.detectChanges();

            accountSpy = (spectator.component as any).account;
            expect(accountSpy).toBeDefined();
            expect(accountSpy.email).toEqual(account.email);
            expect(accountSpy.password).toEqual(account.password);
            expect((spectator.component as any).checkValidCredentials()).toBeTruthy();
            expect(spectator.component.logInButtonState()).toBeFalsy();

            await spectator.component.logIn();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(MessageService).startMessagingConnection).not.toHaveBeenCalled();
            expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });
    });


    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
