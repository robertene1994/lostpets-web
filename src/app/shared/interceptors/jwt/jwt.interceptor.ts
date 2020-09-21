import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';

import { NotificationsService } from '../../services/notifications/notifications.service';
import { UserService } from '../../services/user/user.service';

/**
 * Servicio (interceptor) que gestiona la autenticación del usuario
 * para todas las peticiones HTTP salientes.
 *
 * @author Robert Ene
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private noificationsService: NotificationsService,
        private userService: UserService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.userService.getToken();
        if (token && this.userService.isTokenExpired()) {
            this.noificationsService.showError('Iniciar Sesión',
                '¡La sesión ha caducado! ¡Por favor, vuelva a iniciar sesión!');
            this.router.navigate(['/login']);
            return EMPTY;
        }

        return next.handle(req.clone(this.addHeaders(token)));
    }

    private addHeaders(token: string) {
        const update: any = {};
        if (token) {
            update.setHeaders = {
                Authorization: `${JSON.parse(token)}`
            };
        }
        return update;
    }
}
