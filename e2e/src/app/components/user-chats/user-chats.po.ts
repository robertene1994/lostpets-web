import { browser, element, by, WebElement } from 'protractor';

/**
 * Clase que define el objeto de página correspondiente al componente `UserChatsComponent`.
 *
 * @author Robert Ene
 */
export class UserChatsPage {

    navigateTo() {
        return browser.get('/user-chats');
    }

    getUserChatDivs() {
        return element.all(by.css('.chat-wrapper')).getWebElements();
    }

    getChatUserPhotoImg(adDiv: WebElement) {
        return element(adDiv.findElement(by.css('.user-chat-photo')));
    }

    getChatInfoDiv(adDiv: WebElement) {
        return element(adDiv.findElement(by.css('.chat-info')));
    }

    getChatMessageDivs() {
        return element.all(by.css('.chat-message-wrapper')).getWebElements();
    }

    getMessageTextArea() {
        return element(by.id('send-message-text-area'));
    }

    getSendMessageButton() {
        return element(by.id('send-message-button'));
    }
}
