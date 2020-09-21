import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { SignupComponent } from './signup.component';

import { SpinnerService } from './../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from './../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';
import { UserService } from './../../shared/services/user/user.service';
import { MessageService } from './../../shared/services/message/message.service';

import { User } from './../../shared/model/user';
import { ExceptionResponse } from './../../shared/model/exception-response';
import { UserStatus } from './../../shared/model/types/user-status';
import { Role } from './../../shared/model/types/role';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el componente `SignupComponent`.
 *
 * @author Robert Ene
 */
describe('SignupComponent', () => {

    let routerNavigateSpy: jasmine.Spy<jasmine.Func>;

    const createSignupComponent = createComponentFactory({
        component: SignupComponent,
        imports: [
            RouterTestingModule
        ],
        mocks: [
            SpinnerService,
            ErrorHandlerService,
            NotificationsService,
            UserService,
            MessageService
        ],
        schemas: [NO_ERRORS_SCHEMA]
    });
    let spectator: Spectator<SignupComponent>;

    let user: User;

    beforeAll(() => {
        user = {
            id: 33, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;
    });

    beforeEach(() => {
        spectator = createSignupComponent();

        routerNavigateSpy = spyOn((spectator.component as any).router, 'navigate');
    });

    it(`debería instanciar el componente (título 'LostPets: Registrarse')`, () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Registrarse');
    });


    describe('sesión existente del usuario', () => {

        it(`debería comprobar la sesión del usuario (cuenta habilitada), inicializar el servicio de
            mensajería y redirigirlo a la pantalla de anuncios de mascotas perdidas`, fakeAsync(() => {
            user.status = UserStatus.ENABLED;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.detectChanges();

            spectator.component.ngOnInit();
            tick(500);

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

            expect(routerNavigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { userStatus: true } });
            expect(spectator.inject(MessageService).startMessagingConnection).not.toHaveBeenCalled();
        }));
    });


    describe('registro del usuario en el sistema', () => {

        it(`debería permitir el registro de usuarios en el sistema (datos válidos,
            correo electrónico único, contraseñas idénticas)`, async () => {
                spectator.inject(UserService).signUp.andReturn(Promise.resolve(user));
                spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.resolve(true));
                spectator.detectChanges();

                let userSpy = (spectator.component as any).user as User;
                expect((spectator.component as any).uniqueEmail).toBeTruthy();
                expect((spectator.component as any).emailRegExp).toBeDefined();
                expect((spectator.component as any).repeatedPassword).toBeUndefined();
                expect(userSpy).toBeDefined();
                expect(userSpy.role).toEqual(Role.USER);
                expect(userSpy.status).toEqual(UserStatus.ENABLED);
                expect((spectator.component as any).checkValidUser()).toBeFalsy();
                expect(spectator.component.signUpButtonState()).toBeTruthy();

                (spectator.component as any).user = user;
                spectator.detectChanges();

                userSpy = (spectator.component as any).user;
                (spectator.component as any).repeatedPassword = user.password;
                await spectator.component.checkUniqueEmail();
                expect((spectator.component as any).uniqueEmail).toBeTruthy();
                expect(userSpy).toBeDefined();
                expect(userSpy.role).toEqual(user.role);
                expect(userSpy.status).toEqual(user.status);
                expect((spectator.component as any).checkValidUser()).toBeTruthy();
                expect(spectator.component.signUpButtonState()).toBeFalsy();

                await spectator.component.signUp();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(UserService).signUp).toHaveBeenCalledWith(user);
                expect(routerNavigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { registered: true } });
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no permitir el registro de usuarios en el sistema (datos inválidos)`, async () => {
            const userSpy = (spectator.component as any).user as User;
            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect((spectator.component as any).repeatedPassword).toBeUndefined();
            expect(userSpy).toBeDefined();
            expect(userSpy.role).toEqual(Role.USER);
            expect(userSpy.status).toEqual(UserStatus.ENABLED);
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            user.firstName = undefined;
            (spectator.component as any).user = user;
            spectator.detectChanges();

            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            await spectator.component.signUp();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no permitir el registro de usuarios en el sistema (correo electrónico inválido)`, async () => {
            user.firstName = 'UserName';

            const userSpy = (spectator.component as any).user as User;
            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect((spectator.component as any).repeatedPassword).toBeUndefined();
            expect(userSpy).toBeDefined();
            expect(userSpy.role).toEqual(Role.USER);
            expect(userSpy.status).toEqual(UserStatus.ENABLED);
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            user.email = 'invalid';
            (spectator.component as any).user = user;
            spectator.detectChanges();
            await spectator.component.checkUniqueEmail();

            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            await spectator.component.signUp();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no permitir el registro de usuarios en el sistema (correo electrónico no único)`, async () => {
            user.email = 'username@email.com';
            spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.resolve(false));

            const userSpy = (spectator.component as any).user as User;
            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect((spectator.component as any).repeatedPassword).toBeUndefined();
            expect(userSpy).toBeDefined();
            expect(userSpy.role).toEqual(Role.USER);
            expect(userSpy.status).toEqual(UserStatus.ENABLED);
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            (spectator.component as any).user = user;
            spectator.detectChanges();
            await spectator.component.checkUniqueEmail();

            expect((spectator.component as any).uniqueEmail).toBeFalsy();
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            await spectator.component.signUp();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no permitir el registro de usuarios en el sistema (contraseñas no idénticas)`, async () => {
            spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.resolve(true));

            const userSpy = (spectator.component as any).user as User;
            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect((spectator.component as any).repeatedPassword).toBeUndefined();
            expect(userSpy).toBeDefined();
            expect(userSpy.role).toEqual(Role.USER);
            expect(userSpy.status).toEqual(UserStatus.ENABLED);
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            (spectator.component as any).user = user;
            (spectator.component as any).repeatedPassword = 'other';
            spectator.detectChanges();
            await spectator.component.checkUniqueEmail();

            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            await spectator.component.signUp();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no permitir el registro de usuarios en el sistema (error producido en el servidor)`, async () => {
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

            spectator.inject(UserService).signUp.andReturn(Promise.reject(serverError));
            spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.resolve(true));
            spectator.detectChanges();

            let userSpy = (spectator.component as any).user as User;
            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect((spectator.component as any).emailRegExp).toBeDefined();
            expect((spectator.component as any).repeatedPassword).toBeUndefined();
            expect(userSpy).toBeDefined();
            expect(userSpy.role).toEqual(Role.USER);
            expect(userSpy.status).toEqual(UserStatus.ENABLED);
            expect((spectator.component as any).checkValidUser()).toBeFalsy();
            expect(spectator.component.signUpButtonState()).toBeTruthy();

            (spectator.component as any).user = user;
            spectator.detectChanges();

            userSpy = (spectator.component as any).user;
            (spectator.component as any).repeatedPassword = user.password;
            await spectator.component.checkUniqueEmail();
            expect((spectator.component as any).uniqueEmail).toBeTruthy();
            expect(userSpy).toBeDefined();
            expect(userSpy.role).toEqual(user.role);
            expect(userSpy.status).toEqual(user.status);
            expect((spectator.component as any).checkValidUser()).toBeTruthy();
            expect(spectator.component.signUpButtonState()).toBeFalsy();

            await spectator.component.signUp();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });
    });


    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
