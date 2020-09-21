import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Ad } from '../../model/ad';
import { AdStatus } from '../../model/types/ad-status';

import { apiUrlAd } from 'src/app/app.config';

/**
 * Servicio para las operaciones sobre los anuncios (`Ad`).
 *
 * @author Robert Ene
 */
@Injectable()
export class AdService {

    constructor(
        private http: HttpClient) { }

    async getAds(): Promise<Ad[]> {
        return await this.http.get<Ad[]>(`${apiUrlAd}`).toPromise();
    }

    async getPetImage(imageUrl: string): Promise<File> {
        const petImage = await this.http.get(imageUrl, { responseType: 'blob' }).toPromise();
        return Promise.resolve(new File([petImage], imageUrl.substr(imageUrl.lastIndexOf('/') + 1)));
    }

    async getAdDetail(code: string): Promise<Ad> {
        return await this.http.get<Ad>(`${apiUrlAd}/${code}`).toPromise();
    }

    async getUserAds(id: number): Promise<Ad[]> {
        return await this.http.get<Ad[]>(`${apiUrlAd}/user/${id}`).toPromise();
    }

    async saveAd(ad: Ad, image: File): Promise<boolean> {
        const formData: FormData = new FormData();
        formData.append('ad', new Blob([JSON.stringify(ad)], { type: 'application/json' }), 'ad');
        formData.append('image', image, 'image');
        return await this.http.post<boolean>(apiUrlAd, formData).toPromise();
    }

    async updateAd(ad: Ad, image: File): Promise<boolean> {
        const formData: FormData = new FormData();
        formData.append('ad', new Blob([JSON.stringify(ad)], { type: 'application/json' }), 'ad');
        formData.append('image', image, 'image');
        return await this.http.put<boolean>(apiUrlAd, formData).toPromise();
    }

    async updateAdStatus(code: string, status: AdStatus): Promise<boolean> {
        return await this.http.put<boolean>(`${apiUrlAd}/adStatus/${code}`, null, {
            params: { status }
        }).toPromise();
    }
}
