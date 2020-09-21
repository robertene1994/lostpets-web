import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';
import { MessageService } from './../../shared/services/message/message.service';

import { User } from '../../shared/model/user';
import { Role } from '../../shared/model/types/role';
import { UserStatus } from './../../shared/model/types/user-status';

import { emailPattern } from '../../app.config';

/**
 * Componente de la pantalla que permite el registro de nuevos usuarios
 * en el sistema.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {

    private emailRegExp: RegExp;
    private uniqueEmail: boolean;

    private user: User;
    private repeatedPassword: string;

    constructor(
        private title: Title,
        private router: Router,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private notificationsService: NotificationsService,
        private userService: UserService,
        private messageService: MessageService) {
        this.emailRegExp = new RegExp(emailPattern);
        this.uniqueEmail = true;
        this.user = new User();
        this.user.role = Role.USER;
        this.user.status = UserStatus.ENABLED;
    }

    ngOnInit() {
        this.title.setTitle('LostPets: Registrarse');
        this.checkUserSession();
    }

    async signUp() {
        this.spinnerService.showSpinner();
        if (!this.checkValidUser()) {
            this.notificationsService.showError('Registrarse', '¡Por favor, revise todos los datos introducidos!');
        } else {
            const user = await this.userService.signUp(this.user)
                .catch(err => this.errorHandlerService.handleError(err));
            if (user) {
                this.router.navigate(['/login'], { queryParams: { registered: true } });
            }
        }
        this.spinnerService.hideSpinner();
    }

    checkValidEmail() {
        if (this.user !== undefined && this.user.email !== undefined) {
            return this.user.email.trim().length > 0 && this.emailRegExp.test(this.user.email) && this.uniqueEmail;
        }
    }

    checkInvalidEmail() {
        if (this.user !== undefined && this.user.email !== undefined) {
            return this.user.email.trim().length === 0 || !this.emailRegExp.test(this.user.email) || !this.uniqueEmail;
        }
    }

    checkUniqueEmail() {
        this.uniqueEmail = true;
        if (this.user.email !== undefined && this.emailRegExp.test(this.user.email)) {
            this.userService.checkUniqueEmail(this.user.email).then((uniqueEmail) => {
                this.uniqueEmail = uniqueEmail;
            });
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

    signUpButtonState() {
        return !this.checkValidUser();
    }

    private checkValidUser() {
        if (!this.user
            || !this.checkValidField(this.user.email) || !this.checkValidEmail() || !this.uniqueEmail
            || !this.checkValidPhone()
            || !this.checkValidField(this.user.password) || !this.checkValidField(this.repeatedPassword) || !this.checkPasswords()
            || !this.checkValidField(this.user.firstName)
            || !this.checkValidField(this.user.lastName)) {
            return false;
        }
        return true;
    }

    private async checkUserSession() {
        const user = await this.userService.getLoggedUser();
        if (user) {
            if (user.status === UserStatus.ENABLED) {
                this.messageService.startMessagingConnection();
                this.router.navigate(['/ads']);
            } else {
                this.router.navigate(['/login'], { queryParams: { userStatus: true } });
            }
        }
    }
}
