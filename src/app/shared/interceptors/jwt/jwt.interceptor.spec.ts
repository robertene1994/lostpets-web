import { RouterTestingModule } from '@angular/router/testing';
import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { JwtInterceptor } from './jwt.interceptor';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { UserService } from '../../services/user/user.service';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `JwtInterceptor`.
 *
 * @author Robert Ene
 */
describe('JwtInterceptor', () => {

    const createJwtInterceptor = createServiceFactory({
        service: JwtInterceptor,
        imports: [
            RouterTestingModule
        ],
        mocks: [
            NotificationsService,
            UserService
        ]
    });
    let spectator: SpectatorService<JwtInterceptor>;

    let httpRequest: any;
    let httpHandler: any;
    let token: string;

    beforeAll(() => {
        token = 'eyJhbGciOiJIUzI1NiJ9' +
            '.eyJzdWIiOiJqb3NlQGVtYWlsLmNvbSIsImV4cCI6MTY4NjEwMTg5NCwicm9sZSI6IlVTRVIifQ' +
            '.BdAf2obyEm0pZOE_IQkZ7B2afQPiTCpBTGZTl-wEp90';
    });

    beforeEach(() => {
        spectator = createJwtInterceptor();

        httpRequest = {
            clone: (update: {
                setHeaders?: any;
            }) => {
                httpRequest.headers = {};
                if (update.setHeaders) {
                    for (const header of Object.keys(update.setHeaders)) {
                        httpRequest.headers[header] = update.setHeaders[header];
                    }
                }
                return httpRequest;
            }
        } as any;

        httpHandler = {
            handle: (req: HttpRequest<any>) => {
                return of(req);
            }
        } as any;
    });

    it('debería instanciar el servicio (interceptor) de autenticación basado en JWT para las peticiones HTTP', () => {
        expect(spectator).toBeTruthy();
    });

    it('debería lanzar la petición HTTP (token JWT existente y válido)', async () => {
        const routerSpy = spyOn((spectator.service as any).router, 'navigate');
        spectator.inject(UserService).getToken.andReturn(`"Bearer ${token}"`);
        spectator.inject(UserService).isTokenExpired.andReturn(false);

        const request = await spectator.service.intercept(httpRequest, httpHandler).toPromise() as any;

        expect(request).toBeDefined();
        expect(request.headers).toBeDefined();
        expect(request.headers.Authorization).toEqual(`Bearer ${token}`);
        expect(spectator.inject(NotificationsService).showError).not.toHaveBeenCalled();
        expect(routerSpy).not.toHaveBeenCalled();
    });

    it('debería no lanzar la petición HTTP (token JWT existente y caducado) y mostrar el error asociado', async () => {
        const routerSpy = spyOn((spectator.service as any).router, 'navigate');
        spectator.inject(UserService).getToken.andReturn(`"Bearer ${token}"`);
        spectator.inject(UserService).isTokenExpired.andReturn(true);

        const request = await spectator.service.intercept(httpRequest, httpHandler).toPromise() as any;

        expect(request).toBeUndefined();
        expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalledWith(['/login']);
    });

    it('debería lanzar la petición HTTP (token JWT inexistente)', async () => {
        const routerSpy = spyOn((spectator.service as any).router, 'navigate');
        spectator.inject(UserService).getToken.andReturn(undefined);

        const request = await spectator.service.intercept(httpRequest, httpHandler).toPromise() as any;

        expect(request).toBeDefined();
        expect(spectator.inject(NotificationsService).showError).not.toHaveBeenCalled();
        expect(request.headers).toBeDefined();
        expect(request.headers.Authorization).toBeUndefined();
        expect(routerSpy).not.toHaveBeenCalled();
    });

    afterEach(() => {
        delete httpRequest.headers;
    });
});
