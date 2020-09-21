import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { AdDetailComponent } from './ad-detail.component';

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
 * para el componente `AdDetailComponent`.
 *
 * @author Robert Ene
 */
describe('AdDetailComponent', () => {

    let activatedRouteMock: any;
    let routerNavigateSpy: jasmine.Spy<jasmine.Func>;

    const createAdDetailComponent = createComponentFactory({
        component: AdDetailComponent,
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
    let spectator: Spectator<AdDetailComponent>;

    let user: User;
    let ad: Ad;

    beforeAll(() => {
        user = {
            id: 44, email: 'username@email.com',
            password: 'username', role: Role.USER,
            status: UserStatus.ENABLED, phone: '669910272',
            firstName: 'UserName', lastName: 'LastName'
        } as User;

        ad = {
            id: 888, code: 'CODE888', date: new Date().getTime(),
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
        spectator = createAdDetailComponent();

        activatedRouteMock = (spectator.component as any).route = {
            snapshot: {
                params: {
                    code: ad.code
                }
            }
        };

        routerNavigateSpy = spyOn((spectator.component as any).router, 'navigate');
        spyOn((spectator.component as any).spinnerService, 'showSpinner');
        spyOn((spectator.component as any).spinnerService, 'hideSpinner');
    });

    it(`debería instanciar el componente (título 'LostPets: Detalle del Anuncio')`, async () => {
        expect(spectator.component).toBeTruthy();
        expect(spectator.inject(Title).getTitle()).toEqual('LostPets: Detalle del Anuncio');
    });


    describe('recuperación del detalle de un determinado anuncio', () => {

        it(`debería recuperar el detalle de un determinado anuncio (habilitado) dado
            su código e inicializar el mapa`, async () => {
                const googleMapMock = {
                    setOptions: (options: any) => {
                        googleMapMock.options = options;
                    }
                } as any;
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));

                await spectator.component.ngOnInit();
                spectator.component.onMapReady(googleMapMock);

                const component = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(component.ad).toEqual(ad);
                expect(component.adStatus).toBeTruthy();
                expect(routerNavigateSpy).not.toHaveBeenCalled();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
                expect((spectator.component as any).map).toEqual(googleMapMock);
                expect((spectator.component as any).map.options).toBeDefined();
            });

        it(`debería recuperar el detalle de un determinado anuncio (inhabilitado) dado su código`, async () => {
            ad.adStatus = AdStatus.DISABLED;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.ad).toEqual(ad);
            expect(component.adStatus).toBeFalsy();
            expect(routerNavigateSpy).not.toHaveBeenCalled();
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no recuperar el detalle del anuncio (código inexistente)`, async () => {
            (spectator.component as any).route.snapshot.params.code = undefined;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.ad).toBeUndefined();
            expect(component.adStatus).toBeUndefined();
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/ads']);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no recuperar el detalle del anuncio (código inválido)`, async () => {
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(undefined));

            await spectator.component.ngOnInit();

            const component = spectator.component as any;
            expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
            expect(component.ad).toBeUndefined();
            expect(component.adStatus).toBeUndefined();
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/ads']);
            expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
        });

        it(`debería no recuperar el detalle de un determinado anuncio dado
            su código (error producido en el servidor)`, async () => {
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
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(AdService).getAdDetail.andReturn(Promise.reject(serverError));
                spectator.detectChanges();

                await spectator.component.ngOnInit();

                const component = spectator.component as any;
                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(component.ad).toBeUndefined();
                expect(component.adStatus).toBeUndefined();
                expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
                expect(routerNavigateSpy).toHaveBeenCalledWith(['/ads']);
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });
    });


    describe('navegación por las diferentes pantallas y acciones', () => {

        it('debería navegar a la pantalla que permite modificar los detalles del anuncio', async () => {
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));

            await spectator.component.ngOnInit();
            spectator.component.goToUpdateAd(ad);

            expect(routerNavigateSpy)
                .toHaveBeenCalledWith(['/update-ad', ad.code], { queryParams: { from: `/ad-detail/${ad.code}` } });
        });

        it('debería navegar a la pantalla de chats para permitir enviar un mensaje al propietario del anuncio', async () => {
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));

            await spectator.component.ngOnInit();
            spectator.component.goToChat(ad.user);

            expect(routerNavigateSpy).toHaveBeenCalledWith(['/user-chats', ad.user.id]);
        });

        it('debería permitir llamar al propietario del anuncio (dispositivo móvil)', async () => {
            spyOnProperty(navigator, 'userAgent').and.returnValue('Android');
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));

            await spectator.component.ngOnInit();
            spectator.component.makeCall(ad.user.phone);

            expect(spectator.component.apiUrl).toEqual(apiUrl);
            expect(spectator.component.isMobileDevice()).toBeTruthy();
            expect(location.href).toBeDefined();
        });

        it('debería permitir enviar un correco electrónico al propietario del anuncio (dispositivo móvil)', async () => {
            spyOnProperty(navigator, 'userAgent').and.returnValue('Android');
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));

            await spectator.component.ngOnInit();
            spectator.component.sendEmail(ad.user.email);

            expect(spectator.component.apiUrl).toEqual(apiUrl);
            expect(spectator.component.isMobileDevice()).toBeTruthy();
            expect(location.href).toBeDefined();
        });
    });


    describe('actualización del estado de un determinado anuncio', () => {

        it('debería habilitar el anuncio para el que se muestra los detalles', async () => {
            ad.adStatus = AdStatus.DISABLED;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));
            spectator.inject(AdService).updateAdStatus.andReturn(Promise.resolve(true));

            await spectator.component.ngOnInit();
            await spectator.component.updateAdStatus();

            const component = spectator.component as any;
            expect(component.ad.adStatus).toEqual(AdStatus.ENABLED);
            expect(spectator.inject(AdService).updateAdStatus)
                .toHaveBeenCalledWith(ad.code, AdStatus.ENABLED);
            expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();
        });

        it('debería inhabilitar el anuncio para el que se muestra los detalles', async () => {
            ad.adStatus = AdStatus.ENABLED;
            spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
            spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));
            spectator.inject(AdService).updateAdStatus.andReturn(Promise.resolve(true));

            await spectator.component.ngOnInit();
            await spectator.component.updateAdStatus();

            const component = spectator.component as any;
            expect(component.ad.adStatus).toEqual(AdStatus.DISABLED);
            expect(spectator.inject(AdService).updateAdStatus)
                .toHaveBeenCalledWith(ad.code, AdStatus.DISABLED);
            expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();
        });

        it(`debería no modificar el estado del anuncio para el que se muestra
            los detalles (error producido en el servidor)`, async () => {
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
                spectator.inject(UserService).getLoggedUser.andReturn(Promise.resolve(user));
                spectator.inject(AdService).getAdDetail.andReturn(Promise.resolve(ad));
                spectator.inject(AdService).updateAdStatus.andReturn(Promise.reject(serverError));

                await spectator.component.ngOnInit();
                await spectator.component.updateAdStatus();

                expect(spectator.inject(SpinnerService).showSpinner).toHaveBeenCalled();
                expect(spectator.inject(ErrorHandlerService).handleError).toHaveBeenCalledWith(serverError);
                expect(spectator.inject(NotificationsService).showInfo).toHaveBeenCalled();
                expect(spectator.inject(SpinnerService).hideSpinner).toHaveBeenCalled();
            });
    });


    afterEach(() => {
        spectator.fixture.nativeElement.style.display = 'none';
        spectator.fixture.destroy();
    });
});
