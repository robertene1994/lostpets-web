import { WebElement, browser, Key } from 'protractor';

import { SignupPage } from './signup.po';
import { AppPage } from './../../app.po';
import { LoginPage } from './../login/login.po';

import { User } from 'src/app/shared/model/user';
import { Role } from './../../../../../src/app/shared/model/types/role';
import { UserStatus } from './../../../../../src/app/shared/model/types/user-status';

import {
    e2eBrowserSleepMillis, navigateToPage, click,
    slowType, repeatKey, getClassAttribute,
    getDisabledAttribute, getElementText, clearLocalStorage,
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `SignupComponent`.
 *
 * @author Robert Ene
 */
describe('SignupPage', () => {

    let appPage: AppPage;
    let page: SignupPage;

    let user: User;

    beforeAll(() => {
        appPage = new AppPage();

        user = {
            id: 99, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;
    });

    beforeEach(async () => {
        page = await navigateToPage(new SignupPage());
    });

    it(`debería mostrar la página 'LostPets: Registrarse'`, async () => {
        await browser.sleep(e2eBrowserSleepMillis);

        expect(await browser.getTitle()).toEqual('LostPets: Registrarse');
    });


    describe('sesión existente del usuario', () => {

        beforeAll(async () => {
            const loginPage = await navigateToPage(new LoginPage());

            await slowType(loginPage.getEmailInput(), 'jose@email.com');
            await slowType(loginPage.getPasswordInput(), 'jose');
            await click(loginPage.getLoginButton());
        });

        it('debería recuperar la sesión existente del usuario', async () => {
            expect(await browser.getTitle()).toEqual('LostPets: Anuncios');
            expect(await browser.getCurrentUrl()).toContain('/ads');
            await clearLocalStorage();
        });

        it('debería no recuperar la sesión del usuario (inexistente)', async () => {
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await browser.getTitle()).toEqual('LostPets: Registrarse');
            expect(await browser.getCurrentUrl()).toContain('/signup');
        });
    });


    describe('registro del usuario en el sistema', () => {

        let emailInput: WebElement;
        let phoneInput: WebElement;
        let firstNameInput: WebElement;
        let lastNameInput: WebElement;
        let passwordInput: WebElement;
        let repeatedPasswordInput: WebElement;
        let signupButton: WebElement;

        let elements: WebElement[];

        beforeEach(async () => {
            page = await navigateToPage(new SignupPage());

            emailInput = page.getEmailInput();
            phoneInput = page.getPhoneInput();
            firstNameInput = page.getFirstNameInput();
            lastNameInput = page.getLastNameInput();
            passwordInput = page.getPasswordInput();
            repeatedPasswordInput = page.getRepeatedPasswordInput();
            signupButton = page.getSignupButton();

            elements = page.getElements();
        });

        it('debería no permitir el registro de usuarios en el sistema (correo electrónico inválido)', async () => {
            for (let i = 0; i < elements.length - 1; i++) {
                expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await slowType(emailInput, 'invalid@email');

            expect(await getClassAttribute(emailInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await repeatKey(emailInput, Key.BACK_SPACE, 5);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getClassAttribute(emailInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await repeatKey(emailInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getClassAttribute(emailInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await slowType(emailInput, 'invalid@.com');
            await repeatKey(emailInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getDisabledAttribute(signupButton)).toBeTruthy();
        });

        it(`debería no permitir el registro de usuarios en el sistema (correo electrónico no único)`, async () => {
            for (let i = 0; i < elements.length - 1; i++) {
                expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await slowType(emailInput, 'jose@email.com');
            await emailInput.sendKeys(Key.TAB);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getClassAttribute(emailInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();
        });

        it(`debería no permitir el registro de usuarios en el sistema (datos inválidos)`, async () => {
            for (let i = 0; i < elements.length - 1; i++) {
                expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await slowType(emailInput, user.email);
            await slowType(phoneInput, '...k-,!12-@');
            await repeatKey(firstNameInput, Key.SPACE, 5);
            await repeatKey(lastNameInput, Key.SPACE, 5);
            await slowType(passwordInput, user.password);
            await slowType(repeatedPasswordInput, user.password);

            expect(await getClassAttribute(emailInput)).toContain('is-valid');
            expect(await getClassAttribute(phoneInput)).toContain('is-invalid');
            expect(await getClassAttribute(firstNameInput)).toContain('is-invalid');
            expect(await getClassAttribute(lastNameInput)).toContain('is-invalid');
            expect(await getClassAttribute(passwordInput)).toContain('is-valid');
            expect(await getClassAttribute(repeatedPasswordInput)).toContain('is-valid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();
        });

        it('debería no permitir el registro de usuarios en el sistema (contraseñas no idénticas)', async () => {
            for (let i = 0; i < elements.length - 1; i++) {
                expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
            }

            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await slowType(emailInput, user.email);
            await slowType(phoneInput, user.phone);
            await slowType(firstNameInput, user.firstName);
            await slowType(lastNameInput, user.lastName);
            await slowType(passwordInput, user.password);
            await repeatKey(repeatedPasswordInput, Key.SPACE, 5);

            for (let i = 0; i < elements.length - 2; i++) {
                expect(await getClassAttribute(elements[i])).toContain('is-valid');
            }
            expect(await getClassAttribute(repeatedPasswordInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await repeatKey(passwordInput, Key.BACK_SPACE, 2);
            await browser.sleep(e2eBrowserSleepMillis);
            await repeatKey(repeatedPasswordInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getClassAttribute(passwordInput)).toContain('is-valid');
            expect(await getClassAttribute(repeatedPasswordInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await repeatKey(passwordInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);

            expect(await getClassAttribute(passwordInput)).toContain('is-invalid');
            expect(await getClassAttribute(repeatedPasswordInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();
        });

        it(`debería permitir el registro de usuarios en el sistema (datos válidos)`, async () => {
            const loginPage = new LoginPage();
            const date = new Date().getTime();
            user.email = `random${date}@email.com`;
            user.password = `random${date}`;

            for (let i = 0; i < elements.length - 1; i++) {
                expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(signupButton)).toBeTruthy();

            await slowType(emailInput, user.email);
            await slowType(phoneInput, user.phone);
            await slowType(firstNameInput, user.firstName);
            await slowType(lastNameInput, user.lastName);
            await slowType(passwordInput, user.password);
            await slowType(repeatedPasswordInput, user.password);

            for (let i = 0; i < elements.length - 1; i++) {
                expect(await getClassAttribute(elements[i])).toContain('is-valid');
            }
            expect(await getDisabledAttribute(signupButton)).toBeNull();

            await click(signupButton);

            expect(await browser.getTitle()).toEqual('LostPets: Iniciar Sesión');
            expect(await browser.getCurrentUrl()).toContain('/login?registered=true');
            expect(await getElementText(appPage.getUiToastDetail()))
                .toEqual('¡Su cuenta ha sido creada correctamente!');

            await slowType(loginPage.getEmailInput(), user.email);
            await slowType(loginPage.getPasswordInput(), user.password);
            await click(loginPage.getLoginButton());
        });
    });

    afterAll(async () => {
        await clearLocalStorage();
    });
});
