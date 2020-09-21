import { tick, fakeAsync } from '@angular/core/testing';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

import { SpinnerService } from './spinner.service';

import { showSpinnerMillis } from './../../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `SpinnerService`.
 *
 * @author Robert Ene
 */
describe('SpinnerService', () => {

    const createSpinnerService = createServiceFactory(SpinnerService);
    let spectator: SpectatorService<SpinnerService>;

    beforeEach(() => {
        spectator = createSpinnerService();
    });

    it('debería instanciar el servicio', () => {
        expect(spectator).toBeTruthy();
    });

    it('debería mostrar el spinner', () => {
        expect(spectator.service.getSpinner()).toBeFalsy();

        spectator.service.showSpinner();

        expect(spectator.service.getSpinner()).toBeTruthy();
    });

    it('debería ocultar el spinner', fakeAsync(() => {
        expect(spectator.service.getSpinner()).toBeFalsy();

        spectator.service.showSpinner();
        spectator.service.hideSpinner();
        tick(showSpinnerMillis);

        expect(spectator.service.getSpinner()).toBeFalsy();
    }));
});
