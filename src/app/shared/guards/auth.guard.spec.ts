import { RouterTestingModule } from '@angular/router/testing';
import { Data } from '@angular/router';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { AuthGuard } from './auth.guard';
import { UserService } from './../services/user/user.service';

import { User } from './../model/user';
import { UserStatus } from './../model/types/user-status';
import { Role } from './../model/types/role';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `AuthGuard`.
 *
 * @author Robert Ene
 */
describe('AuthGuard', () => {

    const createAuthGuard = createServiceFactory({
        service: AuthGuard,
        imports: [
            RouterTestingModule
        ],
        mocks: [
            UserService
        ]
    });
    let spectator: SpectatorService<AuthGuard>;

    let routerState: any;
    let activatedRoute: any;
    let user: User;

    beforeAll(() => {
        user = {
            id: 2020, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        routerState = {
            url: '/ads'
        } as any;

        activatedRoute = {
            data: {
                roles: [Role.USER, Role.ADMIN]
            } as Data
        } as any;
    });

    beforeEach(() => {
        spectator = createAuthGuard();
    });

    it('debería instanciar el servicio de guardia (autenticación y autorización)', () => {
        expect(spectator).toBeTruthy();
    });

    it('debería permitir la navegación (usuario autenticado, con la cuenta habilitada)', async () => {
        const routerSpy = spyOn((spectator.service as any).router, 'navigate');
        spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
        spectator.inject(UserService).isUserLoggedIn.andReturn(true);

        const canActivate = await spectator.service.canActivate(activatedRoute, routerState);

        expect(canActivate).toBeTruthy();
        expect(routerSpy).not.toHaveBeenCalled();
    });

    it(`debería no permitir la navegación (usuario autenticado, con la cuenta inhabilitada)
        y redirigir a la pantalla que permite iniciar sesión en el sistema`, async () => {
            user.status = UserStatus.DISABLED;
            const routerSpy = spyOn((spectator.service as any).router, 'navigate');
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(UserService).isUserLoggedIn.andReturn(true);

            const canActivate = await spectator.service.canActivate(activatedRoute, routerState);

            expect(canActivate).toBeFalsy();
            expect(routerSpy).toHaveBeenCalledWith(['/login'], { queryParams: { userStatus: true } });
        });

    it(`debería no permitir la navegación (usuario autenticado, con la cuenta habilitada,
        con un rol no permitido) y redirigir a la pantalla que permite iniciar sesión en el sistema`, async () => {
            user.status = UserStatus.ENABLED;
            user.role = 'INEXISTENTE' as any;
            const routerSpy = spyOn((spectator.service as any).router, 'navigate');
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(UserService).isUserLoggedIn.andReturn(true);

            const canActivate = await spectator.service.canActivate(activatedRoute, routerState);

            expect(canActivate).toBeFalsy();
            expect(routerSpy).toHaveBeenCalledWith(['/login'], { queryParams: { roleNotAllowed: true } });
        });

    it(`debería no permitir la navegación (usuario no autenticado) y redirigir
        a la pantalla que permite iniciar sesión en el sistema`, async () => {
            const routerSpy = spyOn((spectator.service as any).router, 'navigate');
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(UserService).isUserLoggedIn.andReturn(false);

            const canActivate = await spectator.service.canActivate(activatedRoute, routerState);

            expect(canActivate).toBeFalsy();
            expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
            expect(routerSpy).toHaveBeenCalledWith(['/']);
        });

    it(`debería no permitir la navegación (roles de la ruta inválidos) y redirigir
        a la pantalla que permite iniciar sesión en el sistema`, async () => {
            const routerSpy = spyOn((spectator.service as any).router, 'navigate');
            const invalidActivatedRoute = {
                data: {} as Data
            } as any;

            const canActivate = await spectator.service.canActivate(invalidActivatedRoute, routerState);

            expect(canActivate).toBeFalsy();
            expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
            expect(routerSpy).toHaveBeenCalledWith(['/']);
        });

    it(`debería no permitir la navegación (datos de la ruta inválidos) y redirigir
        a la pantalla que permite iniciar sesión en el sistema`, async () => {
            const routerSpy = spyOn((spectator.service as any).router, 'navigate');
            const invalidActivatedRoute = {} as any;

            const canActivate = await spectator.service.canActivate(invalidActivatedRoute, routerState);

            expect(canActivate).toBeFalsy();
            expect(spectator.inject(UserService).logOut).toHaveBeenCalled();
            expect(routerSpy).toHaveBeenCalledWith(['/']);
        });
});
