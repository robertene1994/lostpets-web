import { Injectable } from '@angular/core';

import { Message } from 'primeng/primeng';

import { NotificationsService } from '../notifications/notifications.service';

import { ExceptionResponse } from '../../model/exception-response';

/**
 * Servicio que representa el manejador de errores centralizado para
 * todo el sistema.
 *
 * @author Robert Ene
 */
@Injectable()
export class ErrorHandlerService {

    constructor(
        private notificationsService: NotificationsService) { }

    handleError(e: Error | any) {
        try {
            const message = JSON.parse(e.message) as Message;
            if (message.summary && message.detail) {
                this.notificationsService.showError(message.summary, message.detail);
            }
        } catch {
            this.handleExceptionResponse(e);
        }
    }

    private handleExceptionResponse(e: Error | any) {
        try {
            const exceptionResponse = JSON.parse(e) as ExceptionResponse;
            if (exceptionResponse.field && exceptionResponse.exception) {
                this.notificationsService.showError(exceptionResponse.field, exceptionResponse.message);
            }
        } catch {
            if (e.message) {
                this.notificationsService.showError('LostPets', e.message);
            }
            console.log(e);
        }
    }
}
