import { browser, element, by } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `AdDetailComponent`.
 *
 * @author Robert Ene
 */
export class AdDetailPage {

    navigateTo() {
        return browser.get('/user-detail');
    }

    getFirstAdDetail() {
        return element.all(by.css('.ad-wrapper')).first();
    }

    getAdDetailInfoDiv() {
        return element.all(by.css('.ad-detail-info-wrapper')).getWebElements();
    }

    getGoToChatButton() {
        return element(by.id('go-to-chat-button'));
    }

    getGoToUpdateAdButton() {
        return element(by.id('go-to-update-ad-button'));
    }
}
