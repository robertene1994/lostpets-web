import { Injectable, OnDestroy } from '@angular/core';

import { MessageService } from 'primeng/api';

import { NotificationSeverity } from '../../model/types/notification-severity';

import { showErrorTimeIntervalSeconds } from '../../../app.config';

/**
 * Servicio para las operaciones relacionadas con las notificaciones.
 * Se trata de un sistema basado en mensajes que tienen una determinada
 * gravedad, en función de las necesidades.
 *
 * @author Robert Ene
 */
@Injectable()
export class NotificationsService implements OnDestroy {

    private showErrorTime: number;

    constructor(private messageService: MessageService) {
        this.showErrorTime = showErrorTimeIntervalSeconds * 1000;
    }

    showSuccess(summary: string, detail: string) {
        this.messageService.add({
            severity: NotificationSeverity.SUCCESS,
            summary,
            life: this.showErrorTime,
            detail
        });
    }

    showInfo(summary: string, detail: string) {
        this.messageService.add({
            severity: NotificationSeverity.INFO,
            summary,
            life: this.showErrorTime,
            detail
        });
    }

    showWarn(summary: string, detail: string) {
        this.messageService.add({
            severity: NotificationSeverity.WARN,
            summary,
            life: this.showErrorTime,
            detail
        });
    }

    showError(summary: string, detail: string) {
        this.messageService.add({
            severity: NotificationSeverity.ERROR,
            summary,
            life: this.showErrorTime,
            detail
        });
    }

    showMessage(summary: string, detail: string) {
        this.messageService.add({
            key: 'user-messages',
            summary,
            life: this.showErrorTime,
            detail
        });
    }

    ngOnDestroy() {
        this.messageService.clear();
    }
}
