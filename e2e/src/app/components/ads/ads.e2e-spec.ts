import { WebElement, browser } from 'protractor';

import { AdsPage } from './ads.po';
import { LoginPage } from './../login/login.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';

import {
    navigateToPage, click,
    slowType, clearLocalStorage,
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `AdsComponent`.
 *
 * @author Robert Ene
 */
describe('AdsPage', () => {

    let page: AdsPage;

    let account: AccountCredentials;
    let adDivs: WebElement[];

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
        page = await navigateToPage(new AdsPage());

        adDivs = await page.getAdDivs();
    });

    it(`debería mostrar la página 'LostPets: Anuncios'`, async () => {
        expect(await browser.getTitle()).toEqual('LostPets: Anuncios');
    });

    it('debería recuperar todos los anuncios de mascotas perdidas del sistema', async () => {
        expect(adDivs.length).toBeGreaterThan(0);
        adDivs.forEach(adDiv => {
            expect(page.getAdPhotoImg(adDiv)).toBeDefined();
            expect(page.getAdInfoDiv(adDiv)).toBeDefined();
        });
    });

    it('debería navegar a la pantalla que permite visualizar los detalles de un determinado anuncio', async () => {
        await click(adDivs[0]);

        expect(await browser.getTitle()).toEqual('LostPets: Detalle del Anuncio');
        expect(await browser.getCurrentUrl()).toContain('/ad-detail/');
    });

    it('debería navegar a la pantalla que permite modificar los detalles de un determinado anuncio', async () => {
        await click(page.getFirstGoToUpdateAdButton());

        expect(await browser.getTitle()).toEqual('LostPets: Modificar Anuncio');
        expect(await browser.getCurrentUrl()).toContain('/update-ad/');
    });

    afterAll(async () => {
        await clearLocalStorage();
    });
});
