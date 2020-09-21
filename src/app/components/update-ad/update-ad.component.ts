import { Component, ViewEncapsulation, OnInit, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { GoogleMap } from '@agm/core/services/google-maps-types';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from 'src/app/shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';
import { AdService } from '../../shared/services/ad/ad.service';

import { Ad } from '../../shared/model/ad';
import { User } from 'src/app/shared/model/user';
import { Role } from 'src/app/shared/model/types/role';

import { apiUrl } from '../../app.config';

/**
 * Componente que se encarga de manejar la modificación y actualización de
 * los datos de un determinado anuncio de mascota perdida.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-update-ad',
    templateUrl: './update-ad.component.html',
    styleUrls: ['./update-ad.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UpdateAdComponent implements OnInit {

    private previousRoute: string;
    private currentGeolocation: any;
    private geolocationEnabled: boolean;
    private map: GoogleMap;

    private esCalendar: any;
    private date: Date;
    private minDate: Date;
    private maxDate: Date;

    private petImageUrl: string | ArrayBuffer;
    private petImage: File;

    private user: User;
    private ad: Ad;

    constructor(
        private title: Title,
        private renderer: Renderer2,
        private router: Router,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private notificationsService: NotificationsService,
        private userService: UserService,
        private adService: AdService) { }

    async ngOnInit() {
        this.title.setTitle('LostPets: Modificar Anuncio');
        this.spinnerService.showSpinner();
        this.getPreviousRoute();
        this.checkLocationPermission();
        this.user = await this.userService.getLoggedUser();
        await this.getAdDetail();
        this.spinnerService.hideSpinner();
    }

    getPreviousRoute() {
        this.route.queryParams.subscribe((params: Params) => {
            const from = params.from;
            if (from) {
                this.previousRoute = `${from}`;
            }
        });
    }

    async getAdDetail() {
        const code = this.route.snapshot.params.code;
        if (code) {
            const ad = await this.adService.getAdDetail(code)
                .catch(err => this.errorHandlerService.handleError(err));
            if (ad) {
                if (ad.user.id === this.user.id || this.user.role === Role.ADMIN) {
                    this.ad = ad;
                    this.petImageUrl = `${apiUrl}/${ad.photo}`;
                    this.loadImageFromUrl();

                    this.initCalendar();
                    this.date = new Date(ad.date);
                    this.minDate = new Date(ad.date);
                    this.maxDate = new Date();
                } else {
                    this.router.navigate(['/ads']);
                }
            } else {
                this.router.navigate(['/ads']);
            }
        } else {
            this.router.navigate(['/ads']);
        }
    }

    async updateAd() {
        this.spinnerService.showSpinner();
        if (!this.checkValidAd()) {
            this.notificationsService.showError('Modificar Anuncio',
                '¡Por favor, revise todos los datos introducidos!');
        } else {
            const result = await this.adService.updateAd(this.ad, this.petImage)
                .catch(err => this.errorHandlerService.handleError(err));
            if (result) {
                if (this.previousRoute) {
                    this.router.navigate([this.previousRoute],
                        { queryParams: { updatedAd: true, code: this.ad.code } });
                }
            } else {
                this.notificationsService.showError('Modificar Anuncio',
                    '¡Ha ocurrido un error durante el proceso de modificación del anuncio!');
            }
        }
        this.spinnerService.hideSpinner();
    }

    onSelectPetImage(event: any) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (this.validImage(file)) {
                const reader = new FileReader();
                this.petImage = file;
                reader.readAsDataURL(this.petImage);
                reader.onload = () => {
                    this.petImageUrl = reader.result;
                };
                this.notificationsService.showInfo('Modificar Anuncio',
                    '¡La imagen de la mascota ha sido procesada correctamente!');
            } else {
                this.notificationsService.showWarn('Modificar Anuncio',
                    '¡Solo se permiten ficheros con las siguientes extensiones: JPG/JPEG/PNG!');
            }
        }
    }

    onMapReady(map: any) {
        this.map = map;
        this.map.setOptions({
            center: {
                lat: this.ad.lastSpottedCoords.latitude,
                lng: this.ad.lastSpottedCoords.longitude
            },
            zoom: 14,
            streetViewControl: false,
            mapTypeControl: false,
            clickableIcons: false
        });

        if (this.geolocationEnabled) {
            map.controls[3].push(document.getElementById('geolocationControl'));
        }
    }

    onMapClick(event: any) {
        this.ad.lastSpottedCoords.latitude = event.coords.lat;
        this.ad.lastSpottedCoords.longitude = event.coords.lng;
        this.notificationsService.showInfo('Modificar Anuncio',
            '¡La última ubicación conocida de la mascota ha sido actualizada!');
    }

    onMarkerDragEnd(event: any) {
        this.ad.lastSpottedCoords.latitude = event.coords.lat;
        this.ad.lastSpottedCoords.longitude = event.coords.lng;
        this.notificationsService.showInfo('Modificar Anuncio',
            '¡La última ubicación conocida de la mascota ha sido actualizada!');
    }

    centerOnCurrentLocation() {
        if (this.currentGeolocation) {
            this.map.setCenter({
                lat: this.currentGeolocation.coords.latitude,
                lng: this.currentGeolocation.coords.longitude
            });
            this.map.setZoom(16);
            if (this.geolocationEnabled) {
                this.renderer.addClass(document.getElementById('geolocationControl'),
                    'gogle-map-geolocation-activated');
            }
        }
    }

    checkLocationPermission() {
        navigator.permissions.query({
            name: 'geolocation'
        }).then(result => {
            switch (result.state) {
                case 'granted':
                    this.getCurrentGeolocation();
                    break;
                case 'prompt':
                    this.getCurrentGeolocation();
                    this.notificationsService.showWarn('Modificar Anuncio',
                        `¡La geolocalización es necesaria para determinar
                        la última ubicación conocida de la mascota!`);
                    break;
                case 'denied':
                    this.notificationsService.showWarn('Modificar Anuncio',
                        `¡La geolocalización es necesaria para determinar
                        la última ubicación conocida de la mascota!`);
                    break;
            }
        });
    }

    getCurrentGeolocation() {
        if (window.navigator && window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(position => {
                this.geolocationEnabled = true;
                this.currentGeolocation = position;
            }, () => {
                this.notificationsService.showError('Modificar Anuncio',
                    '¡La geolocalización no está disponible!');
            });
        }
    }

    onSelectAdDate(date: Date) {
        this.date.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    }

    checkValidTime() {
        const dateInput = document.getElementsByName('date')[1];
        if (dateInput) {
            this.renderer.addClass(dateInput, 'form-control');
            this.renderer.addClass(dateInput, 'is-valid');
        }

        const timeInput = document.getElementsByName('time')[1];
        if (this.minDate <= this.date && this.date <= this.maxDate) {
            this.ad.date = this.date.getTime();
            if (timeInput) {
                this.renderer.addClass(timeInput, 'form-control');
                this.renderer.addClass(timeInput, 'is-valid');
            }
            return true;
        } else {
            if (timeInput) {
                this.renderer.removeClass(timeInput, 'is-valid');
            }
            return false;
        }
    }

    checkInvalidTime() {
        const timeInput = document.getElementsByName('time')[1];
        if (this.date < this.minDate || this.date > this.maxDate) {
            if (timeInput) {
                this.renderer.addClass(timeInput, 'form-control');
                this.renderer.addClass(timeInput, 'is-invalid');
            }
            return true;
        } else {
            if (timeInput) {
                this.renderer.removeClass(timeInput, 'is-invalid');
            }
            return false;
        }
    }

    checkValidReward() {
        if (this.ad !== undefined && this.ad.reward !== undefined) {
            return this.ad.reward !== null && this.ad.reward >= 0;
        }
    }

    checkInvalidReward() {
        if (this.ad !== undefined && this.ad.reward !== undefined) {
            return this.ad.reward === null || this.ad.reward < 0;
        }
    }

    checkValidField(value: string) {
        return value && value.trim().length > 0;
    }

    checkEmptyField(value: string) {
        return value.trim().length === 0;
    }

    updateAdButtonState() {
        return !this.checkValidAd();
    }

    private checkValidAd() {
        if (!this.ad
            || !this.ad.pet
            || !this.ad.user
            || !this.ad.lastSpottedCoords
            || this.ad.lastSpottedCoords.latitude === undefined
            || this.ad.lastSpottedCoords.longitude === undefined
            || !this.petImage
            || !this.ad.petStatus
            || !this.checkValidReward()
            || !this.ad.date || !this.checkValidTime()
            || !this.checkValidField(this.ad.observations)
            || !this.checkValidField(this.ad.pet.name)
            || !this.checkValidField(this.ad.pet.type)
            || !this.checkValidField(this.ad.pet.race)
            || !this.checkValidField(this.ad.pet.sex)
            || !this.checkValidField(this.ad.pet.colour)
            || !this.checkValidField(this.ad.pet.microchipId)) {
            return false;
        }
        return true;
    }

    private initCalendar() {
        this.esCalendar = {
            firstDayOfWeek: 1,
            dayNames: ['domingo', 'lunes', 'martes',
                'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar',
                'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: ['enero', 'febrero', 'marzo', 'abril',
                'mayo', 'junio', 'julio', 'agosto', 'septiembre',
                'octubre', 'noviembre', 'diciembre'],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may',
                'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Borrar'
        };
    }

    private async loadImageFromUrl() {
        const petImage = await this.adService
            .getPetImage(this.petImageUrl.toString())
            .catch(err => this.errorHandlerService.handleError(err));
        if (petImage) {
            this.petImage = petImage;
        }
    }

    private validImage(file: File): boolean {
        const regExp = new RegExp('(.*?)\.(jpg|png|jpeg)$');
        return !regExp.test(file.name.toLowerCase()) ? false : true;
    }
}
