import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Params } from '@angular/router';
import { Subject } from 'rxjs';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { UserProfileComponent } from './user-profile.component';

import { SpinnerService } from './../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from './../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';
import { UserService } from './../../shared/services/user/user.service';

import { User } from './../../shared/model/user';
import { ExceptionResponse } from './../../shared/model/exception-response';
import { UserStatus } from './../../shared/model/types/user-status';
import { Role } from './../../shared/model/types/role';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el componente `UserProfileComponent`.
 *
 * @author Robert Ene
 */
describe('UserProfileComponent', () => {

    let routerNavigateSpy: jasmine.Spy<jasmine.Func>;

    const createUserProfileComponent = createComponentFactory({
        component: UserProfileComponent,
        imports: [
            RouterTestingModule
        ],
        providers: [
            SpinnerService
        ],
        mocks: [
            SpinnerService,
            ErrorHandlerService,
            NotificationsService,
            UserService
        ],
        schemas: [NO_ERRORS_SCHEMA]
    });
    let spectator: Spectator<UserProfileComponent>;

    let originalUser: User;
    let user: User;

    beforeAll(() => {
        originalUser = {
            id: 44, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;
    });

    beforeEach(() => {
        spectator = createUserProfileComponent();

        routerNavigateSpy = spyOn((spectator.component as any).router, 'navigate');

        user = {
            id: 44, email: 'user111@email.com',
            password: 'user111', role: Role.USER,
            status: UserStatus.ENABLED, phone: '618503711',
            firstName: 'UserName111', lastName: 'LastName111'
        } as User;
    });

    it(`debería instanciar el componente (título 'LostPets: Mi Perfil')`, async () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Mi Perfil');
    });


    describe('modificación de los datos personales de la cuenta del usuario', () => {

        it(`debería permitir la modificación de los datos personales de la cuenta del usuario (datos
            válidos, correo electrónico anterior, contraseña anterior, contraseñas idénticas)`, async () => {
                const queryParamsMock = new Subject<Params>();
                (spectator.component as any).route = {
                    queryParams: queryParamsMock.asObservable()
                };
                spectator.inject(UserService).checkValidUserPassword.andReturn(Promise.resolve(true));
                spectator.inject(UserService).updateUser.andReturn(Promise.resolve(user));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(originalUser));

                await spectator.component.ngOnInit();
                queryParamsMock.next({ from: '/ads' });

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.emailRegExp).toBeDefined();
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.account).toBeDefined();
                expect(componentSpy.account.email).toEqual(originalUser.email);
                expect(componentSpy.validOldPassowrd).toBeUndefined();
                expect(componentSpy.repeatedPassword).toBeUndefined();
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                user.email = originalUser.email;
                user.password = originalUser.password;
                (spectator.component as any).user = user;
                (spectator.component as any).account.password = originalUser.password;
                (spectator.component as any).repeatedPassword = user.password;
                spectator.detectChanges();

                await spectator.component.checkUniqueEmail();
                await spectator.component.checkOldPassword();

                componentSpy = spectator.component as any;
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.validOldPassword).toBeTruthy();
                expect(componentSpy.repeatedPassword).toEqual(originalUser.password);
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).not.toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeTruthy();
                expect(spectator.component.updateUserButtonState()).toBeFalsy();

                await spectator.component.updateUser();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(UserService).updateLoggedUser).toHaveBeenCalledWith(user);
                expect(routerNavigateSpy).toHaveBeenCalledWith(['/ads'], { queryParams: { updatedUserProfile: true } });
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no permitir la modificación de los datos personales de
                la cuenta del usuario (datos inválidos)`, async () => {
                spectator.inject(UserService).checkValidUserPassword.andReturn(Promise.resolve(false));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(originalUser));

                await spectator.component.ngOnInit();

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.emailRegExp).toBeDefined();
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.account).toBeDefined();
                expect(componentSpy.account.email).toEqual(originalUser.email);
                expect(componentSpy.validOldPassowrd).toBeUndefined();
                expect(componentSpy.repeatedPassword).toBeUndefined();
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                user.email = originalUser.email;
                user.phone = undefined;
                user.password = undefined;
                (spectator.component as any).user = user;
                (spectator.component as any).account.password = user.password;
                (spectator.component as any).repeatedPassword = user.password;
                spectator.detectChanges();

                await spectator.component.checkUniqueEmail();
                await spectator.component.checkOldPassword();

                componentSpy = spectator.component as any;
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.validOldPassword).toBeFalsy();
                expect(componentSpy.repeatedPassword).toEqual(user.password);
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).not.toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();

                await spectator.component.updateUser();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
                expect(spectator.inject(UserService).updateLoggedUser).not.toHaveBeenCalled();
                expect(routerNavigateSpy).not.toHaveBeenCalled();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no permitir la modificación de los datos personales de
                la cuenta del usuario (correo electrónico inválido)`, async () => {
                spectator.inject(UserService).checkValidUserPassword.andReturn(Promise.resolve(true));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(originalUser));

                await spectator.component.ngOnInit();

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.emailRegExp).toBeDefined();
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.account).toBeDefined();
                expect(componentSpy.account.email).toEqual(originalUser.email);
                expect(componentSpy.validOldPassowrd).toBeUndefined();
                expect(componentSpy.repeatedPassword).toBeUndefined();
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                user.email = 'invalid';
                user.password = originalUser.password;
                (spectator.component as any).user = user;
                (spectator.component as any).account.password = originalUser.password;
                (spectator.component as any).repeatedPassword = user.password;
                spectator.detectChanges();

                await spectator.component.checkUniqueEmail();
                await spectator.component.checkOldPassword();

                componentSpy = spectator.component as any;
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.validOldPassword).toBeTruthy();
                expect(componentSpy.repeatedPassword).toEqual(user.password);
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).not.toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();

                await spectator.component.updateUser();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
                expect(spectator.inject(UserService).updateLoggedUser).not.toHaveBeenCalled();
                expect(routerNavigateSpy).not.toHaveBeenCalled();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no permitir la modificación de los datos personales de
                la cuenta del usuario (correo electrónico diferente, pero no único)`, async () => {
                spectator.inject(UserService).checkValidUserPassword.andReturn(Promise.resolve(true));
                spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.resolve(false));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(originalUser));

                await spectator.component.ngOnInit();

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.emailRegExp).toBeDefined();
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.account).toBeDefined();
                expect(componentSpy.account.email).toEqual(originalUser.email);
                expect(componentSpy.validOldPassowrd).toBeUndefined();
                expect(componentSpy.repeatedPassword).toBeUndefined();
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                (spectator.component as any).user = user;
                (spectator.component as any).account.password = originalUser.password;
                (spectator.component as any).repeatedPassword = user.password;
                spectator.detectChanges();

                await spectator.component.checkUniqueEmail();
                await spectator.component.checkOldPassword();

                componentSpy = spectator.component as any;
                expect(componentSpy.uniqueEmail).toBeFalsy();
                expect(componentSpy.validOldPassword).toBeTruthy();
                expect(componentSpy.repeatedPassword).toEqual(user.password);
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).not.toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();

                await spectator.component.updateUser();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
                expect(spectator.inject(UserService).updateLoggedUser).not.toHaveBeenCalled();
                expect(routerNavigateSpy).not.toHaveBeenCalled();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no permitir la modificación de los datos personales de
                la cuenta del usuario (contraseña anterior inválida, contraseñas no idénticas)`, async () => {
                spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.resolve(true));
                spectator.inject(UserService).checkValidUserPassword.andReturn(Promise.resolve(false));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(originalUser));

                await spectator.component.ngOnInit();

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.emailRegExp).toBeDefined();
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.account).toBeDefined();
                expect(componentSpy.account.email).toEqual(originalUser.email);
                expect(componentSpy.validOldPassowrd).toBeUndefined();
                expect(componentSpy.repeatedPassword).toBeUndefined();
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                (spectator.component as any).user = user;
                (spectator.component as any).account.password = originalUser.password;
                (spectator.component as any).repeatedPassword = 'Invalid';
                spectator.detectChanges();

                await spectator.component.checkUniqueEmail();
                await spectator.component.checkOldPassword();

                componentSpy = spectator.component as any;
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.validOldPassword).toBeFalsy();
                expect(componentSpy.repeatedPassword).not.toEqual(componentSpy.account.password);
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).not.toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();

                await spectator.component.updateUser();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
                expect(spectator.inject(UserService).updateLoggedUser).not.toHaveBeenCalled();
                expect(routerNavigateSpy).not.toHaveBeenCalled();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no permitir la modificación de los datos personales de
                la cuenta del usuario (errores prducidos en el servidor)`, async () => {
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

                spectator.inject(UserService).updateUser.andReturn(Promise.reject(serverError));
                spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.reject(serverError));
                spectator.inject(UserService).checkValidUserPassword.andReturn(Promise.reject(serverError));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(originalUser));

                await spectator.component.ngOnInit();

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.emailRegExp).toBeDefined();
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.account).toBeDefined();
                expect(componentSpy.account.email).toEqual(originalUser.email);
                expect(componentSpy.validOldPassowrd).toBeUndefined();
                expect(componentSpy.repeatedPassword).toBeUndefined();
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeFalsy();
                expect(spectator.component.updateUserButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                user.password = originalUser.password;
                (spectator.component as any).user = user;
                (spectator.component as any).account.password = originalUser.password;
                (spectator.component as any).repeatedPassword = user.password;
                spectator.detectChanges();

                await spectator.component.checkUniqueEmail();
                await spectator.component.checkOldPassword();

                expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);

                user.email = originalUser.email;
                user.password = originalUser.password;
                (spectator.component as any).user = user;
                spectator.inject(UserService).checkUniqueEmail.andReturn(Promise.resolve(true));
                spectator.inject(UserService).checkValidUserPassword.andReturn(Promise.resolve(true));
                spectator.detectChanges();

                await spectator.component.checkUniqueEmail();
                await spectator.component.checkOldPassword();

                componentSpy = spectator.component as any;
                expect(componentSpy.uniqueEmail).toBeTruthy();
                expect(componentSpy.validOldPassword).toBeTruthy();
                expect(componentSpy.repeatedPassword).toEqual(componentSpy.account.password);
                expect(componentSpy.originalUser).toEqual(originalUser);
                expect(componentSpy.user).not.toEqual(originalUser);
                expect(componentSpy.checkValidUser()).toBeTruthy();
                expect(spectator.component.updateUserButtonState()).toBeFalsy();

                await spectator.component.updateUser();

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
