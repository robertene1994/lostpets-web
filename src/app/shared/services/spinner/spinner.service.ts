import { Injectable } from '@angular/core';

import { showSpinnerMillis } from '../../../app.config';

/**
 * Servicio para las operaciones relacionadas con el spinner. Este es
 * utilizado por el sistema durante la realización de las operaciones
 * que requiere cierto tiempo de ejecución.
 *
 * @author Robert Ene
 */
@Injectable()
export class SpinnerService {

    private spinner: boolean;

    constructor() {
        this.spinner = false;
    }

    getSpinner() {
        return this.spinner;
    }

    showSpinner() {
        this.spinner = true;
    }

    hideSpinner() {
        setTimeout(() => {
            this.spinner = false;
        }, showSpinnerMillis);
    }
}
