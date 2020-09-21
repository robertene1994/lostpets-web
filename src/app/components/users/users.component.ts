import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { SpinnerService } from '../../shared/services/spinner/spinner.service';
import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { NotificationsService } from '../../shared/services/notifications/notifications.service';
import { UserService } from '../../shared/services/user/user.service';

import { User } from '../../shared/model/user';
import { UserStatus } from 'src/app/shared/model/types/user-status';

/**
 * Componente que se encarga de manejar todos los usuarios registrados
 * en el sistema.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit {

    private users: (User & { statusBoolean?: boolean })[];
    private pageOfUsers: (User & { statusBoolean?: boolean })[];

    constructor(
        private title: Title,
        private spinnerService: SpinnerService,
        private errorHandlerService: ErrorHandlerService,
        private notificationsService: NotificationsService,
        private userService: UserService) { }

    async ngOnInit() {
        this.title.setTitle('LostPets: Usuarios');
        this.spinnerService.showSpinner();
        await this.getUsers();
        this.spinnerService.hideSpinner();
    }

    async getUsers() {
        const users = await this.userService.getUsers()
            .catch(err => this.errorHandlerService.handleError(err));
        if (users) {
            this.users = users;
            this.users.forEach(user => {
                user.statusBoolean = user.status === UserStatus.ENABLED
                    ? true : false;
            });
        }
    }

    async updateUserStatus(user: User & { statusBoolean?: boolean }) {
        user.status = user.statusBoolean === true
            ? UserStatus.DISABLED : UserStatus.ENABLED;
        await this.userService.updateUserStatus(user.email, user.status)
            .catch(err => this.errorHandlerService.handleError(err));
        this.notificationsService.showInfo('Usuarios',
            '¡El estado del usuario ha sido actualizado correctamente!');
    }

    onChangePage(pageOfUsers: (User & { statusBoolean?: boolean })[]) {
        this.checkPaginationComponent();
        this.pageOfUsers = pageOfUsers;
    }

    private checkPaginationComponent() {
        if (this.users && this.users.length > 0) {
            document.getElementsByClassName('page-item first-item')[0].
                firstChild.textContent = 'Primero';
            document.getElementsByClassName('page-item previous-item')[0]
                .firstChild.textContent = 'Anterior';
            document.getElementsByClassName('page-item next-item')[0]
                .firstChild.textContent = 'Siguiente';
            document.getElementsByClassName('page-item last-item')[0]
                .firstChild.textContent = 'Último';
        }
    }
}
