import { createHttpFactory, SpectatorHttp, HttpMethod } from '@ngneat/spectator';
import { HttpErrorResponse } from '@angular/common/http';

import { AdService } from './ad.service';

import { Ad } from '../../model/ad';
import { Pet } from './../../model/pet';
import { User } from '../../model/user';
import { AdStatus } from './../../model/types/ad-status';
import { PetStatus } from './../../model/types/pet-status';
import { Sex } from './../../model/types/sex';
import { LatLng } from './../../model/lat-lng';
import { Role } from '../../model/types/role';
import { UserStatus } from '../../model/types/user-status';

import { apiUrlAd } from './../../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el servicio `AdService`.
 *
 * @author Robert Ene
 */
describe('AdService', () => {

    const createAdService = createHttpFactory(AdService);
    let spectator: SpectatorHttp<AdService>;

    let user: User;
    let ads: Ad[];

    beforeAll(() => {

        user = {
            id: 99, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        ads = [];
        ads.push({
            id: 100, code: 'CODE1', date: new Date().getTime(),
            adStatus: AdStatus.ENABLED, petStatus: PetStatus.LOST,
            reward: 100.00, lastSpottedCoords: {
                latitude: 43.361914,
                longitude: -5.84938
            } as LatLng, pet: {
                name: 'Otto', type: 'Perro', race: 'Yorkshire',
                sex: Sex.MALE, colour: 'Marrón y negro',
                microchipId: '18236919'
            } as Pet, observations: 'Muy asustado',
            photo: 'CODE1.jpg', user
        } as Ad);
    });

    beforeEach(() => {
        spectator = createAdService();
    });

    it('debería instanciar el servicio', () => {
        expect(spectator.service).toBeTruthy();
    });

    it('debería recuperar todos los anuncios de mascotas perdidas del sistema', async () => {
        const adsPromise = spectator.service.getAds();

        spectator.expectOne(`${apiUrlAd}`, HttpMethod.GET).flush(ads);
        expect(await adsPromise).toEqual(ads);
    });

    it('debería recuperar todos los anuncios (vacío) de mascotas perdidas del sistema', async () => {
        const adsPromise = spectator.service.getAds();

        spectator.expectOne(`${apiUrlAd}`, HttpMethod.GET).flush([]);
        expect(await adsPromise).toEqual([]);
    });

    it('debería recuperar la foto asociada al anuncio de una mascota perdida', async () => {
        const petImageFile = new File([ads[0].photo], ads[0].photo);
        const petImagePromise = spectator.service.getPetImage(ads[0].photo);

        const testRequest = spectator.expectOne(ads[0].photo, HttpMethod.GET);
        testRequest.flush(petImageFile);

        expect(testRequest.request.responseType).toEqual('blob');
        expect(await petImagePromise).toEqual(petImageFile);
    });

    it('debería no recuperar la foto asociada al anuncio de una mascota perdida si esta no existe', async () => {
        const notFoundError = new ErrorEvent('404', {
            error: new Error('Not Found'),
            message: 'No message available',
            filename: ads[0].photo
        });

        const petImagePromise = spectator.service.getPetImage(ads[0].photo);

        const testRequest = spectator.expectOne(ads[0].photo, HttpMethod.GET);
        testRequest.error(notFoundError, {
            status: 404,
            statusText: 'Not Found'
        });

        expect(testRequest.request.responseType).toEqual('blob');
        await petImagePromise.catch((response: HttpErrorResponse) => {
            expect(response.status).toEqual(404);
            expect(response.statusText).toEqual('Not Found');
        });
    });

    it('debería recuperar el detalle de un determinado anuncio dado su código', async () => {
        const adDetailPromise = spectator.service.getAdDetail(ads[0].code);

        spectator.expectOne(`${apiUrlAd}/${ads[0].code}`, HttpMethod.GET).flush(ads[0]);
        expect(await adDetailPromise).toEqual(ads[0]);
    });

    it('debería recuperar el detalle (vacío) de un determinado anuncio dado su código', async () => {
        const adDetailPromise = spectator.service.getAdDetail(ads[0].code);

        spectator.expectOne(`${apiUrlAd}/${ads[0].code}`, HttpMethod.GET).flush({} as Ad);
        expect(await adDetailPromise).toEqual({} as Ad);
    });

    it('debería recuperar todos los anuncios de mascotas perdidas pertenecientes a un determinado usuario dado su id', async () => {
        const userAdsPromise = spectator.service.getUserAds(user.id);

        spectator.expectOne(`${apiUrlAd}/user/${user.id}`, HttpMethod.GET).flush(ads);
        expect(await userAdsPromise).toEqual(ads);
    });

    it('debería recuperar todos los anuncios (vacío) de mascotas perdidas pertenecientes a un determinado usuario dado su id', async () => {
        const userAdsPromise = spectator.service.getUserAds(user.id);

        spectator.expectOne(`${apiUrlAd}/user/${user.id}`, HttpMethod.GET).flush([]);
        expect(await userAdsPromise).toEqual([]);
    });

    it('debería guardar un nuevo anuncio publicado por un determinado usuario', async () => {
        const petImageFile = new File([ads[0].photo], ads[0].photo);
        const saveAdPromise = spectator.service.saveAd(ads[0], petImageFile);

        const testRequest = spectator.expectOne(`${apiUrlAd}`, HttpMethod.POST);
        testRequest.flush(1);

        expect(testRequest.request.body.get('ad')).toBeDefined();
        expect(testRequest.request.body.get('image')).toBeDefined();
        expect(await saveAdPromise).toBeTruthy();
    });

    it('debería no guardar un nuevo anuncio publicado por un determinado usuario ', async () => {
        const petImageFile = new File([ads[0].photo], ads[0].photo);
        const saveAdPromise = spectator.service.saveAd(ads[0], petImageFile);

        const testRequest = spectator.expectOne(`${apiUrlAd}`, HttpMethod.POST);
        testRequest.flush(0);

        expect(testRequest.request.body.get('ad')).toBeDefined();
        expect(testRequest.request.body.get('image')).toBeDefined();
        expect(await saveAdPromise).toBeFalsy();
    });

    it('debería guardar los datos de un anuncio modificado por un determinado usuario', async () => {
        const petImageFile = new File([ads[0].photo], ads[0].photo);
        const updateAdPromise = spectator.service.updateAd(ads[0], petImageFile);

        const testRequest = spectator.expectOne(`${apiUrlAd}`, HttpMethod.PUT);
        testRequest.flush(1);

        expect(testRequest.request.body.get('ad')).toBeDefined();
        expect(testRequest.request.body.get('image')).toBeDefined();
        expect(await updateAdPromise).toBeTruthy();
    });

    it('debería no guardar los datos de un anuncio modificado por un determinado usuario', async () => {
        const petImageFile = new File([ads[0].photo], ads[0].photo);
        const updateAdPromise = spectator.service.updateAd(ads[0], petImageFile);

        const testRequest = spectator.expectOne(`${apiUrlAd}`, HttpMethod.PUT);
        testRequest.flush(0);

        expect(testRequest.request.body.get('ad')).toBeDefined();
        expect(testRequest.request.body.get('image')).toBeDefined();
        expect(await updateAdPromise).toBeFalsy();
    });

    it('debería guardar el estado de un anuncio modificado por el administrador', async () => {
        const updateAdStatusPromise = spectator.service
            .updateAdStatus(ads[0].code, AdStatus.DISABLED);

        const url = `${apiUrlAd}/adStatus/${ads[0].code}?status=${AdStatus.DISABLED}`;
        const testRequest = spectator.expectOne(url, HttpMethod.PUT);
        testRequest.flush(1);

        expect(testRequest.request.params.get('status')).toEqual(AdStatus.DISABLED);
        expect(testRequest.request.body).toBeNull();
        expect(await updateAdStatusPromise).toBeTruthy();
    });

    it('debería no guardar el estado de un anuncio modificado por el administrador', async () => {
        const updateAdStatusPromise = spectator.service
            .updateAdStatus(ads[0].code, AdStatus.ENABLED);

        const url = `${apiUrlAd}/adStatus/${ads[0].code}?status=${AdStatus.ENABLED}`;
        const testRequest = spectator.expectOne(url, HttpMethod.PUT);
        testRequest.flush(0);

        expect(testRequest.request.params.get('status')).toEqual(AdStatus.ENABLED);
        expect(testRequest.request.body).toBeNull();
        expect(await updateAdStatusPromise).toBeFalsy();
    });

    afterEach(() => {
        spectator.controller.verify();
    });
});
