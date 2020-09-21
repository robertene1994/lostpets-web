import { browser } from 'protractor';

import { AppPage } from './app.po';
import { LoginPage } from './components/login/login.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';

import {
    e2eBrowserSleepMillis, navigateToPage, click,
    slowType, getClassAttribute, clearLocalStorage
} from './../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `AppComponent`.
 *
 * @author Robert Ene
 */
describe('AppPage', () => {

    let page: AppPage;

    let accountUser: AccountCredentials;
    let accountAdmin: AccountCredentials;

    beforeAll(() => {
        accountUser = {
            email: 'jose@email.com',
            password: 'jose'
        } as AccountCredentials;

        accountAdmin = {
            email: 'juan@email.com',
            password: 'juan'
        } as AccountCredentials;
    });

    beforeEach(async () => {
        page = await navigateToPage(new AppPage());
    });

    it(`debería mostrar la página 'LostPets: Iniciar Sesión'`, async () => {
        browser.sleep(e2eBrowserSleepMillis);

        expect(page.getNavbar()).toBeDefined();
        expect(await browser.getTitle()).toEqual('LostPets: Iniciar Sesión');
        expect(await getClassAttribute(page.getLoginLink())).toContain('active');
    });

    it(`debería navegar a la página 'LostPets: Registrarse'`, async () => {
        const signupLink = await click(page.getSignupLink());

        expect(await browser.getTitle()).toEqual('LostPets: Registrarse');
        expect(await getClassAttribute(signupLink)).toContain('active');
    });


    describe('navegación por la barra de navegación superior', () => {

        let loginPage: LoginPage;

        beforeEach(async () => {
            loginPage = await navigateToPage(new LoginPage());
        });

        it('debería navegar por los enlaces de la barra de navegación (sesión iniciada - usuario)', async () => {
            await slowType(loginPage.getEmailInput(), accountUser.email);
            await slowType(loginPage.getPasswordInput(), accountUser.password);
            await click(loginPage.getLoginButton());

            expect(await browser.getTitle()).toEqual('LostPets: Anuncios');
            expect(await getClassAttribute(page.getAdsLink())).toContain('active');

            const userAdsLink = await click(page.getUserAdsLink());
            expect(await browser.getTitle()).toEqual('LostPets: Mis Anuncios');
            expect(await getClassAttribute(userAdsLink)).toContain('active');

            const addAdLink = await click(page.getAddAdLink());
            expect(await browser.getTitle()).toEqual('LostPets: Nuevo Anuncio');
            expect(await getClassAttribute(addAdLink)).toContain('active');

            const userChatsLink = await click(page.getUserChatsLink());
            expect(await browser.getTitle()).toEqual('LostPets: Chats');
            expect(await getClassAttribute(userChatsLink)).toContain('active');

            const userProfileLink = await click(page.getUserProfileLink());
            expect(await browser.getTitle()).toEqual('LostPets: Mi Perfil');
            expect(await getClassAttribute(userProfileLink)).toContain('active');

            await click(page.getLogoutLink());
            expect(await browser.getTitle()).toEqual('LostPets: Iniciar Sesión');
            expect(await getClassAttribute(page.getLoginLink())).toContain('active');
        });

        it('debería navegar por los enlaces de la barra de navegación (sesión iniciada - administrador)', async () => {
            await slowType(loginPage.getEmailInput(), accountAdmin.email);
            await slowType(loginPage.getPasswordInput(), accountAdmin.password);

            await click(loginPage.getLoginButton());
            expect((await browser).getTitle()).toEqual('LostPets: Anuncios');
            expect(page.getAdsLink().getAttribute('class')).toContain('active');

            const usersLink = await click(page.getUsersLink());
            expect(await browser.getTitle()).toEqual('LostPets: Usuarios');
            expect(await getClassAttribute(usersLink)).toContain('active');

            const userChatsLink = await click(page.getUserChatsLink());
            expect(await browser.getTitle()).toEqual('LostPets: Chats');
            expect(await getClassAttribute(userChatsLink)).toContain('active');

            const userProfileLink = await click(page.getUserProfileLink());
            expect(await browser.getTitle()).toEqual('LostPets: Mi Perfil');
            expect(await getClassAttribute(userProfileLink)).toContain('active');

            await click(page.getLogoutLink());
            expect(await browser.getTitle()).toEqual('LostPets: Iniciar Sesión');
            expect(await getClassAttribute(page.getLoginLink())).toContain('active');
        });
    });


    afterAll(async () => {
        await clearLocalStorage();
    });
});
