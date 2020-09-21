import { createHttpFactory, SpectatorHttp, HttpMethod } from '@ngneat/spectator';

import * as CryptoJS from 'crypto-js';

import { UserService } from './user.service';

import { User } from '../../model/user';
import { AccountCredentials } from './../../model/account-credentials';
import { Role } from '../../model/types/role';
import { UserStatus } from '../../model/types/user-status';

import { apiUrlUser } from './../../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `UserService`.
 *
 * @author Robert Ene
 */
describe('UserService', () => {

    const createUserService = createHttpFactory(UserService);
    let spectator: SpectatorHttp<UserService>;

    let localStorageMock: any;
    let token: string;
    let user: User;
    let users: User[];

    beforeAll(() => {

        user = {
            id: 101, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        users = [];
        users.push(user);
        users.push({
            id: 111, email: 'user111@email.com',
            password: 'user111', role: Role.ADMIN,
            status: UserStatus.ENABLED, phone: '618503711',
            firstName: 'UserName111', lastName: 'LastName111'
        } as User);

        token = 'eyJhbGciOiJIUzI1NiJ9' +
            '.eyJzdWIiOiJqb3NlQGVtYWlsLmNvbSIsImV4cCI6MTY4NjEwMTg5NCwicm9sZSI6IlVTRVIifQ' +
            '.BdAf2obyEm0pZOE_IQkZ7B2afQPiTCpBTGZTl-wEp90';

        localStorageMock = {};
        localStorageMock.token = JSON.stringify(token);

        const encodedUser = CryptoJS.AES.encrypt(JSON.stringify(user), localStorageMock.token);
        localStorageMock.user = JSON.stringify(encodedUser.toString());

        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            return localStorageMock[key];
        });

        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            return localStorageMock[key] = value;
        });

        spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
            return delete localStorageMock[key];
        });
    });

    beforeEach(() => {
        spectator = createUserService();
    });

    it('debería instanciar el servicio', () => {
        expect(spectator.service).toBeTruthy();
    });

    describe('sesión del usuario', () => {

        let checkUserStatusSpy: jasmine.Spy;

        beforeEach(() => {
            checkUserStatusSpy = spyOn(spectator.service, 'checkUserStatus');
        });

        it('debería recuperar la sesión existente del usuario (habilitado)', async () => {
            user.status = UserStatus.ENABLED;
            checkUserStatusSpy.and.returnValue(Promise.resolve(user.status));

            await Promise.resolve();

            expect(user.status).toEqual(UserStatus.ENABLED);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(localStorage.getItem).toHaveBeenCalledWith('user');
        });

        it('debería recuperar la sesión existente del usuario (deshabilitado)', async () => {
            user.status = UserStatus.DISABLED;
            checkUserStatusSpy.and.returnValue(Promise.resolve(user.status));

            await Promise.resolve();

            expect(user.status).toEqual(UserStatus.DISABLED);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(localStorage.getItem).toHaveBeenCalledWith('user');
        });

        it('debería cerrar la sesión existente del usuario', async () => {
            user.status = UserStatus.ENABLED;
            checkUserStatusSpy.and.returnValue(Promise.resolve(user.status));

            spectator.service.logOut();

            expect((spectator.service as any).user).toBeUndefined();
            expect(localStorage.removeItem).toHaveBeenCalledWith('token');
            expect(localStorage.removeItem).toHaveBeenCalledWith('user');
        });
    });


    it('debería recuperar todos los usuarios del sistema', async () => {
        const usersPromise = spectator.service.getUsers();

        spectator.expectOne(`${apiUrlUser}`, HttpMethod.GET).flush(users);
        expect(await usersPromise).toEqual(users);
    });

    it('debería recuperar todos los usuarios (vacío) del sistema', async () => {
        const usersPromise = spectator.service.getUsers();

        spectator.expectOne(`${apiUrlUser}`, HttpMethod.GET).flush([]);
        expect(await usersPromise).toEqual([]);
    });

    it('debería recuperar un determinado usuario dado su id', async () => {
        const userPromise = spectator.service.getUserById(user.id);

        spectator.expectOne(`${apiUrlUser}/${user.id}`, HttpMethod.GET).flush(user);
        expect(await userPromise).toEqual(user);
    });

    it('debería recuperar un determinado usuario (vacío) dado su id', async () => {
        const userPromise = spectator.service.getUserById(user.id);

        spectator.expectOne(`${apiUrlUser}/${user.id}`, HttpMethod.GET).flush({} as User);
        expect(await userPromise).toEqual({} as User);
    });

    it('debería comprobar que un determinado email es único en el sistema', async () => {
        const checkUniqueEmailPromise = spectator.service.checkUniqueEmail(user.email);

        const url = `${apiUrlUser}/uniqueEmail?email=${user.email}`;
        const testRequest = spectator.expectOne(url, HttpMethod.GET);
        testRequest.flush(1);

        expect(testRequest.request.params.get('email')).toEqual(user.email);
        expect(testRequest.request.body).toBeNull();
        expect(await checkUniqueEmailPromise).toBeTruthy();
    });

    it('debería comprobar que un determinado email no es único en el sistema', async () => {
        const checkUniqueEmailPromise = spectator.service.checkUniqueEmail(user.email);

        const url = `${apiUrlUser}/uniqueEmail?email=${user.email}`;
        const testRequest = spectator.expectOne(url, HttpMethod.GET);
        testRequest.flush(0);

        expect(testRequest.request.params.get('email')).toEqual(user.email);
        expect(testRequest.request.body).toBeNull();
        expect(await checkUniqueEmailPromise).toBeFalsy();
    });

    it('debería comprobar el estado de la cuenta de un determinado usuario en el sistema dado su email', async () => {
        const checkUserStatusPromise = spectator.service.checkUserStatus(user.email);

        const url = `${apiUrlUser}/userStatus?email=${user.email}`;
        const testRequest = spectator.expectOne(url, HttpMethod.GET);
        testRequest.flush(UserStatus.ENABLED);

        expect(testRequest.request.params.get('email')).toEqual(user.email);
        expect(testRequest.request.body).toBeNull();
        expect(await checkUserStatusPromise).toEqual(UserStatus.ENABLED);
    });

    it('debería registrar un determinado usuario en el sistema si los datos proporcionados son válidos', async () => {
        const signUpPromise = spectator.service.signUp(user);

        const url = `${apiUrlUser}/userStatus?email=${user.email}`;
        const testRequest = spectator.expectOne(apiUrlUser, HttpMethod.POST);
        testRequest.flush(user);

        expect(testRequest.request.headers.get('Content-Type')).toEqual('application/json');
        expect(testRequest.request.body).toEqual(JSON.stringify(user));
        expect(await signUpPromise).toEqual(user);
    });

    it('debería actualizar los datos de un determinado usuario en el sistema', async () => {
        const updateUserPromise = spectator.service.updateUser(user);

        const testRequest = spectator.expectOne(apiUrlUser, HttpMethod.PUT);
        testRequest.flush(user);

        expect(testRequest.request.headers.get('Content-Type')).toEqual('application/json');
        expect(testRequest.request.body).toEqual(JSON.stringify(user));
        expect(await updateUserPromise).toEqual(user);
    });

    it('debería actualizar los datos de un determinado usuario en el sistema', async () => {
        const updateUserPromise = spectator.service.updateUser(user);

        const testRequest = spectator.expectOne(apiUrlUser, HttpMethod.PUT);
        testRequest.flush(user);

        expect(testRequest.request.headers.get('Content-Type')).toEqual('application/json');
        expect(testRequest.request.body).toEqual(JSON.stringify(user));
        expect(await updateUserPromise).toEqual(user);
    });

    it('debería guardar el estado de la cuenta de un usuario modificado por el administrador', async () => {
        const updateUserStatusPromise = spectator.service
            .updateUserStatus(user.email, UserStatus.DISABLED);

        const url = `${apiUrlUser}/userStatus?email=${user.email}&status=${UserStatus.DISABLED}`;
        const testRequest = spectator.expectOne(url, HttpMethod.PUT);
        testRequest.flush(1);

        expect(testRequest.request.params.get('email')).toEqual(user.email);
        expect(testRequest.request.params.get('status')).toEqual(UserStatus.DISABLED);
        expect(testRequest.request.body).toBeNull();
        expect(await updateUserStatusPromise).toBeTruthy();
    });

    it('debería no guardar el estado de la cuenta de un usuario modificado por el administrador', async () => {
        const updateUserStatusPromise = spectator.service
            .updateUserStatus(user.email, UserStatus.ENABLED);

        const url = `${apiUrlUser}/userStatus?email=${user.email}&status=${UserStatus.ENABLED}`;
        const testRequest = spectator.expectOne(url, HttpMethod.PUT);
        testRequest.flush(0);

        expect(testRequest.request.params.get('email')).toEqual(user.email);
        expect(testRequest.request.params.get('status')).toEqual(UserStatus.ENABLED);
        expect(testRequest.request.body).toBeNull();
        expect(await updateUserStatusPromise).toBeFalsy();
    });

    it('debería comprobar que una determinada contraseña es válida en el sistema para una cuenta de usuario', async () => {
        const account = {
            email: user.email,
            password: user.password
        } as AccountCredentials;

        const checkValidUserPasswordPromise = spectator.service.checkValidUserPassword(account);

        const url = `${apiUrlUser}/validPassword`;
        const testRequest = spectator.expectOne(url, HttpMethod.POST);
        testRequest.flush(1);

        expect(testRequest.request.headers.get('Content-Type')).toEqual('application/json');
        expect(testRequest.request.body).toEqual(JSON.stringify(account));
        expect(await checkValidUserPasswordPromise).toBeTruthy();
    });

    it('debería comprobar que una determinada contraseña es inválida en el sistema para una cuenta de usuario', async () => {
        const account = {
            email: user.email,
            password: user.password
        } as AccountCredentials;

        const checkValidUserPasswordPromise = spectator.service.checkValidUserPassword(account);

        const url = `${apiUrlUser}/validPassword`;
        const testRequest = spectator.expectOne(url, HttpMethod.POST);
        testRequest.flush(0);

        expect(testRequest.request.headers.get('Content-Type')).toEqual('application/json');
        expect(testRequest.request.body).toEqual(JSON.stringify(account));
        expect(await checkValidUserPasswordPromise).toBeFalsy();
    });


    describe('inicio de sesión en el sistema', () => {

        it('debería iniciar sesión correctamente en el sistema (credenciales correctas)', async () => {
            const account = {
                email: user.email,
                password: user.password
            } as AccountCredentials;

            const logInPromise = spectator.service.logIn(account);

            const urlLogIn = `${apiUrlUser}/logIn`;
            const testRequestLogIn = spectator.expectOne(urlLogIn, HttpMethod.POST);
            testRequestLogIn.flush('', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            await Promise.resolve();
            expect(testRequestLogIn.request.body).toEqual(JSON.stringify(account));
            expect(localStorage.setItem).toHaveBeenCalledWith('token', `"Bearer ${token}"`);

            const urlUserDetails = `${apiUrlUser}/userDetails?email=${user.email}`;
            const testRequestUserDetails = spectator.expectOne(urlUserDetails, HttpMethod.GET);
            testRequestUserDetails.flush(user);

            await Promise.resolve();
            expect(testRequestUserDetails.request.body).toBeNull();
            expect(testRequestUserDetails.request.params.get('email')).toEqual(user.email);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(localStorage.setItem).toHaveBeenCalledTimes(2);
            expect(await logInPromise).toBeUndefined();
        });

        it('debería iniciar sesión correctamente en el sistema (credenciales incorrectas)', async () => {
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
            const account = {
                email: 'email',
                password: 'password'
            } as AccountCredentials;
            const error = new Error(JSON.stringify({
                summary: 'Iniciar Sesión',
                detail: '¡Correo electrónico o contraseña inválidos!'
            }));

            const logInPromise = spectator.service.logIn(account);

            const urlLogIn = `${apiUrlUser}/logIn`;
            const testRequestLogIn = spectator.expectOne(urlLogIn, HttpMethod.POST);
            testRequestLogIn.flush('');

            expect(testRequestLogIn.request.body).toEqual(JSON.stringify(account));
            await logInPromise.catch((err: Error) => {
                expect(err).toEqual(error);
            });
        });

        it(`debería no guardar la sesión del usuario en el navegador si no
            se ha recibido un token JWT válido desde el servidor`, async () => {
                spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
                spyOn(spectator.service, 'getToken').and.returnValue(undefined);

                const saveUserToLocalStoragePromise = spectator.service.saveUserToLocalStorage(user);

                expect(localStorage.setItem).toHaveBeenCalledTimes(2);
                expect(await saveUserToLocalStoragePromise).toBeUndefined();
            });

        it('debería actualizar los datos del navegador del usuario en sesión', () => {
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
            spyOn(spectator.service, 'saveUserToLocalStorage');

            spectator.service.updateLoggedUser(user);

            expect((spectator.service as any).user).toEqual(user);
            expect(spectator.service.saveUserToLocalStorage).toHaveBeenCalledWith(user);
            expect(localStorage.setItem).toHaveBeenCalledTimes(2);
        });

        it('debería cargar desde el navegador y devolver los datos del usuario en sesión (asíncrono)', async () => {
            spyOn((spectator.service as any), 'loadUserFromLocalStorage')
                .and.returnValue(Promise.resolve(user));
            spyOn(spectator.service, 'checkUserStatus')
                .and.returnValue(Promise.resolve(UserStatus.ENABLED));
            (spectator.service as any).user = undefined;

            const loggedUserPromise = spectator.service.getLoggedUser();

            expect(await loggedUserPromise).toEqual(user);
        });

        it('debería cargar desde el navegador y devolver los datos (inválidos) del usuario en sesión (asíncrono)', async () => {
            spyOn((spectator.service as any), 'loadUserFromLocalStorage')
                .and.returnValue(Promise.resolve(undefined));
            spyOn(spectator.service, 'checkUserStatus')
                .and.returnValue(Promise.resolve(UserStatus.ENABLED));
            (spectator.service as any).user = undefined;

            const loggedUserPromise = spectator.service.getLoggedUser();

            expect(await loggedUserPromise).toBeUndefined();
        });

        it('debería devolver los datos del usuario en sesión (asíncrono) y comprobar el estado de su cuenta', async () => {
            spyOn((spectator.service as any), 'loadUserFromLocalStorage')
                .and.returnValue(Promise.resolve(user));
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(UserStatus.ENABLED));
            (spectator.service as any).user = user;

            const loggedUserPromise = spectator.service.getLoggedUser();

            expect((spectator.service as any).user.status).toEqual(UserStatus.ENABLED);
            expect(await loggedUserPromise).toEqual(user);
        });

        it('debería devolver los datos del usuario en sesión (síncrono)', () => {
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
            (spectator.service as any).user = user;

            const loggedUser = spectator.service.getLoggedUserSync();

            expect(loggedUser).toEqual(user);
            expect(localStorage.setItem).toHaveBeenCalledTimes(2);
        });

        it('debería comprobar que el token JWT asociado a la sesión de un determinado usuario no ha caducado', () => {
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
            spyOn(spectator.service, 'getToken').and.returnValue(localStorageMock.token);

            const isTokenExpired = spectator.service.isTokenExpired();

            expect(isTokenExpired).toBeFalsy();
        });

        it('debería comprobar que el token JWT asociado a la sesión de un determinado usuario ha caducado', () => {
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
            const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiJ9' +
                '.eyJzdWIiOiJqb3NlQGVtYWlsLmNvbSIsImV4cCI6MTQ4NjEwMTg5NCwicm9sZSI6IlVTRVIifQ' +
                '.e_SBLTZ9_wTJrMsZWWhi37Yo1TbofyyrudVowbuXeCQ';
            spyOn(spectator.service, 'getToken').and.returnValue(JSON.stringify(expiredToken));

            const isTokenExpired = spectator.service.isTokenExpired();

            expect(isTokenExpired).toBeTruthy();
        });

        it('debería comprobar que el usuario autenticado en el navegador tiene una sesión válida', () => {
            (spectator.service as any).user = user;
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
            spyOn(spectator.service, 'getToken').and.returnValue(localStorageMock.token);

            const isUserLoggedIn = spectator.service.isUserLoggedIn();

            expect(isUserLoggedIn).toBeTruthy();
        });

        it('debería comprobar que el usuario autenticado en el navegador tiene una sesión inválida', () => {
            spyOn(spectator.service, 'checkUserStatus').and.returnValue(Promise.resolve(user.status));
            const getTokensSpy = spyOn(spectator.service, 'getToken');
            getTokensSpy.and.returnValue(localStorageMock.token);

            let isUserLoggedIn = spectator.service.isUserLoggedIn();

            expect(isUserLoggedIn).toBeFalsy();

            (spectator.service as any).user = user;
            getTokensSpy.and.returnValue(undefined);

            isUserLoggedIn = spectator.service.isUserLoggedIn();

            expect(isUserLoggedIn).toBeFalsy();

            (spectator.service as any).user = user;
            const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiJ9' +
                '.eyJzdWIiOiJqb3NlQGVtYWlsLmNvbSIsImV4cCI6MTQ4NjEwMTg5NCwicm9sZSI6IlVTRVIifQ' +
                '.e_SBLTZ9_wTJrMsZWWhi37Yo1TbofyyrudVowbuXeCQ';
            getTokensSpy.and.returnValue(expiredToken);

            isUserLoggedIn = spectator.service.isUserLoggedIn();

            expect(isUserLoggedIn).toBeFalsy();
        });
    });

    afterEach(() => {
        spectator.controller.verify();
    });
});
