import { browser, WebElement, Key } from 'protractor';

import { UserChatsPage } from './user-chats.po';
import { LoginPage } from '../login/login.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';

import {
    e2eBrowserSleepMillis, navigateToPage, click, slowType,
    repeatKey, getDisabledAttribute, clearLocalStorage
} from '../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `UserChatsComponent`.
 *
 * @author Robert Ene
 */
describe('UserChatsPage', () => {

    let page: UserChatsPage;

    let account: AccountCredentials;
    let userChatDivs: WebElement[];

    beforeAll(async () => {
        account = {
            email: 'jose@email.com',
            password: 'jose'
        } as AccountCredentials;

        const loginPage = await navigateToPage(new LoginPage());
        await slowType(loginPage.getEmailInput(), account.email);
        await slowType(loginPage.getPasswordInput(), account.password);
        await click(loginPage.getLoginButton());
    });

    beforeEach(async () => {
        page = await navigateToPage(new UserChatsPage());

        userChatDivs = await page.getUserChatDivs();
    });

    it(`debería mostrar la página 'LostPets: Chats'`, async () => {
        expect(await browser.getTitle()).toEqual('LostPets: Chats');
    });

    it('debería recuperar los chats asociados a un determinado usuario', async () => {
        expect(userChatDivs.length).toBeGreaterThan(0);
        userChatDivs.forEach(userAdDiv => {
            expect(page.getChatUserPhotoImg(userAdDiv)).toBeDefined();
            expect(page.getChatInfoDiv(userAdDiv)).toBeDefined();
        });
    });

    it('debería mostrar el detalle (mensajes) de un determinado chat', async () => {
        await click(userChatDivs[0]);

        const chatMessageDivs = await page.getChatMessageDivs();
        expect(chatMessageDivs.length).toBeGreaterThan(0);
        expect(page.getMessageTextArea()).toBeDefined();
        expect(page.getSendMessageButton()).toBeDefined();
    });

    it('debería permitir enviar mensajes a un determinado chat', async () => {
        await click(userChatDivs[0]);

        const chatMessageDivs = await page.getChatMessageDivs();
        expect(chatMessageDivs.length).toBeGreaterThan(0);
        expect(page.getMessageTextArea()).toBeDefined();
        expect(page.getSendMessageButton()).toBeDefined();

        await repeatKey(page.getMessageTextArea(), Key.SPACE, 5);
        await browser.sleep(e2eBrowserSleepMillis);

        expect(await getDisabledAttribute(page.getSendMessageButton())).toBeTruthy();

        await repeatKey(page.getMessageTextArea(), Key.BACK_SPACE);
        await browser.sleep(e2eBrowserSleepMillis);

        await slowType(page.getMessageTextArea(), '¡Este es un mensaje de prueba (Test E2E)!');
        await click(page.getSendMessageButton());

        expect(await getDisabledAttribute(page.getSendMessageButton())).toBeTruthy();
    });


    afterAll(async () => {
        await clearLocalStorage();
    });
});
