import { browser, element, by } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `SignupComponent`.
 *
 * @author Robert Ene
 */
export class SignupPage {

    navigateTo() {
        return browser.get('/signup');
    }

    getElements() {
        return [
            this.getEmailInput(),
            this.getPhoneInput(),
            this.getFirstNameInput(),
            this.getLastNameInput(),
            this.getPasswordInput(),
            this.getRepeatedPasswordInput(),
            this.getSignupButton()
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

    getPasswordInput() {
        return element(by.name('password'));
    }

    getRepeatedPasswordInput() {
        return element(by.name('repeatedPassword'));
    }

    getSignupButton() {
        return element(by.id('signup-button'));
    }
}
