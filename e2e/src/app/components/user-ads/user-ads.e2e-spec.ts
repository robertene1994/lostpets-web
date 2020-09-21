import { WebElement, browser } from 'protractor';

import { UserAdsPage } from './user-ads.po';
import { LoginPage } from './../login/login.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';

import {
    navigateToPage, click,
    slowType, clearLocalStorage,
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `UserAdsComponent`.
 *
 * @author Robert Ene
 */
describe('UserAdsPage', () => {

    let page: UserAdsPage;

    let account: AccountCredentials;
    let userAdDivs: WebElement[];

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
        page = await navigateToPage(new UserAdsPage());

        userAdDivs = await page.getUserAdDivs();
    });

    it(`debería mostrar la página 'LostPets: Mis Anuncios'`, async () => {
        expect(await browser.getTitle()).toEqual('LostPets: Mis Anuncios');
    });

    it('debería recuperar los anuncios de mascotas perdidas asociados a un determinado usuario', async () => {
        expect(userAdDivs.length).toBeGreaterThan(0);
        userAdDivs.forEach(userAdDiv => {
            expect(page.getUserAdPhotoImg(userAdDiv)).toBeDefined();
            expect(page.getUserAdInfoDiv(userAdDiv)).toBeDefined();
            expect(page.getGoToUpdateUserAdButton(userAdDiv)).toBeDefined();
        });
    });

    it('debería navegar a la pantalla que permite visualizar los detalles de un determinado anuncio', async () => {
        await click(userAdDivs[0]);

        expect(await browser.getTitle()).toEqual('LostPets: Detalle del Anuncio');
        expect(await browser.getCurrentUrl()).toContain('/ad-detail/');
    });

    it('debería navegar a la pantalla que permite modificar los detalles de un determinado anuncio', async () => {
        await click(page.getFirstGoToUpdateUserAdButton());

        expect(await browser.getTitle()).toEqual('LostPets: Modificar Anuncio');
        expect(await browser.getCurrentUrl()).toContain('/update-ad/');
    });

    afterAll(async () => {
        await clearLocalStorage();
    });
});
