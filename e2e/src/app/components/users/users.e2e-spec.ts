import { WebElement, browser } from 'protractor';

import { UsersPage } from './users.po';
import { LoginPage } from './../login/login.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';

import {
    e2eBrowserSleepMillis, navigateToPage,
    click, slowType, clearLocalStorage,
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `UsersComponent`.
 *
 * @author Robert Ene
 */
describe('UsersPage', () => {

    let page: UsersPage;

    let account: AccountCredentials;
    let userDivs: WebElement[];

    beforeAll(async () => {
        account = {
            email: 'juan@email.com',
            password: 'juan'
        } as AccountCredentials;

        const loginPage = await navigateToPage(new LoginPage());
        await slowType(loginPage.getEmailInput(), account.email);
        await slowType(loginPage.getPasswordInput(), account.password);
        await click(loginPage.getLoginButton());
    });

    beforeEach(async () => {
        page = await navigateToPage(new UsersPage());

        userDivs = await page.getUserDivs();
    });

    it(`debería mostrar la página 'LostPets: Usuarios'`, async () => {
        expect(await browser.getTitle()).toEqual('LostPets: Usuarios');
    });

    it('debería recuperar todos los usuarios del sistema', async () => {
        expect(userDivs.length).toBeGreaterThan(0);
        userDivs.forEach(userDiv => {
            expect(page.getUserPhotoImg(userDiv)).toBeDefined();
            expect(page.getUserInfoDiv(userDiv)).toBeDefined();
            expect(page.getUserStatusSlider(userDiv)).toBeDefined();
        });
    });

    it('debería cambiar el estado de la cuenta (habilitado/inhabilitado) de un determinado usuario', async () => {
        const firstUserDiv = userDivs[0];
        expect(page.getEnabledUserStatusSpan(firstUserDiv)).toBeDefined();

        await click(page.getFirstUserStatusLabel());
        await browser.sleep(e2eBrowserSleepMillis);

        expect(page.getDisabledUserStatusSpan(firstUserDiv)).toBeDefined();

        await click(page.getFirstUserStatusLabel());
        await browser.sleep(e2eBrowserSleepMillis);

        expect(page.getEnabledUserStatusSpan(firstUserDiv)).toBeDefined();
    });

    afterAll(async () => {
        await clearLocalStorage();
    });
});
