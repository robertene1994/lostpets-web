import { browser, element, by } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `AppComponent`.
 *
 * @author Robert Ene
 */
export class AppPage {

    navigateTo() {
        return browser.get(browser.baseUrl);
    }

    getNavbar() {
        return element(by.id('navbar'));
    }

    getUiToastDetail() {
        return element(by.className('ui-toast-detail'));
    }

    getLoginLink() {
        return element(by.id('link-login'));
    }

    getSignupLink() {
        return element(by.id('link-signup'));
    }

    getAdsLink() {
        return element(by.id('link-ads'));
    }

    getUserAdsLink() {
        return element(by.id('link-user-ads'));
    }

    getAddAdLink() {
        return element(by.id('link-add-ad'));
    }

    getUsersLink() {
        return element(by.id('link-users'));
    }

    getUserChatsLink() {
        return element(by.id('link-user-chats'));
    }

    getUserProfileLink() {
        return element(by.id('link-user-profile'));
    }

    getLogoutLink() {
        return element(by.id('link-logout'));
    }
}
