import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';

import { AccountCredentials } from './../../shared/model/account-credentials';
import { User } from '../../shared/model/user';

import { emailPattern } from '../../app.config';

/**
 * Componente que se encarga de manejar la modificación y actualización de
 * los datos de la cuenta de un determinado usuario.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

    private previousRoute: string;

    private emailRegExp: RegExp;
    private uniqueEmail: boolean;
    private account: AccountCredentials;

    private originalUser: User;
    private user: User;

    private validOldPassword: boolean;
    private repeatedPassword: string;

    constructor(
        private title: Title,
        private router: Router,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private notificationsService: NotificationsService,
        private userService: UserService) {
        this.emailRegExp = new RegExp(emailPattern);
        this.uniqueEmail = true;
        this.account = new AccountCredentials();
        this.user = new User();
    }

    async ngOnInit() {
        this.title.setTitle('LostPets: Mi Perfil');
        this.spinnerService.showSpinner();
        this.getPreviousRoute();
        this.originalUser = await this.userService.getLoggedUser();
        this.account.email = this.originalUser.email;
        this.user = Object.assign({}, this.originalUser);
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

    async updateUser() {
        this.spinnerService.showSpinner();
        if (!this.checkValidUser()) {
            this.notificationsService.showError('Mi Perfil',
                '¡Por favor, revise todos los datos introducidos!');
        } else {
            const user = await this.userService.updateUser(this.user)
                .catch(err => this.errorHandlerService.handleError(err));
            if (user) {
                this.userService.updateLoggedUser(user);
                this.router.navigate([this.previousRoute],
                    { queryParams: { updatedUserProfile: true } });
            }
        }
        this.spinnerService.hideSpinner();
    }

    checkValidEmail() {
        if (this.user !== undefined && this.user.email !== undefined) {
            return this.user.email.trim().length > 0
                && this.emailRegExp.test(this.user.email) && this.uniqueEmail;
        }
    }

    checkInvalidEmail() {
        if (this.user !== undefined && this.user.email !== undefined) {
            return this.user.email.trim().length === 0
                || !this.emailRegExp.test(this.user.email) || !this.uniqueEmail;
        }
    }

    checkUniqueEmail() {
        this.uniqueEmail = true;
        if (this.user.email !== undefined && this.emailRegExp.test(this.user.email)) {
            if (this.user.email === this.originalUser.email) {
                this.uniqueEmail = true;
            } else {
                this.userService.checkUniqueEmail(this.user.email).then(uniqueEmail => {
                    this.uniqueEmail = uniqueEmail;
                }).catch(err => this.errorHandlerService.handleError(err));
            }
        }
    }

    checkValidOldPassword() {
        if (this.account !== undefined && this.account.password !== undefined) {
            return this.account.password.trim().length > 0 && this.validOldPassword;
        }
    }

    checkInvalidOldPassword() {
        if (this.account !== undefined && this.account.password !== undefined) {
            return this.account.password.trim().length === 0 || !this.validOldPassword;
        }
    }

    checkOldPassword() {
        if (this.account.password !== undefined && this.account.password.trim().length > 0) {
            this.userService.checkValidUserPassword(this.account).then(validOldPassword => {
                this.validOldPassword = validOldPassword;
            }).catch(err => this.errorHandlerService.handleError(err));
        }
    }

    checkPasswords() {
        return this.user.password === this.repeatedPassword;
    }

    checkValidPhone() {
        if (this.user !== undefined && this.user.phone !== undefined) {
            return this.user.phone !== null;
        }
    }

    checkInvalidPhone() {
        if (this.user !== undefined && this.user.phone !== undefined) {
            return this.user.phone === null;
        }
    }

    checkValidField(value: string) {
        return value && value.trim().length > 0;
    }

    checkEmptyField(value: string) {
        if (value !== undefined) {
            return !value || value.trim().length === 0;
        }
    }

    updateUserButtonState() {
        return !this.checkValidUser();
    }

    private checkValidUser() {
        if (!this.user
            || !this.checkValidField(this.user.email)
            || !this.checkValidEmail()
            || !this.uniqueEmail
            || !this.checkValidPhone()
            || !this.checkValidField(this.user.firstName)
            || !this.checkValidField(this.user.lastName)
            || !this.checkValidField(this.account.password)
            || !this.validOldPassword
            || !this.checkValidField(this.user.password)
            || !this.checkValidField(this.repeatedPassword)
            || !this.checkPasswords()) {
            return false;
        }
        return true;
    }
}
