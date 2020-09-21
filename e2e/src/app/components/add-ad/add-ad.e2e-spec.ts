import { WebElement, browser, Key } from 'protractor';

import { AddAdPage } from './add-ad.po';
import { LoginPage } from './../login/login.po';

import { AccountCredentials } from 'src/app/shared/model/account-credentials';
import { Ad } from 'src/app/shared/model/ad';
import { AdStatus } from './../../../../../src/app/shared/model/types/ad-status';
import { PetStatus } from './../../../../../src/app/shared/model/types/pet-status';
import { LatLng } from 'src/app/shared/model/lat-lng';
import { Pet } from './../../../../../src/app/shared/model/pet';
import { Sex } from './../../../../../src/app/shared/model/types/sex';

import {
    navigateToPage, click, slowType, repeatKey,
    getClassAttribute, getDisabledAttribute,
    clearLocalStorage
} from './../../../utils/e2e-util';

/**
 * Grupo de especificaciones (specs) que describe los test end-to-end (e2e)
 * para la página del componente `AddAdComponent`.
 *
 * @author Robert Ene
 */
describe('AddAdPage', () => {

    let page: AddAdPage;

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
        page = await navigateToPage(new AddAdPage());
    });

    it(`debería mostrar la página 'LostPets: Nuevo Anuncio'`, async () => {
        expect(await browser.getTitle()).toEqual('LostPets: Nuevo Anuncio');
    });


    describe('publicación de un nuevo anuncio', () => {

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
        let saveAdButton: WebElement;

        let elements: WebElement[];

        beforeEach(async () => {
            page = await navigateToPage(new AddAdPage());

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
            saveAdButton = page.getSaveAdButton();

            elements = page.getElements();
        });

        it(`debería no permitir la publicación del nuevo anuncio (imagen del
            anuncio no seleccionada, localización del usuario habilitada)`, async () => {
                for (const elm of elements) {
                    expect(await getClassAttribute(elm)).not.toContain('is-valid');
                    expect(await getClassAttribute(elm)).not.toContain('is-invalid');
                }
                expect(await getDisabledAttribute(saveAdButton)).toBeTruthy();

                expect(await getClassAttribute(petImageInput)).toContain('is-invalid');
                expect(await getDisabledAttribute(saveAdButton)).toBeTruthy();
            });

        it(`debería no permitir la publicación del nuevo anuncio (datos inválidos)`, async () => {
            for (const elm of elements) {
                expect(await getClassAttribute(elm)).not.toContain('is-valid');
                expect(await getClassAttribute(elm)).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(saveAdButton)).toBeTruthy();

            await click(googleMapDiv, { x: 100, y: 100 });

            const petImagePath = './../../../../images/dog-1.jpg';
            petImageInput.sendKeys(require('path').resolve(__dirname, petImagePath));
            await slowType(rewardInput, '...k-,!12-@');
            await repeatKey(observationsInput, Key.SPACE, 5);
            await repeatKey(nameInput, Key.SPACE, 5);
            await repeatKey(typeInput, Key.SPACE, 5);
            await repeatKey(raceInput, Key.SPACE, 5);
            await repeatKey(colourInput, Key.SPACE, 5);
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
            expect(await getDisabledAttribute(saveAdButton)).toBeTruthy();
        });

        it('debería permitir la publicación del nuevo anuncio (datos válidos)', async () => {
            for (const elm of elements) {
                expect(await getClassAttribute(elm)).not.toContain('is-valid');
                expect(await getClassAttribute(elm)).not.toContain('is-invalid');
            }
            expect(await getDisabledAttribute(saveAdButton)).toBeTruthy();

            await click(googleMapDiv, { x: 100, y: 100 });
            const petImagePath = './../../../../images/dog-1.jpg';
            petImageInput.sendKeys(require('path').resolve(__dirname, petImagePath));
            await slowType(rewardInput, ad.reward.toString());
            await slowType(observationsInput, ad.observations);
            await slowType(nameInput, ad.pet.name);
            await slowType(typeInput, ad.pet.type);
            await slowType(raceInput, ad.pet.type);
            await click(petRaceFemaleRadioInput);
            await click(petRaceMaleRadioInput);
            await slowType(colourInput, ad.pet.colour);
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
            expect(await getDisabledAttribute(saveAdButton)).toBeNull();

            await click(saveAdButton);

            expect(await browser.getTitle()).toEqual('LostPets: Mis Anuncios');
            expect(await browser.getCurrentUrl()).toContain('/user-ads?savedAd=true');
        });
    });


    afterAll(async () => {
        await clearLocalStorage();
    });
});
