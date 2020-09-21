import { WebElement, browser, Key } from 'protractor';

import { LoginPage } from './login.po';
import { AppPage } from './../../app.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';

import {
    e2eBrowserSleepMillis, navigateToPage, click,
    slowType, repeatKey, getClassAttribute,
    getDisabledAttribute, getElementText, clearLocalStorage,
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `LoginComponent`.
 *
 * @author Robert Ene
 */
describe('LoginPage', () => {

    let appPage: AppPage;
    let page: LoginPage;

    let emailInput: WebElement;
    let passwordInput: WebElement;
    let loginButton: WebElement;

    let account: AccountCredentials;

    beforeAll(() => {
        appPage = new AppPage();

        account = {
            email: 'jose@email.com',
            password: 'jose'
        } as AccountCredentials;
    });

    beforeEach(async () => {
        page = await navigateToPage(new LoginPage());
    });

    it(`debería mostrar la página 'LostPets: Iniciar Sesión'`, async () => {
        await browser.sleep(e2eBrowserSleepMillis);

        expect(await browser.getTitle()).toEqual('LostPets: Iniciar Sesión');
    });


    describe('sesión existente del usuario', () => {

        beforeAll(async () => {
            await slowType(page.getEmailInput(), account.email);
            await slowType(page.getPasswordInput(), account.password);
            await click(page.getLoginButton());
        });

        it('debería recuperar la sesión existente del usuario', async () => {
            expect(await browser.getTitle()).toEqual('LostPets: Anuncios');
            expect(await browser.getCurrentUrl()).toContain('/ads');
        });

        it('debería no recuperar la sesión del usuario (inexistente)', async () => {
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await browser.getTitle()).toEqual('LostPets: Iniciar Sesión');
            expect(await browser.getCurrentUrl()).toContain('/login');
        });

        afterEach(async () => {
            await clearLocalStorage();
        });
    });


    describe('inicio de la sesión (autenticación del usuario)', () => {

        beforeEach(async () => {
            page = await navigateToPage(new LoginPage());

            emailInput = page.getEmailInput();
            passwordInput = page.getPasswordInput();
            loginButton = page.getLoginButton();
        });

        it('debería no permitir iniciar sesión en el sistema (correo electrónico inválido)', async () => {
            expect(await getClassAttribute(emailInput)).not.toContain('is-valid');
            expect(await getClassAttribute(emailInput)).not.toContain('is-invalid');

            expect(await getClassAttribute(passwordInput)).not.toContain('is-valid');
            expect(await getClassAttribute(passwordInput)).not.toContain('is-invalid');

            expect(await getDisabledAttribute(loginButton)).toBeTruthy();

            await slowType(emailInput, 'invalid@email');
            await slowType(passwordInput, 'invalid');

            expect(await getClassAttribute(emailInput)).toContain('is-invalid');
            expect(await getClassAttribute(passwordInput)).toContain('is-valid');
            expect(await getDisabledAttribute(loginButton)).toBeTruthy();

            await repeatKey(emailInput, Key.BACK_SPACE, 5);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(emailInput.getAttribute('class')).toContain('is-invalid');
            expect(await getDisabledAttribute(loginButton)).toBeTruthy();

            await repeatKey(emailInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getClassAttribute(emailInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(loginButton)).toBeTruthy();

            await slowType(emailInput, 'invalid@.com');
            await repeatKey(emailInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getDisabledAttribute(loginButton)).toBeTruthy();
        });

        it('debería no permitir iniciar sesión en el sistema (credenciales inválidas)', async () => {
            expect(await getClassAttribute(emailInput)).not.toContain('is-valid');
            expect(await getClassAttribute(emailInput)).not.toContain('is-invalid');

            expect(await getClassAttribute(passwordInput)).not.toContain('is-valid');
            expect(await getClassAttribute(passwordInput)).not.toContain('is-invalid');

            expect(await getDisabledAttribute(loginButton)).toBeTruthy();

            await slowType(emailInput, 'nonexistent@email.com');
            await slowType(passwordInput, 'nonexistent');

            expect(await getDisabledAttribute(loginButton)).toBeNull();

            await click(loginButton);

            expect(await browser.getTitle()).toEqual('LostPets: Iniciar Sesión');
            expect(await browser.getCurrentUrl()).toContain('/login');
            expect(await getElementText(appPage.getUiToastDetail()))
                .toEqual('¡Correo electrónico o contraseña inválidos!');
        });

        it('debería permitir iniciar sesión en el sistema (credenciales válidas)', async () => {
            expect(await getClassAttribute(emailInput)).not.toContain('is-valid');
            expect(await getClassAttribute(emailInput)).not.toContain('is-invalid');

            expect(await getClassAttribute(passwordInput)).not.toContain('is-valid');
            expect(await getClassAttribute(passwordInput)).not.toContain('is-invalid');

            expect(await getDisabledAttribute(loginButton)).toBeTruthy();

            await slowType(emailInput, account.email);
            await slowType(passwordInput, account.password);

            expect(await getDisabledAttribute(loginButton)).toBeNull();

            await click(loginButton);

            expect(await browser.getTitle()).toEqual('LostPets: Anuncios');
            expect(await browser.getCurrentUrl()).toContain('/ads');
        });
    });


    afterAll(async () => {
        await clearLocalStorage();
    });
});
