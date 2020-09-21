import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { JwtHelperService } from '@auth0/angular-jwt';

import * as CryptoJS from 'crypto-js';

import { AccountCredentials } from '../../model/account-credentials';
import { User } from '../../model/user';
import { UserStatus } from '../../model/types/user-status';

import { apiUrlUser } from '../../../app.config';

/**
 * Servicio para las operaciones sobre los usuarios (`User`).
 *
 * @author Robert Ene
 */
@Injectable()
export class UserService {

    private readonly USER = 'user';
    private readonly TOKEN = 'token';

    private jwtHelper: JwtHelperService;
    private user: User;

    constructor(
        private http: HttpClient) {
        this.jwtHelper = new JwtHelperService();
        this.loadUserFromLocalStorage().then(user => {
            this.user = user;
            if (this.user) {
                this.checkUserStatus(this.user.email).then(userStatus => {
                    if (this.user) {
                        this.user.status = userStatus;
                    }
                });
            }
        });
    }

    async getUsers(): Promise<User[]> {
        return await this.http.get<User[]>(`${apiUrlUser}`).toPromise();
    }

    async getUserById(id: number): Promise<User> {
        return await this.http.get<User>(`${apiUrlUser}/${id}`).toPromise();
    }

    async logIn(account: AccountCredentials): Promise<void> {
        const response = await this.http.post(`${apiUrlUser}/logIn`, JSON.stringify(account), {
            observe: 'response'
        }).toPromise();
        const token = response.headers.get('Authorization');
        if (token) {
            this.saveToken(token);
            await this.loadUserDetails(account);
        } else {
            throw new Error(JSON.stringify({
                summary: 'Iniciar Sesión',
                detail: '¡Correo electrónico o contraseña inválidos!'
            }));
        }
    }

    async checkUniqueEmail(email: string): Promise<boolean> {
        return await this.http.get<boolean>(`${apiUrlUser}/uniqueEmail`, {
            params: { email }
        }).toPromise();
    }

    async checkUserStatus(email: string): Promise<UserStatus> {
        return await this.http.get<UserStatus>(`${apiUrlUser}/userStatus`, {
            params: { email }
        }).toPromise();
    }

    async signUp(user: User): Promise<User> {
        return await this.http.post<User>(`${apiUrlUser}`, JSON.stringify(user), {
            headers: { 'Content-Type': 'application/json' }
        }).toPromise();
    }

    async updateUser(user: User): Promise<User> {
        return await this.http.put<User>(`${apiUrlUser}`, JSON.stringify(user), {
            headers: { 'Content-Type': 'application/json' }
        }).toPromise();
    }

    async updateUserStatus(email: string, status: UserStatus): Promise<boolean> {
        return await this.http.put<boolean>(`${apiUrlUser}/userStatus`, null, {
            params: { email, status }
        }).toPromise();
    }

    async checkValidUserPassword(account: AccountCredentials): Promise<boolean> {
        return await this.http.post<boolean>(`${apiUrlUser}/validPassword`, JSON.stringify(account), {
            headers: { 'Content-Type': 'application/json' }
        }).toPromise();
    }

    async getLoggedUser(): Promise<User> {
        if (!this.user) {
            this.user = await this.loadUserFromLocalStorage();
            if (this.user) {
                this.user.status = await this.checkUserStatus(this.user.email);
            }
            return Promise.resolve(this.user);
        } else {
            this.user.status = await this.checkUserStatus(this.user.email);
            return Promise.resolve(this.user);
        }
    }

    updateLoggedUser(user: User) {
        this.user = user;
        this.saveUserToLocalStorage(user);
    }

    getLoggedUserSync() {
        return this.user;
    }

    isUserLoggedIn(): boolean {
        return this.user && this.getToken() && !this.isTokenExpired();
    }

    isTokenExpired() {
        return this.jwtHelper.isTokenExpired(this.getToken());
    }

    getToken() {
        return localStorage.getItem(this.TOKEN);
    }

    logOut() {
        this.user = undefined;
        localStorage.removeItem(this.TOKEN);
        localStorage.removeItem(this.USER);
    }

    private async loadUserDetails(account: AccountCredentials) {
        this.user = await this.http.get<User>(`${apiUrlUser}/userDetails`, {
            params: { email: account.email }
        }).toPromise();
        this.saveUserToLocalStorage(this.user);
    }

    async saveUserToLocalStorage(user: User) {
        const token = this.getToken();
        if (token) {
            const encodedUser = CryptoJS.AES.encrypt(JSON.stringify(user), token);
            localStorage.setItem(this.USER, JSON.stringify(encodedUser.toString()));
        }
    }

    private saveToken(token: string) {
        localStorage.setItem(this.TOKEN, JSON.stringify(token));
    }

    private async loadUserFromLocalStorage(): Promise<User> {
        const encodedStringUser = localStorage.getItem(this.USER);
        const token = this.getToken();
        if (encodedStringUser && token) {
            const decodedUser = CryptoJS.AES.decrypt(JSON.parse(encodedStringUser).toString(), token);
            return Promise.resolve(JSON.parse(decodedUser.toString(CryptoJS.enc.Utf8)) as User);
        } else {
            return Promise.resolve(undefined);
        }
    }
}
