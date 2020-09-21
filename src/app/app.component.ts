import { Component, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Params } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { Subject, Subscription } from 'rxjs';

import { SpinnerService } from './shared/services/spinner/spinner.service';
import { NotificationsService } from './shared/services/notifications/notifications.service';
import { UserService } from './shared/services/user/user.service';
import { MessageService } from './shared/services/message/message.service';

import { Message } from './shared/model/message';
import { MessageStatus } from './shared/model/types/message-status';

/**
 * Componente principal (raíz) de la aplicación que se encarga del manejo de la barra
 * de navegacion superior.
 *
 * @author Robert Ene
 */
@Component({
    selector: 'app-lostpets',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
    private actualRoute: string;
    private messageSubject: Subject<Message>;
    private messageSubscription: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        private location: PlatformLocation,
        private spinnerService: SpinnerService,
        private notificationsService: NotificationsService,
        private userService: UserService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.checkQueryParams();
        this.checkActualRoute();
        this.checkOnBackPressed();
        this.initConnectionAndSubscription();
    }

    ngAfterViewChecked() {
        this.changeDetector.detectChanges();
    }

    goToAddAd() {
        if (this.actualRoute && !this.actualRoute.startsWith('/add-ad')) {
            this.router.navigate(['/add-ad'], { queryParams: { from: this.actualRoute } });
        }
    }

    goToUserProfile() {
        if (this.actualRoute && !this.actualRoute.startsWith('/user-profile')) {
            this.router.navigate(['/user-profile'], { queryParams: { from: this.actualRoute } });
        }
    }

    logOut() {
        this.messageService.stopMessagingConnection();
        this.userService.logOut();
        this.router.navigate(['/']);
    }

    getSpinnerService() {
        return this.spinnerService;
    }

    ngOnDestroy(): void {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
    }

    private checkActualRoute() {
        this.router.events.subscribe((event: NavigationEnd) => {
            let url = event.urlAfterRedirects;
            if (url) {
                if (url.indexOf('?') !== -1) {
                    url = url.substr(0, url.indexOf('?'));
                }
                this.actualRoute = url;
            }
        });
    }

    private checkQueryParams() {
        this.route.queryParams.subscribe((params: Params) => {
            const updatedAd = params.updatedAd;
            if (updatedAd && updatedAd === 'true') {
                this.notificationsService.showSuccess(
                    'Modificar Anuncio',
                    '¡El anuncio de la mascota perdida ha sido modificado correctamente!'
                );
            }

            const savedAd = params.savedAd;
            if (savedAd && savedAd === 'true') {
                this.notificationsService.showSuccess(
                    'Nuevo Anuncio',
                    '¡El anuncio de la mascota perdida ha sido publicado correctamente!'
                );
            }

            const updatedUserProfile = params.updatedUserProfile;
            if (updatedUserProfile && updatedUserProfile === 'true') {
                this.notificationsService.showSuccess(
                    'Mi Perfil',
                    '¡Los datos de su cuenta de usuario han sido modificados correctamente!'
                );
            }
        });
    }

    private checkOnBackPressed() {
        this.location.onPopState(/* istanbul ignore next */ () => this.checkLocation());
    }

    private checkLocation() {
        if (this.location.pathname === '/login' || this.location.pathname === '/signup') {
            this.userService.logOut();
        }
    }

    private async initConnectionAndSubscription() {
        if (await this.userService.getLoggedUser()) {
            this.messageService.startMessagingConnection();
            setTimeout(() => {
                this.messageSubject = this.messageService.getMessageSubject();
                if (this.messageSubject) {
                    this.messageSubscription = this.messageSubject.subscribe((message) => {
                        if (!this.messageService.getChatIsVisible()) {
                            message.messageStatus = MessageStatus.DELIVERED;
                            this.messageService.sendMessage(message, message.fromUser.email);
                            this.notificationsService.showMessage(
                                `${message.fromUser.lastName} ${message.fromUser.firstName}`,
                                message.content
                            );
                        }
                    });
                }
            }, 500);
        }
    }
}
