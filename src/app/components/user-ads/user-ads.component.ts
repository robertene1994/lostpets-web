import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';
import { AdService } from '../../shared/services/ad/ad.service';

import { User } from '../../shared/model/user';
import { Ad } from '../../shared/model/ad';
import { AdStatus } from 'src/app/shared/model/types/ad-status';

import {
    apiUrl, imageReloadIntervalMillis,
    imageUpdateReloadIntervalMillis
} from 'src/app/app.config';

/**
 * Componente que se encarga de manejar todos los anuncios de mascotas perdidas
 * publicados por un determinado usuario.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-user-ads',
    templateUrl: './user-ads.component.html',
    styleUrls: ['./user-ads.component.css']
})
export class UserAdsComponent implements OnInit {

    private readonly PET_IMAGE_URL_PLACEHOLDER = '/assets/pet-image-placeholder.svg';

    private updatedAd: string;
    private user: User;
    private userAds: Ad[];
    private pageOfUserAds: Ad[];

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
        this.title.setTitle('LostPets: Mis Anuncios');
        this.spinnerService.showSpinner();
        this.checkQueryParams();
        this.user = await this.userService.getLoggedUser();
        await this.getUserAds();
        this.spinnerService.hideSpinner();
    }

    async getUserAds() {
        const userAds = await this.adService.getUserAds(this.user.id)
            .catch(err => this.errorHandlerService.handleError(err));
        if (userAds) {
            userAds.forEach(ad => ad.photo = `${apiUrl}/${ad.photo}`);
            this.userAds = userAds;
            this.reloadPetPhoto(this.updatedAd, true);
            if (this.userAds.some(ad => ad.adStatus === AdStatus.DISABLED)) {
                this.notificationsService.showWarn('Mis Anuncios',
                    `¡Alguno de los anuncios que ha publicado ha sido
                    inhabilitado por incumplir las normas de la comunidad!`);
            }
            if (this.userAds.length === 0) {
                this.notificationsService.showInfo('Mis Anuncios',
                    '¡No ha publicado ningún anuncio aún!');
            }
        }
    }

    reloadPetPhoto(code: string, isUpdate?: boolean) {
        if (code) {
            this.userAds.find(ad => {
                if (ad.code === code) {
                    const photo = ad.photo.indexOf('?') !== -1
                        ? ad.photo.substr(0, ad.photo.indexOf('?')) : ad.photo;
                    ad.photo = this.PET_IMAGE_URL_PLACEHOLDER;
                    setTimeout(() => {
                        ad.photo = `${photo}?${new Date().getTime()}`;
                    }, !isUpdate ? imageReloadIntervalMillis : imageUpdateReloadIntervalMillis);
                }
            });
        }
    }

    goToAdDetail(ad: Ad) {
        this.router.navigate(['/ad-detail', ad.code]);
    }

    goToUpdateAd(ad: Ad) {
        this.router.navigate(['/update-ad', ad.code],
            { queryParams: { from: '/user-ads' } });
    }

    onChangePage(pageOfUserAds: Ad[]) {
        this.checkPaginationComponent();
        this.pageOfUserAds = pageOfUserAds;
    }

    private checkPaginationComponent() {
        if (this.userAds && this.userAds.length > 0) {
            document.getElementsByClassName('page-item first-item')[0]
                .firstChild.textContent = 'Primero';
            document.getElementsByClassName('page-item previous-item')[0]
                .firstChild.textContent = 'Anterior';
            document.getElementsByClassName('page-item next-item')[0]
                .firstChild.textContent = 'Siguiente';
            document.getElementsByClassName('page-item last-item')[0]
                .firstChild.textContent = 'Último';
        }
    }

    private checkQueryParams() {
        this.route.queryParams.subscribe((params: Params) => {
            const updatedAd = params.updatedAd;
            const code = params.code;
            if (updatedAd && updatedAd === 'true' && code) {
                this.updatedAd = code;
            }
        });
    }
}
