import { browser } from 'protractor';

import { AdDetailPage } from './ad-detail.po';
import { LoginPage } from './../login/login.po';
import { UserAdsPage } from './../user-ads/user-ads.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';

import {
    navigateToPage, click, slowType,
    getDisabledAttribute, clearLocalStorage
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `AdDetailComponent`.
 *
 * @author Robert Ene
 */
describe('AdDetailPage', () => {

    let page: AdDetailPage;

    let account: AccountCredentials;

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
        await navigateToPage(new UserAdsPage());

        page = new AdDetailPage();
        await click(page.getFirstAdDetail());
    });

    it(`debería mostrar la página 'LostPets: Detalle del Anuncio'`, async () => {
        expect(await browser.getTitle()).toEqual('LostPets: Detalle del Anuncio');
    });

    it('debería mostrar los detalles de un determinado anuncio', async () => {
        expect((await page.getAdDetailInfoDiv()).length).toEqual(3);

        expect(await getDisabledAttribute(page.getGoToChatButton())).toBeTruthy();
        expect(await getDisabledAttribute(page.getGoToUpdateAdButton())).toBeNull();
    });

    it('debería navegar a la pantalla que permite modificar los detalles del anuncio', async () => {
        await click(page.getGoToUpdateAdButton());

        expect(await browser.getTitle()).toEqual('LostPets: Modificar Anuncio');
        expect(await browser.getCurrentUrl()).toContain('/update-ad/');
    });

    afterAll(async () => {
        await clearLocalStorage();
    });
});
