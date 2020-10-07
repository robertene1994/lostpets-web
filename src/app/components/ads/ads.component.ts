import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { UserService } from '../../shared/services/user/user.service';
import { AdService } from '../../shared/services/ad/ad.service';

import { User } from '../../shared/model/user';
import { Ad } from '../../shared/model/ad';
import { Role } from 'src/app/shared/model/types/role';
import { AdStatus } from 'src/app/shared/model/types/ad-status';

import { apiUrl, imageReloadIntervalMillis, imageUpdateReloadIntervalMillis } from 'src/app/app.config';

/**
 * Componente que se encarga de manejar todos los anuncios de mascotas perdidas
 * publicados por los usuarios.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-ads',
    templateUrl: './ads.component.html',
    styleUrls: ['./ads.component.css'],
})
export class AdsComponent implements OnInit {
    private readonly PET_IMAGE_URL_PLACEHOLDER = '/assets/pet-image-placeholder.svg';

    private updatedAd: string;
    private user: User;
    private ads: Ad[];
    private pageOfAds: Ad[];

    constructor(
        private title: Title,
        private router: Router,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private userService: UserService,
        private adService: AdService
    ) {}

    async ngOnInit() {
        this.title.setTitle('LostPets: Anuncios');
        this.spinnerService.showSpinner();
        this.checkQueryParams();
        this.user = await this.userService.getLoggedUser();
        await this.getAds();
        this.spinnerService.hideSpinner();
    }

    async getAds() {
        const ads = await this.adService.getAds().catch((err) => this.errorHandlerService.handleError(err));
        if (ads) {
            ads.forEach((ad) => (ad.photo = `${apiUrl}/${ad.photo}`));
            this.ads = ads;
            this.reloadPetPhoto(this.updatedAd, true);
            if (this.user.role !== Role.ADMIN) {
                this.ads = ads.filter((ad) => ad.adStatus === AdStatus.ENABLED);
            } else {
                this.ads = ads;
            }
        }
    }

    reloadPetPhoto(code: string, isUpdate?: boolean) {
        if (code) {
            const ad = this.ads.find((userAd) => userAd.code === code);
            if (ad) {
                const photo = ad.photo.indexOf('?') !== -1 ? ad.photo.substr(0, ad.photo.indexOf('?')) : ad.photo;
                ad.photo = this.PET_IMAGE_URL_PLACEHOLDER;
                setTimeout(
                    () => {
                        ad.photo = `${photo}?${new Date().getTime()}`;
                    },
                    !isUpdate ? imageReloadIntervalMillis : imageUpdateReloadIntervalMillis
                );
            }
        }
    }

    goToAdDetail(ad: Ad) {
        this.router.navigate(['/ad-detail', ad.code]);
    }

    goToUpdateAd(ad: Ad) {
        this.router.navigate(['/update-ad', ad.code], { queryParams: { from: '/ads' } });
    }

    onChangePage(pageOfAds: Ad[]) {
        this.checkPaginationComponent();
        this.pageOfAds = pageOfAds;
    }

    private checkPaginationComponent() {
        if (this.ads && this.ads.length > 0) {
            document.getElementsByClassName('page-item first-item')[0].firstChild.textContent = 'Primero';
            document.getElementsByClassName('page-item previous-item')[0].firstChild.textContent = 'Anterior';
            document.getElementsByClassName('page-item next-item')[0].firstChild.textContent = 'Siguiente';
            document.getElementsByClassName('page-item last-item')[0].firstChild.textContent = 'Último';
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
