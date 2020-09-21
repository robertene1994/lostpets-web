import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';
import { MessageService } from '../../shared/services/message/message.service';

import { AccountCredentials } from '../../shared/model/account-credentials';
import { UserStatus } from 'src/app/shared/model/types/user-status';

import { emailPattern } from '../../app.config';

/**
 * Componente de la pantalla que permite a los usuarios el inicio de sesión
 * en el sistema.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    private emailRegExp: RegExp;
    private account: AccountCredentials;

    constructor(
        private title: Title,
        private router: Router,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private notificationsService: NotificationsService,
        private userService: UserService,
        private messageService: MessageService) {
        this.emailRegExp = new RegExp(emailPattern);
        this.account = new AccountCredentials();
    }

    ngOnInit() {
        this.title.setTitle('LostPets: Iniciar Sesión');
        this.checkUserSession();
        this.checkQueryParams();
    }

    async logIn() {
        this.spinnerService.showSpinner();
        if (!this.checkValidCredentials()) {
            this.notificationsService.showError('Iniciar Sesión', '¡El correo electrónico y la contraseña son obligatorios!');
        } else {
            await this.userService.logIn(this.account)
                .catch(err => this.errorHandlerService.handleError(err));
            const user = await this.userService.getLoggedUser();
            if (user) {
                if (user.status === UserStatus.ENABLED) {
                    this.messageService.startMessagingConnection();
                    this.router.navigate(['/ads']);
                } else {
                    this.userService.logOut();
                    this.notificationsService.showWarn('Iniciar Sesión',
                        '¡Su cuenta ha sido desactivada! ¡Póngase en contacto con el administrador del sistema!');
                }
            }
        }
        this.spinnerService.hideSpinner();
    }

    logInButtonState() {
        return !this.checkValidCredentials();
    }

    checkValidEmail() {
        if (this.account !== undefined && this.account.email !== undefined) {
            return this.account.email.trim().length > 0 && this.emailRegExp.test(this.account.email);
        }
    }

    checkInvalidEmail() {
        if (this.account !== undefined && this.account.email !== undefined) {
            return this.account.email.trim().length === 0 || !this.emailRegExp.test(this.account.email);
        }
    }

    checkValidField(value: string) {
        return value === undefined || value.trim().length === 0;
    }

    checkEmptyField(value: string) {
        if (value !== undefined) {
            return value.trim().length === 0;
        }
    }

    private checkValidCredentials() {
        if (this.account === undefined ||
            this.checkValidField(this.account.email) ||
            this.checkInvalidEmail() ||
            this.checkValidField(this.account.password)) {
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

    private checkQueryParams() {
        this.route.queryParams.subscribe((params: Params) => {
            const registered = params.registered;
            const userStatus = params.userStatus;
            const roleNotAllowed = params.roleNotAllowed;
            if (registered && registered === 'true') {
                this.notificationsService.showSuccess('Registrarse', '¡Su cuenta ha sido creada correctamente!');
            }
            if (userStatus && userStatus === 'true') {
                this.userService.logOut();
                this.notificationsService.showWarn('Iniciar Sesión',
                    '¡Su cuenta ha sido desactivada! ¡Póngase en contacto con el administrador del sistema!');
            }
            if (roleNotAllowed && roleNotAllowed === 'true') {
                this.userService.logOut();
                this.notificationsService.showWarn('Iniciar Sesión',
                    '¡Su cuenta de usuario no tiene el rol necesario para acceder a esta página!');
            }
        });
    }
}
