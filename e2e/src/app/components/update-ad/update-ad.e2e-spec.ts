import { WebElement, browser, Key } from 'protractor';

import { UpdateAdPage } from './update-ad.po';
import { LoginPage } from './../login/login.po';
import { UserAdsPage } from './../user-ads/user-ads.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';
import { Ad } from 'src/app/shared/model/ad';
import { AdStatus } from './../../../../../src/app/shared/model/types/ad-status';
import { PetStatus } from './../../../../../src/app/shared/model/types/pet-status';
import { LatLng } from 'src/app/shared/model/lat-lng';
import { Pet } from './../../../../../src/app/shared/model/pet';
import { Sex } from './../../../../../src/app/shared/model/types/sex';

import {
    e2eBrowserSleepMillis, navigateToPage, click, slowType,
    repeatKey, getClassAttribute, getDisabledAttribute,
    clearLocalStorage
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `UpdateAdComponent`.
 *
 * @author Robert Ene
 */
describe('UpdateAdPage', () => {

    let page: UpdateAdPage;

    let account: AccountCredentials;
    let ad: Ad;

    beforeAll(async () => {
        account = {
            email: 'jose@email.com',
            password: 'jose'
        } as AccountCredentials;

        ad = {
            id: 888, code: 'CODE888', date: new Date().getTime(),
            adStatus: AdStatus.ENABLED, petStatus: PetStatus.FOUND,
            reward: 100.00, lastSpottedCoords: {
                latitude: 43.361914,
                longitude: -5.84938
            } as LatLng, pet: {
                name: 'Otto', type: 'Perro', race: 'Yorkshire',
                sex: Sex.MALE, colour: 'Marrón y negro',
                microchipId: '18236919'
            } as Pet, observations: 'Muy asustado',
            photo: 'CODE888.jpg'
        } as Ad;

        const loginPage = await navigateToPage(new LoginPage());
        await slowType(loginPage.getEmailInput(), account.email);
        await slowType(loginPage.getPasswordInput(), account.password);
        await click(loginPage.getLoginButton());
    });

    beforeEach(async () => {
        const userAdsPage = await navigateToPage(new UserAdsPage());
        await click(userAdsPage.getFirstGoToUpdateUserAdButton());
    });

    it(`debería mostrar la página 'LostPets: Modificar Anuncio'`, async () => {
        expect(await browser.getTitle()).toEqual('LostPets: Modificar Anuncio');
    });


    describe('modificación de los detalles de un determinado anuncio', () => {

        let googleMapDiv: WebElement;
        let petImageInput: WebElement;
        let rewardInput: WebElement;
        let dateInput: WebElement;
        let timeInput: WebElement;
        let observationsInput: WebElement;
        let nameInput: WebElement;
        let typeInput: WebElement;
        let raceInput: WebElement;
        let petRaceMaleRadioInput: WebElement;
        let petRaceFemaleRadioInput: WebElement;
        let colourInput: WebElement;
        let microchipIdInput: WebElement;
        let updateAdButton: WebElement;

        let elements: WebElement[];

        beforeEach(async () => {
            const userAdsPage = await navigateToPage(new UserAdsPage());
            await click(userAdsPage.getFirstGoToUpdateUserAdButton());
            await browser.sleep(e2eBrowserSleepMillis);

            page = new UpdateAdPage();
            googleMapDiv = page.getGoogleMapDiv();
            petImageInput = page.getPetImageInput();
            rewardInput = page.getRewardInput();
            dateInput = page.getDateInput();
            timeInput = page.getTimeInput();
            observationsInput = page.getObservationsInput();
            nameInput = page.getNameInput();
            typeInput = page.getTypeInput();
            raceInput = page.getRaceInput();
            petRaceMaleRadioInput = page.getPetSexMaleRadioInput();
            petRaceFemaleRadioInput = page.getPetSexFemaleRadioInput();
            colourInput = page.getColourInput();
            microchipIdInput = page.getMicrochipIdInput();
            updateAdButton = page.getUpdateAdButton();

            elements = page.getElements();
        });

        it(`debería no permitir la modificación de un determinado anuncio (imagen del
            anuncio no seleccionada, localización del usuario habilitada)`, async () => {
                for (const elm of elements) {
                    expect(await getClassAttribute(elm)).toContain('is-valid');
                    expect(await getClassAttribute(elm)).not.toContain('is-invalid');
                }
                expect(await getDisabledAttribute(updateAdButton)).toBeNull();
            });

        it(`debería no permitir la modificación de un determinado anuncio (datos inválidos)`, async () => {
            for (const elm of elements) {
                expect(await getClassAttribute(elm)).toContain('is-valid');
                expect(await getClassAttribute(elm)).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(updateAdButton)).toBeNull();

            await click(googleMapDiv, { x: 100, y: 100 });

            const petImagePath = './../../../../images/dog-2.jpg';
            petImageInput.sendKeys(require('path').resolve(__dirname, petImagePath));

            await repeatKey(rewardInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(rewardInput, '...k-,!12-@');

            await repeatKey(observationsInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await repeatKey(observationsInput, Key.SPACE, 5);

            await repeatKey(nameInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await repeatKey(nameInput, Key.SPACE, 5);

            await repeatKey(typeInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await repeatKey(typeInput, Key.SPACE, 5);

            await repeatKey(raceInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await repeatKey(raceInput, Key.SPACE, 5);

            await repeatKey(colourInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await repeatKey(colourInput, Key.SPACE, 5);

            await repeatKey(microchipIdInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await repeatKey(microchipIdInput, Key.SPACE, 5);

            expect(await getClassAttribute(petImageInput)).toContain('is-valid');
            expect(await getClassAttribute(rewardInput)).toContain('is-invalid');
            expect(await getClassAttribute(dateInput)).toContain('is-valid');
            expect(await getClassAttribute(timeInput)).toContain('is-valid');
            expect(await getClassAttribute(observationsInput)).toContain('is-invalid');
            expect(await getClassAttribute(nameInput)).toContain('is-invalid');
            expect(await getClassAttribute(typeInput)).toContain('is-invalid');
            expect(await getClassAttribute(raceInput)).toContain('is-invalid');
            expect(await getClassAttribute(colourInput)).toContain('is-invalid');
            expect(await getClassAttribute(microchipIdInput)).toContain('is-invalid');
            expect(await getDisabledAttribute(updateAdButton)).toBeTruthy();
        });

        it('debería no permitir la modificación de un determinado anuncio (datos válidos)', async () => {
            for (const elm of elements) {
                expect(await getClassAttribute(elm)).toContain('is-valid');
                expect(await getClassAttribute(elm)).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(updateAdButton)).toBeNull();

            await click(googleMapDiv, { x: 100, y: 100 });
            const petImagePath = './../../../../images/dog-2.jpg';
            petImageInput.sendKeys(require('path').resolve(__dirname, petImagePath));

            await repeatKey(rewardInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(rewardInput, ad.reward.toString());

            await repeatKey(observationsInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(observationsInput, ad.observations);

            await repeatKey(nameInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(nameInput, ad.pet.name);

            await repeatKey(typeInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(typeInput, ad.pet.type);

            await repeatKey(raceInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(raceInput, ad.pet.type);

            await click(petRaceFemaleRadioInput);
            await click(petRaceMaleRadioInput);

            await repeatKey(colourInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(colourInput, ad.pet.colour);

            await repeatKey(microchipIdInput, Key.BACK_SPACE);
            await browser.sleep(e2eBrowserSleepMillis);
            await slowType(microchipIdInput, ad.pet.microchipId);

            expect(await getClassAttribute(petImageInput)).toContain('is-valid');
            expect(await getClassAttribute(rewardInput)).toContain('is-valid');
            expect(await getClassAttribute(dateInput)).toContain('is-valid');
            expect(await getClassAttribute(timeInput)).toContain('is-valid');
            expect(await getClassAttribute(observationsInput)).toContain('is-valid');
            expect(await getClassAttribute(nameInput)).toContain('is-valid');
            expect(await getClassAttribute(typeInput)).toContain('is-valid');
            expect(await getClassAttribute(raceInput)).toContain('is-valid');
            expect(await getClassAttribute(colourInput)).toContain('is-valid');
            expect(await getClassAttribute(microchipIdInput)).toContain('is-valid');
            expect(await getDisabledAttribute(updateAdButton)).toBeNull();

            await click(updateAdButton);

            expect(await browser.getTitle()).toEqual('LostPets: Mis Anuncios');
            expect(await browser.getCurrentUrl()).toContain('/user-ads?updatedAd=true');
        });
    });


    afterAll(async () => {
        await clearLocalStorage();
    });
});
