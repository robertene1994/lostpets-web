import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { JwPaginationComponent } from 'jw-angular-pagination';

import { UsersComponent } from './users.component';

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
 * para el componente `UsersComponent`.
 *
 * @author Robert Ene
 */
describe('UsersComponent', () => {

    const createUsersComponent = createComponentFactory({
        component: UsersComponent,
        declarations: [
            JwPaginationComponent
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
    let spectator: Spectator<UsersComponent>;

    let paginatorMock: any[];
    let users: User[];

    beforeEach((() => {
        spectator = createUsersComponent();

        users = [];
        users.push({
            id: 33, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User);
        users.push({
            id: 111, email: 'user111@email.com',
            password: 'user111', role: Role.ADMIN,
            status: UserStatus.DISABLED, phone: '618503711',
            firstName: 'UserName111', lastName: 'LastName111'
        } as User);

        const firstItem = document.createElement('li');
        firstItem.appendChild(document.createElement('a'));
        const previousItem = document.createElement('li');
        previousItem.appendChild(document.createElement('a'));
        const nextItem = document.createElement('li');
        nextItem.appendChild(document.createElement('a'));
        const lastItem = document.createElement('li');
        lastItem.appendChild(document.createElement('a'));
        paginatorMock = [firstItem, previousItem, nextItem, lastItem] as any;
    }));

    it(`debería instanciar el componente (título 'LostPets: Anuncios')`, async () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Usuarios');
    });

    describe('recuperación de todos los usuarios del sistema', () => {

        it(`debería recuperar todos los usuarios del sistema y preparar la
            lista para mostrarlos (habilitado/inhabilitado)`, async () => {
                spectator.inject(UserService).getUsers.andReturn(Promise.resolve(users));

                await spectator.component.ngOnInit();

                const component = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(component.users).toEqual(users);
                component.users.forEach((user: any) => {
                    expect(user.statusBoolean).toEqual(user.status === UserStatus.ENABLED);
                });
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });


        it(`debería no recuperar los usuarios del sistema (error producido en el servidor)`, async () => {
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
            spectator.inject(UserService).getUsers.andReturn(Promise.reject(serverError));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.users).toBeUndefined();
            expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });
    });


    describe('paginación de todos los usuarios del sistema', () => {

        it(`debería paginar los usuarios`, async () => {
            const getElementsByClassNameSpy = spyOn(document, 'getElementsByClassName');
            const checkPaginationComponentSpy = spyOn((spectator.component as any), 'checkPaginationComponent');
            checkPaginationComponentSpy.and.callThrough();

            getElementsByClassNameSpy.withArgs('page-item first-item').and.returnValue([paginatorMock[0]] as any);
            getElementsByClassNameSpy.withArgs('page-item previous-item').and.returnValue([paginatorMock[1]] as any);
            getElementsByClassNameSpy.withArgs('page-item next-item').and.returnValue([paginatorMock[2]] as any);
            getElementsByClassNameSpy.withArgs('page-item last-item').and.returnValue([paginatorMock[3]] as any);

            spectator.inject(UserService).getUsers.andReturn(Promise.resolve(users));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.users).toEqual(users);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

            spectator.component.onChangePage(users);

            expect((spectator.component as any).pageOfUsers).toEqual(users);
            expect(checkPaginationComponentSpy).toHaveBeenCalled();
            expect(getElementsByClassNameSpy).toHaveBeenCalledTimes(4);
            expect(paginatorMock.map(element => element.firstChild.textContent))
                .toEqual(['Primero', 'Anterior', 'Siguiente', 'Último']);
        });

        it(`debería paginar los usuarios (vacío)`, async () => {
            const getElementsByClassNameSpy = spyOn(document, 'getElementsByClassName');
            const checkPaginationComponentSpy = spyOn((spectator.component as any), 'checkPaginationComponent');
            checkPaginationComponentSpy.and.callThrough();

            getElementsByClassNameSpy.withArgs('page-item first-item').and.returnValue([paginatorMock[0]] as any);
            getElementsByClassNameSpy.withArgs('page-item previous-item').and.returnValue([paginatorMock[1]] as any);
            getElementsByClassNameSpy.withArgs('page-item next-item').and.returnValue([paginatorMock[2]] as any);
            getElementsByClassNameSpy.withArgs('page-item last-item').and.returnValue([paginatorMock[3]] as any);

            spectator.inject(UserService).getUsers.andReturn(Promise.resolve([]));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.users).toEqual([]);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

            spectator.component.onChangePage([]);

            expect((spectator.component as any).pageOfUsers).toEqual([]);
            expect(checkPaginationComponentSpy).toHaveBeenCalled();
            expect(getElementsByClassNameSpy).not.toHaveBeenCalled();
            paginatorMock.forEach(element => {
                expect(element.firstChild.textContent).toEqual('');
            });
        });
    });


    describe('actualización del estado de la cuenta de un determinado usuario', () => {

        it('debería habilitar la cuenta de un determinado usuario', async () => {
            users[0].status = UserStatus.DISABLED;
            spectator.inject(UserService).getUsers.andReturn(Promise.resolve(users));
            spectator.inject(UserService).updateUserStatus.andReturn(Promise.resolve(true));

            await spectator.component.ngOnInit();
            await spectator.component.updateUserStatus(users[0]);

            const component = spectator.component as any;
            expect(component.users[0].status).toEqual(UserStatus.ENABLED);
            expect(spectator.inject(UserService).updateUserStatus)
                .toHaveBeenCalledWith(users[0].email, UserStatus.ENABLED);
            expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();
        });

        it('debería inhabilitar la cuenta de un determinado usuario', async () => {
            users[0].status = UserStatus.DISABLED;
            spectator.inject(UserService).getUsers.andReturn(Promise.resolve(users));
            spectator.inject(UserService).updateUserStatus.andReturn(Promise.resolve(true));

            await spectator.component.ngOnInit();
            await spectator.component.updateUserStatus(users[0]);

            const component = spectator.component as any;
            expect(component.users[0].status).toEqual(UserStatus.ENABLED);
            expect(spectator.inject(UserService).updateUserStatus)
                .toHaveBeenCalledWith(users[0].email, UserStatus.ENABLED);
            expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();
        });

        it('debería no modificar el estado de la cuenta de un determinado usuario (error producido en el servidor)', async () => {
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
            spectator.inject(UserService).getUsers.andReturn(Promise.resolve(users));
            spectator.inject(UserService).updateUserStatus.andReturn(Promise.reject(serverError));

            await spectator.component.ngOnInit();
            await spectator.component.updateUserStatus(users[0]);

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
            expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
