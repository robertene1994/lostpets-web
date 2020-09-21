import { HttpRequest } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { ErrorInterceptor } from './error.interceptor';
import { ExceptionResponse } from './../../model/exception-response';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `ErrorInterceptor`.
 *
 * @author Robert Ene
 */
describe('ErrorInterceptor', () => {

    const createErrorInterceptor = createServiceFactory(ErrorInterceptor);
    let spectator: SpectatorService<ErrorInterceptor>;

    let httpRequest: any;

    beforeEach(() => {
        spectator = createErrorInterceptor();

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
    });

    it('debería instanciar el servicio (interceptor) que se encarga del manejo de errores para las peticiones HTTP', () => {
        expect(spectator).toBeTruthy();
    });

    it('debería interceptar y lanzar la petición HTTP (sin errores producidos en el servidor)', async () => {
        const httpHandler = {
            handle: (req: HttpRequest<any>) => {
                return of(req);
            }
        } as any;

        const request = await spectator.service.intercept(httpRequest, httpHandler).toPromise();

        expect(request).toEqual(httpRequest);
    });

    it('debería interceptar la petición HTTP y lanzar el error producido en el servidor', async () => {
        const exceptionResponse = {
            field: 'campo',
            code: '400',
            exception: 'Exception',
            message: 'Error producido en el servidor'
        } as ExceptionResponse;
        const serverError = {
            error: exceptionResponse,
            status: 400,
            statusText: 'Bad Request'
        };
        const httpHandler = {
            handle: (req: HttpRequest<any>) => {
                return new Observable(observer => {
                    observer.next(req);
                    observer.error(serverError);
                });
            }
        } as any;

        const requestPromise = spectator.service.intercept(httpRequest, httpHandler).toPromise();

        await requestPromise.catch((err: ExceptionResponse) => {
            expect(err).toEqual(exceptionResponse);
        });
    });

    it('debería interceptar la petición HTTP y lanzar el error (desconocido, con mensaje) producido en el servidor', async () => {
        const serverError = {
            status: 400,
            message: 'Error producido en el servidor'
        };
        const httpHandler = {
            handle: (req: HttpRequest<any>) => {
                return new Observable(observer => {
                    observer.next(req);
                    observer.error(serverError);
                });
            }
        } as any;

        const requestPromise = spectator.service.intercept(httpRequest, httpHandler).toPromise();

        await requestPromise.catch(err => {
            expect(err).toEqual(serverError.message);
        });
    });

    it('debería interceptar la petición HTTP y lanzar el error (desconocido, sin mensaje) producido en el servidor', async () => {
        const serverError = {
            status: 400,
            statusText: 'Bad Request'
        };
        const httpHandler = {
            handle: (req: HttpRequest<any>) => {
                return new Observable(observer => {
                    observer.next(req);
                    observer.error(serverError);
                });
            }
        } as any;

        const requestPromise = spectator.service.intercept(httpRequest, httpHandler).toPromise();

        await requestPromise.catch(err => {
            expect(err).toEqual(serverError.statusText);
        });
    });
});
