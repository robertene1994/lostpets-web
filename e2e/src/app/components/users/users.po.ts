import { browser, element, by, WebElement } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `UsersComponent`.
 *
 * @author Robert Ene
 */
export class UsersPage {

    navigateTo() {
        return browser.get('/users');
    }

    getUserDivs() {
        return element.all(by.css('.user-wrapper')).getWebElements();
    }

    getUserPhotoImg(userDiv: WebElement) {
        return element(userDiv.findElement(by.css('.user-photo')));
    }

    getUserInfoDiv(userDiv: WebElement) {
        return element(userDiv.findElement(by.css('.user-info')));
    }

    getEnabledUserStatusSpan(userDiv: WebElement) {
        return element(userDiv.findElement(by.css('.enabled-user-status')));
    }

    getDisabledUserStatusSpan(userDiv: WebElement) {
        return element(userDiv.findElement(by.css('.disabled-user-status')));
    }

    getUserStatusSlider(userDiv: WebElement) {
        return element(userDiv.findElement(by.css('input[id^=userStatusInput-')));
    }

    getFirstUserStatusLabel() {
        return element(by.css('label[for=userStatusInput-1'));
    }
}
