import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeoutWith } from 'rxjs/operators';

import { serviceTimeOutMillis } from '../../../app.config';

/**
 * Servicio (interceptor) que establece un timeout determinado para la
 * ejecución de cada petición HTTP. Además, comprueba la conexión a
 * Internet antes de lanzar cualquier petición HTTP.
 *
 * @author Robert Ene
 */
@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const error = {
            summary: 'LostPets',
            detail: '¡El servicio no está disponible en estos momentos! ¡Por favor, pruebe de nuevo pasados unos minutos!'
        };
        if (!navigator.onLine) {
            error.detail = '¡No existe conexión a Internet!';
            return throwError(new Error(JSON.stringify(error)));
        } else {
            return next.handle(req).pipe(timeoutWith(serviceTimeOutMillis, throwError(new Error(JSON.stringify(error)))));
        }
    }
}
