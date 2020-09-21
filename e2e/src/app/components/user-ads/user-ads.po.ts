import { browser, element, by, WebElement } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `UserAdsComponent`.
 *
 * @author Robert Ene
 */
export class UserAdsPage {

    navigateTo() {
        return browser.get('/user-ads');
    }

    getUserAdDivs() {
        return element.all(by.css('.ad-wrapper')).getWebElements();
    }

    getUserAdPhotoImg(adDiv: WebElement) {
        return element(adDiv.findElement(by.css('.ad-photo')));
    }

    getUserAdInfoDiv(adDiv: WebElement) {
        return element(adDiv.findElement(by.css('.ad-info')));
    }

    getGoToUpdateUserAdButton(adDiv: WebElement) {
        return element.all(adDiv.findElements(by.id('go-to-update-ad-button'))).first();
    }

    getFirstGoToUpdateUserAdButton() {
        return element.all(by.id('go-to-update-ad-button')).first();
    }
}
