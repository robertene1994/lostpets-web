import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { MessageService } from 'primeng/api';
import { Message } from 'primeng/primeng';

import { NotificationsService } from './notifications.service';
import { NotificationSeverity } from '../../model/types/notification-severity';

import { showErrorTimeIntervalSeconds } from '../../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `NotificationsService`.
 *
 * @author Robert Ene
 */
describe('NotificationsService', () => {

    const createNotificationsService = createServiceFactory({
        service: NotificationsService,
        mocks: [
            MessageService,
        ]
    });
    let spectator: SpectatorService<NotificationsService>;

    let message: Message;

    beforeAll(() => {
        message = {
            life: showErrorTimeIntervalSeconds * 1000,
        } as Message;
    });

    beforeEach(() => {
        spectator = createNotificationsService();
    });

    it('debería instanciar el servicio', () => {
        expect(spectator).toBeTruthy();
    });

    it(`debería mostrar una notificación con la gravedad 'success'`, () => {
        message.severity = NotificationSeverity.SUCCESS;
        message.summary = `Notificación 'Success'`;
        message.detail = `Esta es una notificación 'success'`;

        spectator.service.showSuccess(message.summary, message.detail);

        expect(spectator.inject(MessageService).add).toHaveBeenCalledWith(message);
    });

    it(`debería mostrar una notificación con la gravedad 'info'`, () => {
        message.severity = NotificationSeverity.INFO;
        message.summary = `Notificación 'Info'`;
        message.detail = `Esta es una notificación 'info'`;

        spectator.service.showInfo(message.summary, message.detail);

        expect(spectator.inject(MessageService).add).toHaveBeenCalledWith(message);
    });

    it(`debería mostrar una notificación con la gravedad 'warn'`, () => {
        message.severity = NotificationSeverity.WARN;
        message.summary = `Notificación 'Warn'`;
        message.detail = `Esta es una notificación 'warn'`;

        spectator.service.showWarn(message.summary, message.detail);

        expect(spectator.inject(MessageService).add).toHaveBeenCalledWith(message);
    });

    it(`debería mostrar una notificación con la gravedad 'error'`, () => {
        message.severity = NotificationSeverity.ERROR;
        message.summary = `Notificación 'Error'`;
        message.detail = `Esta es una notificación 'error'`;

        spectator.service.showError(message.summary, message.detail);

        expect(spectator.inject(MessageService).add).toHaveBeenCalledWith(message);
    });

    it('debería mostrar una notificación con el contenido del mensaje recibido al chat del usuario en sesión', () => {
        delete message.severity;
        message.key = 'user-messages';
        message.summary = 'Rodríguez Fernánez José';
        message.detail = '¡Hola! Este mensaje es una prueba.';

        spectator.service.showMessage(message.summary, message.detail);

        expect(spectator.inject(MessageService).add).toHaveBeenCalledWith(message);
    });

    afterAll(() => {
        expect(spectator.inject(MessageService).clear).toHaveBeenCalled();
    });
});
