import { tick, fakeAsync } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { TimeoutInterceptor } from './timeout.interceptor';
import { serviceTimeOutMillis } from './../../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `TimeoutInterceptor`.
 *
 * @author Robert Ene
 */
describe('TimeoutInterceptor', () => {

    const createTimeoutInterceptor = createServiceFactory(TimeoutInterceptor);
    let spectator: SpectatorService<TimeoutInterceptor>;

    let httpRequest: any;

    beforeEach(() => {
        spectator = createTimeoutInterceptor();

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

    it('debería instanciar el servicio (interceptor) que se encarga del tiempo de espera para las peticiones HTTP', () => {
        expect(spectator).toBeTruthy();
    });

    it(`debería interceptar y lanzar la petición HTTP (con el servidor en
        funcionamiento e Internet disponible en el cliente)`, async () => {
            const httpHandler = {
                handle: (req: HttpRequest<any>) => {
                    return of(req);
                }
            } as any;

            const request = await spectator.service.intercept(httpRequest, httpHandler).toPromise();

            expect(request).toEqual(httpRequest);
        });

    it(`debería interceptar y no lanzar la petición HTTP (con el servidor en
        funcionamiento e Internet no disponible en el cliente)`, async () => {
            spyOnProperty(window.navigator, 'onLine').and.returnValue(false);
            const httpHandler = {
                handle: (req: HttpRequest<any>) => {
                    return of(req);
                }
            } as any;
            const error = {
                summary: 'LostPets',
                detail: '¡No existe conexión a Internet!'
            };

            const requestPromise = spectator.service.intercept(httpRequest, httpHandler).toPromise();

            await requestPromise.catch(err => {
                expect(err).toEqual(new Error(JSON.stringify(error)));
            });
        });

    it(`debería interceptar y lanzar la petición HTTP (con el servidor detenido
        e Internet disponible en el cliente)`, fakeAsync(async () => {
        const httpHandler = {
            handle: (req: HttpRequest<any>) => {
                return new Observable(observer => {
                    tick(serviceTimeOutMillis);
                    observer.next(req);
                });
            }
        } as any;
        const error = {
            summary: 'LostPets',
            detail: '¡El servicio no está disponible en estos momentos! ¡Por favor, pruebe de nuevo pasados unos minutos!'
        };

        spectator.service.intercept(httpRequest, httpHandler).subscribe(req => {
            expect(req).toBeUndefined();
        }, err => {
            expect(err).toEqual(new Error(JSON.stringify(error)));
        });
    }));
});
