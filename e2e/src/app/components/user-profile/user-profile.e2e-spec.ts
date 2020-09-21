import { WebElement, browser, Key } from 'protractor';

import { UserProfilePage } from './user-profile.po';
import { AppPage } from './../../app.po';
import { SignupPage } from './../signup/signup.po';
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
describe('UserProfilePage', () => {

    let appPage: AppPage;
    let page: UserProfilePage;

    let user: User;

    beforeAll(async () => {
        appPage = new AppPage();

        const date = new Date().getTime();
        user = {
            id: 99, email: `random${date}@email.com`,
            password: `random${date}`, role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        const signupPage = await navigateToPage(new SignupPage());
        await slowType(signupPage.getEmailInput(), user.email);
        await slowType(signupPage.getPhoneInput(), user.phone);
        await slowType(signupPage.getFirstNameInput(), user.firstName);
        await slowType(signupPage.getLastNameInput(), user.lastName);
        await slowType(signupPage.getPasswordInput(), user.password);
        await slowType(signupPage.getRepeatedPasswordInput(), user.password);

        await click(signupPage.getSignupButton());

        const loginPage = new LoginPage();
        await slowType(loginPage.getEmailInput(), user.email);
        await slowType(loginPage.getPasswordInput(), user.password);
        await click(loginPage.getLoginButton());
    });

    it(`debería mostrar la página 'LostPets: Mi Perfil'`, async () => {
        await navigateToPage(new UserProfilePage());

        expect(await browser.getTitle()).toEqual('LostPets: Mi Perfil');
    });


    describe('modificación de los datos personales de la cuenta del usuario', () => {

        let emailInput: WebElement;
        let phoneInput: WebElement;
        let firstNameInput: WebElement;
        let lastNameInput: WebElement;
        let oldPasswordInput: WebElement;
        let passwordInput: WebElement;
        let repeatedPasswordInput: WebElement;
        let updateUserButton: WebElement;

        let elements: WebElement[];

        beforeEach(async () => {
            page = await navigateToPage(new UserProfilePage());

            emailInput = page.getEmailInput();
            phoneInput = page.getPhoneInput();
            firstNameInput = page.getFirstNameInput();
            lastNameInput = page.getLastNameInput();
            oldPasswordInput = page.getOldPasswordInput();
            passwordInput = page.getPasswordInput();
            repeatedPasswordInput = page.getRepeatedPasswordInput();
            updateUserButton = page.getUpdateUserButton();

            elements = page.getElements();
        });

        it(`debería no permitir la modificación de los datos personales de la
            cuenta del usuario (correo electrónico inválido)`, async () => {
                for (let i = 0; i < elements.length; i++) {
                    if (i < elements.length - 4) {
                        expect(await getClassAttribute(elements[i])).toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    } else {
                        expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    }
                }
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await repeatKey(emailInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);

                expect(await getClassAttribute(emailInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await slowType(emailInput, 'invalid@email');

                expect(await getClassAttribute(emailInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await repeatKey(emailInput, Key.BACK_SPACE, 5);
                await browser.sleep(e2eBrowserSleepMillis);

                expect(await getClassAttribute(emailInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await repeatKey(emailInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);

                expect(await getClassAttribute(emailInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await slowType(emailInput, 'invalid@.com');
                await browser.sleep(e2eBrowserSleepMillis);

                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();
            });

        it(`debería no permitir la modificación de los datos personales de la
            cuenta del usuario (correo electrónico no único)`, async () => {
                for (let i = 0; i < elements.length; i++) {
                    if (i < elements.length - 4) {
                        expect(await getClassAttribute(elements[i])).toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    } else {
                        expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    }
                }
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await repeatKey(emailInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);

                expect(await getClassAttribute(emailInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await slowType(emailInput, 'jose@email.com');
                await emailInput.sendKeys(Key.TAB);
                await browser.sleep(e2eBrowserSleepMillis);

                expect(await getClassAttribute(emailInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();
            });

        it(`debería no permitir la modificación de los datos personales de la cuenta
            del usuario (contraseña anterior inválida, contraseñas no idénticas)`, async () => {
                for (let i = 0; i < elements.length; i++) {
                    if (i < elements.length - 4) {
                        expect(await getClassAttribute(elements[i])).toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    } else {
                        expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    }
                }
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await repeatKey(oldPasswordInput, Key.SPACE, 5);
                await browser.sleep(e2eBrowserSleepMillis);

                await slowType(passwordInput, user.password);

                await repeatKey(repeatedPasswordInput, Key.SPACE, 5);
                await browser.sleep(e2eBrowserSleepMillis);

                expect(await getClassAttribute(oldPasswordInput)).toContain('is-invalid');
                expect(await getClassAttribute(passwordInput)).toContain('is-valid');
                expect(await getClassAttribute(repeatedPasswordInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();
            });

        it(`debería no permitir la modificación de los datos personales
            de la cuenta del usuario (datos inválidos)`, async () => {
                for (let i = 0; i < elements.length; i++) {
                    if (i < elements.length - 4) {
                        expect(await getClassAttribute(elements[i])).toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    } else {
                        expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    }
                }
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await repeatKey(emailInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await slowType(emailInput, user.email);

                await repeatKey(phoneInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await slowType(phoneInput, '...k-,!12-@');

                await repeatKey(firstNameInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await repeatKey(firstNameInput, Key.SPACE, 5);

                await repeatKey(lastNameInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await repeatKey(lastNameInput, Key.SPACE, 5);

                await slowType(oldPasswordInput, user.password);
                await slowType(passwordInput, user.password);
                await slowType(repeatedPasswordInput, user.password);

                expect(await getClassAttribute(emailInput)).toContain('is-valid');
                expect(await getClassAttribute(phoneInput)).toContain('is-invalid');
                expect(await getClassAttribute(firstNameInput)).toContain('is-invalid');
                expect(await getClassAttribute(lastNameInput)).toContain('is-invalid');
                expect(await getClassAttribute(oldPasswordInput)).toContain('is-valid');
                expect(await getClassAttribute(passwordInput)).toContain('is-valid');
                expect(await getClassAttribute(repeatedPasswordInput)).toContain('is-valid');
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();
            });

        it(`debería permitir la modificación de los datos personales de
            la cuenta del usuario (datos válidos)`, async () => {
                const oldPassword = user.password;
                const date = new Date().getTime();
                user.email = `random${date}@email.com`;
                user.password = `random${date}`;

                for (let i = 0; i < elements.length; i++) {
                    if (i < elements.length - 4) {
                        expect(await getClassAttribute(elements[i])).toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    } else {
                        expect(await getClassAttribute(elements[i])).not.toContain('is-valid');
                        expect(await getClassAttribute(elements[i])).not.toContain('is-invalid');
                    }
                }
                expect(await getDisabledAttribute(updateUserButton)).toBeTruthy();

                await repeatKey(emailInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await slowType(emailInput, user.email);

                await repeatKey(phoneInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await slowType(phoneInput, user.phone);

                await repeatKey(firstNameInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await slowType(firstNameInput, user.firstName);

                await repeatKey(lastNameInput, Key.BACK_SPACE);
                await browser.sleep(e2eBrowserSleepMillis);
                await slowType(lastNameInput, user.lastName);

                await slowType(oldPasswordInput, oldPassword);
                await slowType(passwordInput, user.password);
                await slowType(repeatedPasswordInput, user.password);

                for (let i = 0; i < elements.length - 1; i++) {
                    expect(await getClassAttribute(elements[i])).toContain('is-valid');
                }
                expect(await getDisabledAttribute(updateUserButton)).toBeNull();

                await click(updateUserButton);

                expect(await browser.getTitle()).toEqual('LostPets: Anuncios');
                expect(await browser.getCurrentUrl()).toContain('/ads?updatedUserProfile=true');
                expect(await getElementText(appPage.getUiToastDetail()))
                    .toEqual('¡Los datos de su cuenta de usuario han sido modificados correctamente!');
            });
    });


    afterAll(async () => {
        await clearLocalStorage();
    });
});
