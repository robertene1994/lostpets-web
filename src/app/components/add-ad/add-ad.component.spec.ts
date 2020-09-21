import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Params } from '@angular/router';
import { Subject } from 'rxjs';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { AddAdComponent } from './add-ad.component';

import { SpinnerService } from './../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from './../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';
import { UserService } from './../../shared/services/user/user.service';
import { AdService } from './../../shared/services/ad/ad.service';

import { User } from './../../shared/model/user';
import { Ad } from './../../shared/model/ad';
import { Pet } from './../../shared/model/pet';
import { ExceptionResponse } from './../../shared/model/exception-response';
import { AdStatus } from './../../shared/model/types/ad-status';
import { PetStatus } from './../../shared/model/types/pet-status';
import { LatLng } from './../../shared/model/lat-lng';
import { Role } from './../../shared/model/types/role';
import { UserStatus } from './../../shared/model/types/user-status';
import { Sex } from './../../shared/model/types/sex';

import { apiUrl } from './../../app.config';

/**
 * Grupo de especificaciones (specs) que describe los test unitarios y de integración
 * para el componente `AddAdComponent`.
 *
 * @author Robert Ene
 */
describe('AddAdComponent', () => {

    let queryParamsMock: Subject<Params>;
    let activatedRouteMock: any;
    let geolocationPermissionMock: any;
    let geolocationPositionMock: any;
    let googleMapMock: any;
    let routerNavigateSpy: jasmine.Spy<jasmine.Func>;
    let getElementsByNameSpy: jasmine.Spy<jasmine.Func>;

    const createAddAdComponent = createComponentFactory({
        component: AddAdComponent,
        imports: [
            RouterTestingModule
        ],
        providers: [
            SpinnerService
        ],
        mocks: [
            ErrorHandlerService,
            NotificationsService,
            UserService,
            AdService
        ],
        schemas: [NO_ERRORS_SCHEMA]
    });
    let spectator: Spectator<AddAdComponent>;

    let user: User;
    let ad: Ad;

    beforeAll(() => {
        user = {
            id: 22, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        ad = {
            id: 888, code: 'CODE888', date: new Date('05/01/2020').getTime(),
            adStatus: AdStatus.ENABLED, petStatus: PetStatus.LOST,
            reward: 100.00, lastSpottedCoords: {
                latitude: 43.361914,
                longitude: -5.84938
            } as LatLng, pet: {
                name: 'Otto', type: 'Perro', race: 'Yorkshire',
                sex: Sex.MALE, colour: 'Marrón y negro',
                microchipId: '18236919'
            } as Pet, observations: 'Muy asustado',
            photo: 'CODE888.jpg', user
        } as Ad;
    });

    beforeEach(() => {
        spectator = createAddAdComponent();

        queryParamsMock = new Subject<Params>();
        activatedRouteMock = {
            snapshot: {
                params: {
                    code: ad.code
                }
            },
            queryParams: queryParamsMock.asObservable()
        };
        geolocationPermissionMock = {
            state: 'granted'
        } as any;
        geolocationPositionMock = {
            coords: {
                latitude: 0,
                longitude: 0
            }
        } as any;
        googleMapMock = {
            controls: [{}, {}, {}, []],
            setOptions: (options: any) => {
                googleMapMock.options = options;
            },
            setCenter: (latLng: any) => {
                googleMapMock.center = latLng;
            },
            setZoom: (zoom: number) => {
                googleMapMock.zoom = zoom;
            }
        } as any;

        routerNavigateSpy = spyOn((spectator.component as any).router, 'navigate');
        spyOn((spectator.component as any).spinnerService, 'showSpinner');
        spyOn((spectator.component as any).spinnerService, 'hideSpinner');

        getElementsByNameSpy = spyOn(document, 'getElementsByName');
        getElementsByNameSpy.withArgs('date')
            .and.returnValue([{}, document.createElement('input')] as any);
        getElementsByNameSpy.withArgs('time')
            .and.returnValue([{}, document.createElement('input')] as any);

        spyOn(document, 'getElementById').withArgs('geolocationControl')
            .and.returnValue(document.createElement('input'));
    });

    it(`debería instanciar el componente (título 'LostPets: Nuevo Anuncio')`, async () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Nuevo Anuncio');
    });


    describe('inicialización del nuevo anuncio para su publicación', () => {

        it(`debería inicializar los detalles del nuevo anuncio para su publicación
            (geolocalización habilitada, foto del anuncio por defecto, calendario inicializado,
            mapa inicializado y centrado en la ubicación del usuario)`, async () => {
                (spectator.component as any).route = activatedRouteMock;
                spyOn(navigator.permissions, 'query').and.returnValue(Promise.resolve(geolocationPermissionMock));
                spyOn(navigator.geolocation, 'getCurrentPosition')
                    .and.callFake(successCallback => successCallback(geolocationPositionMock));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));

                await spectator.component.ngOnInit();

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.previousRoute).toBeUndefined();
                expect(componentSpy.geolocationEnabled).toBeTruthy();
                expect(componentSpy.currentGeolocation).toEqual(geolocationPositionMock);
                expect(componentSpy.ad).toBeDefined();
                expect(componentSpy.ad.user).toEqual(user);
                expect(componentSpy.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
                expect(componentSpy.petImageUrl).toEqual(componentSpy.PET_IMAGE_URL_PLACEHOLDER);
                expect(componentSpy.petImage).toBeUndefined();
                expect(componentSpy.esCalendar).toBeDefined();
                expect(componentSpy.date).toBeDefined();
                expect(componentSpy.minDate).toBeDefined();
                expect(componentSpy.maxDate).toBeDefined();
                expect(spectator.component.apiUrl).toEqual(apiUrl);
                expect(spectator.component.checkValidTime()).toBeTruthy();
                expect(spectator.component.checkInvalidTime()).toBeFalsy();
                expect(componentSpy.checkValidAd()).toBeFalsy();
                expect(spectator.component.saveAdButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                await spectator.component.onMapReady(googleMapMock);

                componentSpy = spectator.component as any;
                const currentGeolocation = componentSpy.currentGeolocation;
                expect(componentSpy.map).toEqual(googleMapMock);
                expect(componentSpy.map.options).toBeDefined();
                expect(componentSpy.map.controls).toBeDefined();
                expect(componentSpy.map.controls[3]).not.toHaveLength(0);
                expect(componentSpy.map.center.lat).toEqual(currentGeolocation.coords.latitude);
                expect(componentSpy.map.center.lng).toEqual(currentGeolocation.coords.longitude);
                expect(componentSpy.map.zoom).toEqual(16);
            });
    });


    describe('publicación de un nuevo anuncio', () => {

        it(`debería permitir la publicación de un nuevo anuncio (datos válidos)`, async () => {
            geolocationPermissionMock.state = 'prompt';
            (spectator.component as any).route = activatedRouteMock;
            spyOn(navigator.permissions, 'query').and.returnValue(Promise.resolve(geolocationPermissionMock));
            spyOn(navigator.geolocation, 'getCurrentPosition')
                .and.callFake(successCallback => successCallback(geolocationPositionMock));
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).saveAd.andReturn(Promise.resolve(true));

            await spectator.component.ngOnInit();
            queryParamsMock.next({ from: '/ads' });
            spectator.component.onMapReady(googleMapMock);

            let componentSpy = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(componentSpy.previousRoute).toEqual('/ads');
            expect(componentSpy.geolocationEnabled).toBeTruthy();
            expect(componentSpy.currentGeolocation).toEqual(geolocationPositionMock);
            expect(spectator.inject(NotificationsService).showWarn).toHaveBeenCalled();
            expect(componentSpy.ad).toBeDefined();
            expect(componentSpy.ad.user).toEqual(user);
            expect(componentSpy.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
            expect(componentSpy.petImageUrl).toEqual(componentSpy.PET_IMAGE_URL_PLACEHOLDER);
            expect(componentSpy.checkValidAd()).toBeFalsy();
            expect(spectator.component.saveAdButtonState()).toBeTruthy();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            expect(componentSpy.map).toEqual(googleMapMock);

            spectator.component.onSelectAdDate(new Date(ad.date));

            const mapEvent = {
                coords: {
                    lat: ad.lastSpottedCoords.latitude,
                    lng: ad.lastSpottedCoords.longitude
                }
            } as any;
            spectator.component.onMapClick(mapEvent);
            spectator.component.onMarkerDragEnd(mapEvent);

            await spectator.component.onSelectPetImage({
                target: {
                    files: [new File(['petImageFile.jpg'], 'petImageFile.jpg')]
                }
            });

            (spectator.component as any).ad = ad;
            spectator.detectChanges();

            componentSpy = spectator.component as any;
            expect(spectator.component.checkValidTime()).toBeTruthy();
            expect(spectator.component.checkInvalidTime()).toBeFalsy();
            expect(componentSpy.checkValidAd()).toBeTruthy();
            expect(spectator.component.saveAdButtonState()).toBeFalsy();

            await spectator.component.saveAd();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/ads'],
                { queryParams: { savedAd: true } });
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

            (spectator.component as any).previousRoute = undefined;
            spectator.detectChanges();

            await spectator.component.saveAd();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(routerNavigateSpy).toHaveBeenCalledTimes(1);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no permitir la publicación del nuevo anuncio (geolocalización inhabilitada,
            localización por defecto, error al obtener la localización del usuario, datos inválidos)`, async () => {
                (spectator.component as any).route = activatedRouteMock;
                geolocationPermissionMock.state = 'denied';
                spyOn(navigator.permissions, 'query').and.returnValue(Promise.resolve(geolocationPermissionMock));
                spyOn(navigator.geolocation, 'getCurrentPosition')
                    .and.callFake((_, errorCallback: any) => errorCallback());
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));

                await spectator.component.ngOnInit();
                await spectator.component.onMapReady(googleMapMock);
                await spectator.component.getCurrentGeolocation();

                let componentSpy = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(componentSpy.geolocationEnabled).toBeFalsy();
                expect(componentSpy.currentGeolocation).toBeDefined();
                expect(componentSpy.currentGeolocation.coords.latitude).toEqual(43.36029);
                expect(componentSpy.currentGeolocation.coords.longitude).toEqual(-5.84476);
                expect(spectator.inject(NotificationsService).showWarn).toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
                expect(componentSpy.ad).toBeDefined();
                expect(componentSpy.ad.user).toEqual(user);
                expect(componentSpy.PET_IMAGE_URL_PLACEHOLDER).toBeDefined();
                expect(componentSpy.petImageUrl).toEqual(componentSpy.PET_IMAGE_URL_PLACEHOLDER);
                expect(componentSpy.checkValidAd()).toBeFalsy();
                expect(spectator.component.saveAdButtonState()).toBeTruthy();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();

                (spectator.component as any).ad.petStatus = undefined;
                (spectator.component as any).ad.pet.name = '';
                (spectator.component as any).ad.reward = -1;
                spectator.detectChanges();

                componentSpy = spectator.component as any;
                expect(spectator.component.checkEmptyField(componentSpy.ad.pet.name)).toBeTruthy();
                expect(spectator.component.checkValidField(componentSpy.ad.pet.name)).toBeFalsy();
                expect(spectator.component.checkEmptyField(componentSpy.ad.pet.race)).toBeUndefined();
                expect(spectator.component.checkValidField(componentSpy.ad.pet.race)).toBeUndefined();
                expect(spectator.component.checkValidReward()).toBeFalsy();
                expect(spectator.component.checkInvalidReward()).toBeTruthy();

                (spectator.component as any).ad.reward = undefined;
                spectator.detectChanges();

                expect(spectator.component.checkValidReward()).toBeUndefined();
                expect(spectator.component.checkInvalidReward()).toBeUndefined();
                expect(componentSpy.checkValidAd()).toBeFalsy();
                expect(spectator.component.saveAdButtonState()).toBeTruthy();

                await spectator.component.saveAd();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(routerNavigateSpy).not.toHaveBeenCalled();
                expect(spectator.inject(NotificationsService).showError).toHaveBeenCalled();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });

        it(`debería no permitir la publicación del nuevo anuncio (error al cargar la foto para el anuncio,
            fecha del anuncio, error en la geolocalización del usuario en sesión) `, async () => {
                (spectator.component as any).route = activatedRouteMock;
                spyOn(navigator.permissions, 'query').and.returnValue(Promise.resolve(geolocationPermissionMock));
                spyOn(navigator.geolocation, 'getCurrentPosition')
                    .and.callFake(successCallback => successCallback(geolocationPositionMock));
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));

                await spectator.component.ngOnInit();
                await spectator.component.onMapReady(googleMapMock);

                spyOnProperty(navigator, 'geolocation').and.returnValue(undefined);
                (spectator.component as any).geolocationEnabled = false;
                spectator.detectChanges();

                await spectator.component.getCurrentGeolocation();
                await spectator.component.centerOnCurrentLocation();

                getElementsByNameSpy.withArgs('date').and.returnValue([{}, undefined] as any);
                getElementsByNameSpy.withArgs('time').and.returnValue([{}, undefined] as any);
                (spectator.component as any).date = new Date('01/01/2020');
                spectator.detectChanges();

                expect(spectator.component.checkValidTime()).toBeTruthy();
                expect(spectator.component.checkInvalidTime()).toBeFalsy();

                let petImageFile = new File(['petImageFile.jpg'], 'petImageFile.jpg');

                await spectator.component.onSelectPetImage({
                    target: {
                        files: [petImageFile]
                    }
                });

                const componentSpy = spectator.component as any;
                expect(componentSpy.petImageUrl).toBeDefined();
                expect(componentSpy.petImage).toEqual(petImageFile);
                expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();

                petImageFile = new File(['file.txt'], 'file.txt');
                await spectator.component.onSelectPetImage({
                    target: {
                        files: [petImageFile]
                    }
                });

                expect(spectator.inject(NotificationsService).showWarn).toHaveBeenCalled();

                await spectator.component.onSelectPetImage({
                    target: {}
                });

                getElementsByNameSpy.withArgs('time').and.returnValue([{}, undefined] as any);
                const adDate = new Date(componentSpy.minDate);
                adDate.setDate(componentSpy.date.getDate() - 1);
                (spectator.component as any).date = adDate;
                spectator.detectChanges();

                expect(spectator.component.checkValidTime()).toBeFalsy();
                expect(spectator.component.checkInvalidTime()).toBeTruthy();

                getElementsByNameSpy.withArgs('time')
                    .and.returnValue([{}, document.createElement('input')] as any);

                expect(spectator.component.checkValidTime()).toBeFalsy();
                expect(spectator.component.checkInvalidTime()).toBeTruthy();
            });

        it(`debería no permitir la publicación del nuevo anuncio (error producido en el servidor)`, async () => {
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

            (spectator.component as any).route = activatedRouteMock;
            spyOn(navigator.permissions, 'query').and.returnValue(Promise.resolve(geolocationPermissionMock));
            spyOn(navigator.geolocation, 'getCurrentPosition')
                .and.callFake(successCallback => successCallback(geolocationPositionMock));
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).saveAd.andReturn(Promise.reject(serverError));

            await spectator.component.ngOnInit();
            queryParamsMock.next({ from: '/ads' });
            spectator.component.onMapReady(googleMapMock);

            const petImageFile = new File(['petImageFile.jpg'], 'petImageFile.jpg');
            await spectator.component.onSelectPetImage({
                target: {
                    files: [petImageFile]
                }
            });

            (spectator.component as any).ad = ad;
            (spectator.component as any).currentGeolocation = undefined;
            spectator.detectChanges();

            await spectator.component.centerOnCurrentLocation();

            const componentSpy = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(componentSpy.previousRoute).toEqual('/ads');
            expect(componentSpy.geolocationEnabled).toBeTruthy();
            expect(componentSpy.currentGeolocation).toBeUndefined();
            expect(componentSpy.ad).toEqual(ad);
            expect(componentSpy.petImageUrl).toBeDefined();
            expect(componentSpy.petImage).toEqual(petImageFile);
            expect(componentSpy.checkValidAd()).toBeTruthy();
            expect(spectator.component.saveAdButtonState()).toBeFalsy();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            expect(componentSpy.map).toEqual(googleMapMock);

            await spectator.component.saveAd();

            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });
    });


    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
