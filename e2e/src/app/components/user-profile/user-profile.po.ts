import { browser, element, by } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `UserProfileComponent`.
 *
 * @author Robert Ene
 */
export class UserProfilePage {

    navigateTo() {
        return browser.get('/user-profile?from=/ads');
    }

    getElements() {
        return [
            this.getEmailInput(),
            this.getPhoneInput(),
            this.getFirstNameInput(),
            this.getLastNameInput(),
            this.getOldPasswordInput(),
            this.getPasswordInput(),
            this.getRepeatedPasswordInput(),
            this.getUpdateUserButton()
        ];
    }

    getEmailInput() {
        return element(by.name('email'));
    }

    getPhoneInput() {
        return element(by.name('phone'));
    }

    getFirstNameInput() {
        return element(by.name('firstName'));
    }

    getLastNameInput() {
        return element(by.name('lastName'));
    }

    getOldPasswordInput() {
        return element(by.name('oldPassword'));
    }

    getPasswordInput() {
        return element(by.name('password'));
    }

    getRepeatedPasswordInput() {
        return element(by.name('repeatedPassword'));
    }

    getUpdateUserButton() {
        return element(by.id('update-user-button'));
    }
}
