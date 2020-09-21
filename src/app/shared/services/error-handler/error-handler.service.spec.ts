import { ExceptionResponse } from './../../model/exception-response';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { MessageService } from 'primeng/api';
import { Message } from 'primeng/primeng';

import { ErrorHandlerService } from './error-handler.service';
import { NotificationsService } from './../notifications/notifications.service';
import { NotificationSeverity } from './../../model/types/notification-severity';

import { showErrorTimeIntervalSeconds } from './../../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `ErrorHandlerService`.
 *
 * @author Robert Ene
 */
describe('ErrorHandlerService', () => {

    const createErrorHandlerService = createServiceFactory({
        service: ErrorHandlerService,
        mocks: [
            NotificationsService,
            MessageService
        ]
    });
    let spectator: SpectatorService<ErrorHandlerService>;

    beforeEach(() => {
        spectator = createErrorHandlerService();
        spyOn(console, 'log');
    });

    it('debería instanciar el servicio', () => {
        expect(spectator).toBeTruthy();
    });

    it('debería manejar un error interno a la aplicación Web', () => {
        const message = {
            severity: NotificationSeverity.ERROR,
            summary: 'Error interno',
            life: showErrorTimeIntervalSeconds * 1000,
            detail: '¡Este es una error interno a la aplicación Web'
        } as Message;
        const error = new Error(JSON.stringify(message));

        spectator.service.handleError(error);

        expect(spectator.inject(NotificationsService).showError)
            .toHaveBeenCalledWith(message.summary, message.detail);
    });

    it('debería ignorar un error interno a la aplicación Web si éste no tiene el formado esperado', () => {
        const message = {
            severity: NotificationSeverity.ERROR,
            summary: 'Error interno que tiene el formado esperado',
            life: showErrorTimeIntervalSeconds * 1000
        } as Message;
        const error = new Error(JSON.stringify(message));

        spectator.service.handleError(error);

        expect(spectator.inject(NotificationsService).showError).not.toHaveBeenCalled();
    });

    it('debería manejar un error conocido externo (servidor) a la aplicación Web', () => {
        const exceptionResponse = {
            field: 'campo',
            code: '406',
            exception: 'Exception',
            message: 'Error producido en el servidor'
        } as ExceptionResponse;

        spectator.service.handleError(JSON.stringify(exceptionResponse));

        expect(spectator.inject(NotificationsService).showError)
            .toHaveBeenCalledWith(exceptionResponse.field, exceptionResponse.message);
    });

    it('debería ignorar un error conocido externo (servidor) a la aplicación Web si éste no tiene el formado esperado', () => {
        const exceptionResponse = {
            code: '406',
            exception: 'Exception',
            message: 'Error producido en el servidor'
        } as ExceptionResponse;

        spectator.service.handleError(JSON.stringify(exceptionResponse));

        expect(spectator.inject(NotificationsService).showError).not.toHaveBeenCalled();
    });

    it('debería manejar un error no conocido externo (servidor) a la aplicación Web', () => {
        const exceptionResponse = {
            field: 'campo',
            code: '406',
            exception: 'Exception',
            message: 'Error producido en el servidor'
        } as ExceptionResponse;

        spectator.service.handleError(exceptionResponse);

        expect(spectator.inject(NotificationsService).showError)
            .toHaveBeenCalledWith('LostPets', exceptionResponse.message);
        expect(console.log).toHaveBeenCalledWith(exceptionResponse);
    });

    it('debería manejar un error no conocido externo a la aplicación Web', () => {
        const exceptionResponse = {
            field: 'campo',
            code: '406',
            exception: 'Exception'
        } as ExceptionResponse;

        spectator.service.handleError(exceptionResponse);

        expect(spectator.inject(NotificationsService).showError).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(exceptionResponse);
    });
});
