import { browser, element, by } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `LoginComponent`.
 *
 * @author Robert Ene
 */
export class LoginPage {

    navigateTo() {
        return browser.get('/login');
    }

    getElements() {
        return [
            this.getEmailInput(),
            this.getPasswordInput(),
            this.getLoginButton()
        ];
    }

    getEmailInput() {
        return element(by.name('email'));
    }

    getPasswordInput() {
        return element(by.name('password'));
    }

    getLoginButton() {
        return element(by.id('login-button'));
    }
}
