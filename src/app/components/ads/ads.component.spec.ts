import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { Params } from '@angular/router';
import { Subject } from 'rxjs';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { JwPaginationComponent } from 'jw-angular-pagination';

import { AdsComponent } from './ads.component';

import { SpinnerService } from './../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from './../../shared/services/error-handler/error-handler.service';
import { UserService } from './../../shared/services/user/user.service';
import { AdService } from './../../shared/services/ad/ad.service';

import { User } from './../../shared/model/user';
import { Ad } from './../../shared/model/ad';
import { Pet } from './../../shared/model/pet';
import { ExceptionResponse } from './../../shared/model/exception-response';
import { UserStatus } from './../../shared/model/types/user-status';
import { Role } from './../../shared/model/types/role';
import { AdStatus } from './../../shared/model/types/ad-status';
import { PetStatus } from './../../shared/model/types/pet-status';
import { LatLng } from './../../shared/model/lat-lng';
import { Sex } from './../../shared/model/types/sex';

import { apiUrl } from './../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el componente `AdsComponent`.
 *
 * @author Robert Ene
 */
describe('AdsComponent', () => {

    const queryParamsMock = new Subject<Params>();
    const activatedRouteMock = {
        queryParams: queryParamsMock.asObservable()
    };
    let routerNavigateSpy: jasmine.Spy<jasmine.Func>;

    const createAdsComponent = createComponentFactory({
        component: AdsComponent,
        imports: [
            RouterTestingModule
        ],
        declarations: [
            JwPaginationComponent
        ],
        providers: [
            SpinnerService
        ],
        mocks: [
            SpinnerService,
            ErrorHandlerService,
            UserService,
            AdService
        ]
    });
    let spectator: Spectator<AdsComponent>;

    let paginatorMock: any[];
    let user: User;
    let ads: Ad[];

    beforeAll(() => {
        user = {
            id: 33, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;
    });

    beforeEach(() => {
        spectator = createAdsComponent();

        routerNavigateSpy = spyOn((spectator.component as any).router, 'navigate');

        ads = [];
        ads.push({
            id: 100, code: 'CODE100', date: new Date().getTime(),
            adStatus: AdStatus.ENABLED, petStatus: PetStatus.LOST,
            reward: 100.00, lastSpottedCoords: {
                latitude: 43.361914,
                longitude: -5.84938
            } as LatLng, pet: {
                name: 'Otto', type: 'Perro', race: 'Yorkshire',
                sex: Sex.MALE, colour: 'Marrón y negro',
                microchipId: '18236919'
            } as Pet, observations: 'Muy asustado',
            photo: 'CODE100.jpg', user
        } as Ad);
        ads.push({
            id: 101, code: 'CODE101', date: new Date().getTime(),
            adStatus: AdStatus.ENABLED, petStatus: PetStatus.FOUND,
            reward: 800.00, lastSpottedCoords: {
                latitude: 45.361914,
                longitude: 15.84938
            } as LatLng, pet: {
                name: 'Luna', type: 'Perro', race: 'Bulldog',
                sex: Sex.FEMALE, colour: 'Marrón y blanco',
                microchipId: '897341221'
            } as Pet, observations: 'Necesita medicación urgentemente',
            photo: 'CODE101.jpg', user
        } as Ad);

        const firstItem = document.createElement('li');
        firstItem.appendChild(document.createElement('a'));
        const previousItem = document.createElement('li');
        previousItem.appendChild(document.createElement('a'));
        const nextItem = document.createElement('li');
        nextItem.appendChild(document.createElement('a'));
        const lastItem = document.createElement('li');
        lastItem.appendChild(document.createElement('a'));
        paginatorMock = [firstItem, previousItem, nextItem, lastItem] as any;
    });

    it(`debería instanciar el componente (título 'LostPets: Anuncios')`, () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Anuncios');
    });


    describe('recuperación de todos los anuncios de mascotas perdidas del sistema', () => {

        it(`debería recuperar el usuario en sesión (usuario) y todos los anuncios
            (habilitados) de mascotas perdidas del sistema`, async () => {
                const reloadPetPhotoSpy = spyOn(spectator.component, 'reloadPetPhoto');
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

                await spectator.component.ngOnInit();

                const component = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
                expect(component.updatedAd).toBeUndefined();
                expect(component.user).toEqual(user);
                expect(component.ads).toEqual(ads);
                expect(reloadPetPhotoSpy).toHaveBeenCalledWith(undefined, true);
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería recuperar el usuario en sesión (usuario) y todos los anuncios
            (filtrados los inhabilitados) de mascotas perdidas del sistema`, async () => {
                ads[0].adStatus = AdStatus.DISABLED;
                const reloadPetPhotoSpy = spyOn(spectator.component, 'reloadPetPhoto');
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

                await spectator.component.ngOnInit();

                const component = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
                expect(component.updatedAd).toBeUndefined();
                expect(component.user).toEqual(user);
                expect(component.ads).toEqual([ads[1]]);
                expect(reloadPetPhotoSpy).toHaveBeenCalledWith(undefined, true);
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería recuperar el usuario en sesión (administrador) y todos los anuncios
            (incluidos los inhabilitados) de mascotas perdidas del sistema`, async () => {
                user.role = Role.ADMIN;
                const reloadPetPhotoSpy = spyOn(spectator.component, 'reloadPetPhoto');
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

                await spectator.component.ngOnInit();

                const component = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
                expect(component.updatedAd).toBeUndefined();
                expect(component.user).toEqual(user);
                expect(component.ads).toEqual(ads);
                expect(reloadPetPhotoSpy).toHaveBeenCalledWith(undefined, true);
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no recuperar los anuncios de mascotas perdidas del
            sistema (error producido en el servidor)`, async () => {
                const serverError = {
                    error: {
                        field: 'campo',
                        code: '400',
                        exception: 'Exception',
                        message: 'Error producido en el servidor'
                    } as ExceptionResponse,
                    status: 400,
                    statusText: 'Bad Request'
                };

                const reloadPetPhotoSpy = spyOn(spectator.component, 'reloadPetPhoto');
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(AdService).getAds.andReturn(Promise.reject(serverError));

                await spectator.component.ngOnInit();

                const component = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
                expect(component.updatedAd).toBeUndefined();
                expect(component.user).toEqual(user);
                expect(component.ads).toBeUndefined();
                expect(reloadPetPhotoSpy).not.toHaveBeenCalled();
                expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });
    });


    describe('paginación de todos los anuncios de mascotas perdidas del sistema', () => {

        it(`debería paginar los anuncios de mascotas perdidas`, async () => {
            ads[0].adStatus = AdStatus.ENABLED;

            const getElementsByClassNameSpy = spyOn(document, 'getElementsByClassName');
            const checkPaginationComponentSpy = spyOn((spectator.component as any), 'checkPaginationComponent');
            checkPaginationComponentSpy.and.callThrough();

            getElementsByClassNameSpy.withArgs('page-item first-item').and.returnValue([paginatorMock[0]] as any);
            getElementsByClassNameSpy.withArgs('page-item previous-item').and.returnValue([paginatorMock[1]] as any);
            getElementsByClassNameSpy.withArgs('page-item next-item').and.returnValue([paginatorMock[2]] as any);
            getElementsByClassNameSpy.withArgs('page-item last-item').and.returnValue([paginatorMock[3]] as any);

            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
            expect(component.updatedAd).toBeUndefined();
            expect(component.user).toEqual(user);
            expect(component.ads).toEqual(ads);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

            spectator.component.onChangePage(ads);

            expect((spectator.component as any).pageOfAds).toEqual(ads);
            expect(checkPaginationComponentSpy).toHaveBeenCalled();
            expect(getElementsByClassNameSpy).toHaveBeenCalledTimes(4);
            expect(paginatorMock.map(element => element.firstChild.textContent))
                .toEqual(['Primero', 'Anterior', 'Siguiente', 'Último']);
        });

        it(`debería paginar los anuncios (vacío) de mascotas perdidas`, async () => {
            const getElementsByClassNameSpy = spyOn(document, 'getElementsByClassName');
            const checkPaginationComponentSpy = spyOn((spectator.component as any), 'checkPaginationComponent');
            checkPaginationComponentSpy.and.callThrough();

            getElementsByClassNameSpy.withArgs('page-item first-item').and.returnValue([paginatorMock[0]] as any);
            getElementsByClassNameSpy.withArgs('page-item previous-item').and.returnValue([paginatorMock[1]] as any);
            getElementsByClassNameSpy.withArgs('page-item next-item').and.returnValue([paginatorMock[2]] as any);
            getElementsByClassNameSpy.withArgs('page-item last-item').and.returnValue([paginatorMock[3]] as any);

            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAds.andReturn(Promise.resolve([]));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
            expect(component.updatedAd).toBeUndefined();
            expect(component.user).toEqual(user);
            expect(component.ads).toEqual([]);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

            spectator.component.onChangePage([]);

            expect((spectator.component as any).pageOfAds).toEqual([]);
            expect(checkPaginationComponentSpy).toHaveBeenCalled();
            expect(getElementsByClassNameSpy).not.toHaveBeenCalled();
            paginatorMock.forEach(element => {
                expect(element.firstChild.textContent).toEqual('');
            });
        });
    });


    describe('actualización de las imagenes de los anuncios de mascotas perdidas modificados', () => {

        it(`debería actualizar la imagen de un determinado anuncio con la imagen por defecto (placeholder)`, fakeAsync(async () => {
            const photo = ads[0].photo;
            (spectator.component as any).route = activatedRouteMock;
            (spectator.component as any).updatedAd = ads[0].code;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

            await spectator.component.ngOnInit();
            queryParamsMock.next({ updatedAd: 'true', code: ads[0].code });

            const component = spectator.component as any;
            const updatedAd = component.ads[0];
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
            expect(component.updatedAd).toEqual(ads[0].code);
            expect(component.user).toEqual(user);
            expect(component.ads).toEqual(ads);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            expect(updatedAd.photo).toEqual(component.PET_IMAGE_URL_PLACEHOLDER);

            tick(5000);
            spectator.component.reloadPetPhoto(ads[0].code);
            expect((spectator.component as any).ads[0].photo).toEqual(component.PET_IMAGE_URL_PLACEHOLDER);
            tick(2500);
            expect((spectator.component as any).ads[0].photo).toContain(`${apiUrl}/${photo}?`);
        }));

        it(`debería actualizar la imagen de un determinado anuncio modificado por el usuario`, fakeAsync(async () => {
            const photo = ads[0].photo;
            (spectator.component as any).route = activatedRouteMock;
            (spectator.component as any).updatedAd = ads[0].code;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

            await spectator.component.ngOnInit();
            queryParamsMock.next({ updatedAd: 'true', code: ads[0].code });

            const component = spectator.component as any;
            const updatedAd = component.ads[0];
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
            expect(component.updatedAd).toEqual(ads[0].code);
            expect(component.user).toEqual(user);
            expect(component.ads).toEqual(ads);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            expect(updatedAd.photo).toEqual(component.PET_IMAGE_URL_PLACEHOLDER);

            tick(5000);
            expect((spectator.component as any).ads[0].photo).toContain(`${apiUrl}/${photo}?`);
        }));
    });


    describe('navegación por las diferentes pantallas', () => {

        it('debería navegar a la pantalla que permite visualizar los detalles de un determinado anuncio', async () => {
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

            await spectator.component.ngOnInit();
            spectator.component.goToAdDetail(ads[0]);

            expect(routerNavigateSpy).toHaveBeenCalledWith(['/ad-detail', ads[0].code]);
        });

        it('debería navegar a la pantalla que permite modificar los detalles de un determinado anuncio', async () => {
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAds.andReturn(Promise.resolve(ads));

            await spectator.component.ngOnInit();
            spectator.component.goToUpdateAd(ads[0]);

            expect(routerNavigateSpy)
                .toHaveBeenCalledWith(['/update-ad', ads[0].code], { queryParams: { from: '/ads' } });
        });
    });


    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
