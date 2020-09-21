import { browser, element, by } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `UpdateAdComponent`.
 *
 * @author Robert Ene
 */
export class UpdateAdPage {

    navigateTo() {
        return browser.get('/update-ad');
    }

    getElements() {
        return [
            this.getRewardInput(),
            this.getObservationsInput(),
            this.getNameInput(),
            this.getTypeInput(),
            this.getRaceInput(),
            this.getColourInput(),
            this.getMicrochipIdInput()
        ];
    }

    getGoogleMapDiv() {
        return element(by.css('.google-map-wrapper'));
    }

    getPetImageInput() {
        return element(by.id('petImageFile'));
    }

    getRewardInput() {
        return element(by.name('reward'));
    }

    getDateInput() {
        return element(by.css('input[name=date]'));
    }

    getTimeInput() {
        return element(by.css('input[name=time]'));
    }

    getObservationsInput() {
        return element(by.name('observations'));
    }

    getNameInput() {
        return element(by.name('name'));
    }

    getTypeInput() {
        return element(by.name('type'));
    }

    getRaceInput() {
        return element(by.name('race'));
    }

    getPetSexMaleRadioInput() {
        return element(by.id('petSexMaleRadio'));
    }

    getPetSexFemaleRadioInput() {
        return element(by.id('petSexFemaleRadio'));
    }

    getColourInput() {
        return element(by.name('colour'));
    }

    getMicrochipIdInput() {
        return element(by.name('microchipId'));
    }

    getUpdateAdButton() {
        return element(by.id('update-ad-button'));
    }
}
