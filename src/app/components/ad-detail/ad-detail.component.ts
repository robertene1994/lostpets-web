import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

import { GoogleMap } from '@agm/core/services/google-maps-types';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from 'src/app/shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';
import { AdService } from '../../shared/services/ad/ad.service';

import { Ad } from '../../shared/model/ad';
import { User } from 'src/app/shared/model/user';
import { AdStatus } from 'src/app/shared/model/types/ad-status';

import { apiUrl, mobileDevicePattern } from '../../app.config';

/**
 * Componente que se encarga de manejar el detalle de un determinado anuncio
 * de mascota perdida publicado por un usuario.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-ad-detail',
    templateUrl: './ad-detail.component.html',
    styleUrls: ['./ad-detail.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AdDetailComponent implements OnInit {

    private user: User;
    private ad: Ad;
    private map: GoogleMap;
    private adStatus: boolean;

    constructor(
        private title: Title,
        private router: Router,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private notificationsService: NotificationsService,
        private userService: UserService,
        private adService: AdService) { }

    async ngOnInit() {
        this.title.setTitle('LostPets: Detalle del Anuncio');
        this.spinnerService.showSpinner();
        this.user = await this.userService.getLoggedUser();
        await this.getAdDetail();
        this.spinnerService.hideSpinner();
    }

    async getAdDetail() {
        const code = this.route.snapshot.params.code;
        if (code) {
            const ad = await this.adService.getAdDetail(code)
                .catch(err => this.errorHandlerService.handleError(err));
            if (ad) {
                this.ad = ad;
                this.adStatus = this.ad.adStatus === AdStatus.ENABLED
                    ? true : false;
            } else {
                this.router.navigate(['/ads']);
            }
        } else {
            this.router.navigate(['/ads']);
        }
    }

    get apiUrl() {
        return apiUrl;
    }

    onMapReady(map: GoogleMap) {
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
    }

    makeCall(phone: string) {
        location.href = `tel:${phone}`;
    }

    sendEmail(email: string) {
        location.href = `mailto:${email}`;
    }

    goToUpdateAd(ad: Ad) {
        this.router.navigate(['/update-ad', ad.code],
            { queryParams: { from: `/ad-detail/${this.ad.code}` } });
    }

    goToChat(user: User) {
        this.router.navigate(['/user-chats', user.id]);
    }

    isMobileDevice() {
        return navigator.userAgent.match(mobileDevicePattern);
    }

    async updateAdStatus() {
        this.ad.adStatus = this.adStatus === true
            ? AdStatus.DISABLED : AdStatus.ENABLED;
        await this.adService.updateAdStatus(this.ad.code, this.ad.adStatus)
            .catch(err => this.errorHandlerService.handleError(err));
        this.notificationsService.showInfo('Detalle del Anuncio',
            '¡El estado del anuncio ha sido actualizado!');
    }
}
