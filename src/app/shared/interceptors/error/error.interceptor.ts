import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ExceptionResponse } from '../../model/exception-response';

/**
 * Servicio (interceptor) que gestiona el manejo de errores
 * para todas las peticiones HTTP salientes.
 *
 * @author Robert Ene
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            let error = err.error as ExceptionResponse;
            if (!error) {
                error = err.message || err.statusText;
            }
            return throwError(error);
        }));
    }
}
