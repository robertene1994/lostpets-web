import { browser, element, by, WebElement } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `AdsComponent`.
 *
 * @author Robert Ene
 */
export class AdsPage {

    navigateTo() {
        return browser.get('/ads');
    }

    getAdDivs() {
        return element.all(by.css('.ad-wrapper')).getWebElements();
    }

    getAdPhotoImg(adDiv: WebElement) {
        return element(adDiv.findElement(by.css('.ad-photo')));
    }

    getAdInfoDiv(adDiv: WebElement) {
        return element(adDiv.findElement(by.css('.ad-info')));
    }

    getFirstGoToUpdateAdButton() {
        return element(by.id('go-to-update-ad-button'));
        // return element.all(by.id('go-to-update-ad-button')).first();
    }
}
